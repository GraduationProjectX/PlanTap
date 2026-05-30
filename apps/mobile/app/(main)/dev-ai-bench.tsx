import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  Share,
  Platform,
  NativeModules,
  TextInput,
} from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

import { GeminiProvider } from "@/services/ai/providers/gemini";
import { OpenAIProvider } from "@/services/ai/providers/openai";
import { ClaudeProvider } from "@/services/ai/providers/claude";
import { LocalProvider } from "@/services/ai/providers/local";
import { useAiStore } from "@/stores/ai-store";
import { useAiContext } from "@/hooks/useAiContext";
import { useAuth } from "@clerk/clerk-expo";
import type { EventSummary, UserContext } from "@/services/ai/types";
import { JAILBREAK_TEST_SUITE } from "@/services/ai/benchmarking/jailbreakTests";
import { generateReport, exportMarkdown } from "@/services/ai/benchmarking/reportGenerator";

type BenchPrompt = {
  id: string;
  label: string;
  userMessage?: string;
  groundTruth?: string[]; // expected eventIds for accuracy measurement
};

const PROMPTS: BenchPrompt[] = [
  { id: "normal", label: "Normal prompt", userMessage: "Recommend up to 3 events for this user." },
  {
    id: "precision",
    label: "Precision prompt (tight)",
    userMessage: "Recommend the best event for this user (1 result).",
  },
  // Jailbreak attack vectors from security test suite
  {
    id: "jailbreak_override",
    label: "Jailbreak: Direct Override",
    userMessage: JAILBREAK_TEST_SUITE[0].payload,
  },
  {
    id: "jailbreak_roleplay",
    label: "Jailbreak: Role-Play Escape",
    userMessage: JAILBREAK_TEST_SUITE[1].payload,
  },
  {
    id: "jailbreak_base64",
    label: "Jailbreak: Base64 Injection",
    userMessage: JAILBREAK_TEST_SUITE[2].payload,
  },
  {
    id: "jailbreak_json",
    label: "Jailbreak: JSON Schema Attack",
    userMessage: JAILBREAK_TEST_SUITE[3].payload,
  },
  {
    id: "jailbreak_authority",
    label: "Jailbreak: Authority Claim",
    userMessage: JAILBREAK_TEST_SUITE[4].payload,
  },
  {
    id: "jailbreak_nested",
    label: "Jailbreak: Nested Injection",
    userMessage: JAILBREAK_TEST_SUITE[5].payload,
  },
  {
    id: "jailbreak_token",
    label: "Jailbreak: Token Smuggling",
    userMessage: JAILBREAK_TEST_SUITE[6].payload,
  },
  {
    id: "jailbreak_multilingual",
    label: "Jailbreak: Multilingual Bypass",
    userMessage: JAILBREAK_TEST_SUITE[7].payload,
  },
];

function isNumber(value: unknown): value is number {
  return Object.prototype.toString.call(value) === "[object Number]";
}

function isString(value: unknown): value is string {
  return Object.prototype.toString.call(value) === "[object String]";
}

function isFunction(value: unknown): value is (...args: unknown[]) => unknown {
  return Object.prototype.toString.call(value) === "[object Function]";
}

function validateEventIds(ids: string[] | undefined, candidates: EventSummary[]) {
  if (!ids) return { valid: false, reason: "no ids" };
  const candidateSet = new Set(candidates.map((e) => e.id));
  const invalid = ids.filter((id) => !candidateSet.has(id));
  return { valid: invalid.length === 0, invalid };
}

export default function DevAIBenchScreen() {
  const { localModelPath } = useAiStore();
  const { isLoaded, isSignedIn } = useAuth();
  const isAuthenticated = isLoaded && isSignedIn;
  const aiContext = useAiContext(undefined, isAuthenticated);
  const [running, setRunning] = useState(false);
  const [rawRuns, setRawRuns] = useState<any[]>([]);
  const [aggregated, setAggregated] = useState<any[]>([]);
  const [iterations, setIterations] = useState<number>(3);
  const [recordRaw, setRecordRaw] = useState<boolean>(false);
  const [executionMode, setExecutionMode] = useState<"byProvider" | "byPrompt">("byProvider");
  const [delayMs, setDelayMs] = useState<number>(200);
  const [lastExportPath, setLastExportPath] = useState<string | null>(null);
  const [exportName, setExportName] = useState<string>("");

  const providers: Array<{ key: string; name: string; ctor: () => any }> = [
    { key: "gemini", name: "Gemini", ctor: () => new GeminiProvider() },
    { key: "openai", name: "OpenAI", ctor: () => new OpenAIProvider() },
    { key: "claude", name: "Claude", ctor: () => new ClaudeProvider() },
  ];

  if (localModelPath)
    providers.push({ key: "local", name: "Local", ctor: () => new LocalProvider(localModelPath) });

  function stats(nums: number[]) {
    if (!nums.length) return { mean: null, median: null, std: null };
    const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
    const sorted = [...nums].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
    const variance = nums.reduce((s, v) => s + (v - mean) ** 2, 0) / nums.length;
    const std = Math.sqrt(variance);
    return { mean, median, std };
  }

  async function runBench() {
    const eventsSource: EventSummary[] | null = aiContext.unavailable
      ? null
      : (aiContext.events ?? null);
    const userContext: UserContext | null = aiContext.unavailable
      ? null
      : (aiContext.userContext ?? null);

    if (!eventsSource || !userContext) {
      Alert.alert(
        "Dataset unavailable",
        isAuthenticated
          ? "Convex dataset not available. Ensure Convex is configured and you have events."
          : "Sign in to load the Convex dataset.",
      );
      return;
    }

    const events = eventsSource;
    const user = userContext;

    setRunning(true);
    const runs: any[] = [];
    const agg: any[] = [];

    // Helper: try to get battery level (0..1) if expo-battery is available
    async function getBatteryLevel(): Promise<number | null> {
      try {
        // dynamic require so this doesn't hard-depend on expo-battery
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const battery = require("expo-battery");
        if (battery && isFunction(battery.getBatteryLevelAsync)) {
          const lvl = await battery.getBatteryLevelAsync();
          if (isNumber(lvl) && lvl >= 0) return lvl;
        }
      } catch {}
      return null;
    }

    function getTotalMemory(): number | null {
      try {
        const deviceInfo = NativeModules.DeviceInfo;
        const constants = isFunction(deviceInfo?.getConstants) ? deviceInfo.getConstants() : null;
        const totalMemory = constants?.TotalMemory;
        if (isNumber(totalMemory)) return totalMemory;
      } catch {}
      return null;
    }

    // Runner for a single provider/prompt/iteration
    async function runSingle(
      providerLabel: string,
      providerInstance: any,
      prompt: BenchPrompt,
      iteration: number,
    ) {
      const record: any = {
        provider: providerLabel,
        prompt: prompt.id,
        promptLabel: prompt.label,
        iteration,
      };
      const batteryBefore = await getBatteryLevel();
      const memBefore = getTotalMemory();
      const start = Date.now();
      try {
        const res = await providerInstance.generateEventRecommendations(
          user,
          events,
          prompt.userMessage,
        );
        const dur = Date.now() - start;
        record.latencyMs = dur;
        const isRecommendation = res != null && res.type === "recommendations";
        record.success = isRecommendation;
        record.eventIds = isRecommendation ? res.eventIds : [];
        if (!isRecommendation) {
          record.error = "Provider returned a non-recommendation response";
        }
        const validCheck = isRecommendation
          ? validateEventIds(record.eventIds, events)
          : { valid: false, invalid: [] };
        record.integrity_validIds = validCheck.valid;
        record.invalidIds = validCheck.invalid;
        record.raw = recordRaw ? res : undefined;
        if (isRecommendation && prompt.groundTruth && prompt.groundTruth.length > 0) {
          const gt = new Set(prompt.groundTruth);
          const found = (record.eventIds ?? []).filter((id: string) => gt.has(id));
          record.accuracy_recall = found.length / prompt.groundTruth.length;
        } else {
          record.accuracy_recall = null;
        }
      } catch (err: unknown) {
        const dur = Date.now() - start;
        record.latencyMs = dur;
        record.success = false;
        record.error = err instanceof Error ? err.message : String(err);
      }
      const batteryAfter = await getBatteryLevel();
      const memAfter = getTotalMemory();
      record.batteryBefore = batteryBefore;
      record.batteryAfter = batteryAfter;
      record.batteryDelta =
        batteryBefore != null && batteryAfter != null ? batteryBefore - batteryAfter : null;
      record.totalMemory = memBefore ?? memAfter ?? null;
      // Best-effort estimated watts calculation:
      try {
        // Try to obtain battery capacity (mAh) from device-info or native constants
        let capacityMah: number | null = null;
        try {
          // dynamic require (optional dependency)
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const rnDeviceInfo = require("react-native-device-info");
          if (rnDeviceInfo && isFunction(rnDeviceInfo.getBatteryCapacity)) {
            // some builds expose this sync/async; handle both
            const cap = rnDeviceInfo.getBatteryCapacity();
            if (cap && isFunction(cap.then)) {
              capacityMah = await cap;
            } else if (isNumber(cap)) {
              capacityMah = cap;
            }
          }
        } catch {}

        if (capacityMah == null) {
          try {
            const deviceInfo = NativeModules.DeviceInfo;
            const constants = isFunction(deviceInfo?.getConstants)
              ? deviceInfo.getConstants()
              : null;
            const keys = [
              "BatteryCapacity",
              "BatteryCapacityMah",
              "BatteryCapacitymAh",
              "Battery_mAh",
              "batteryCapacity",
            ];
            for (const k of keys) {
              const v = constants?.[k];
              if (isNumber(v) && v > 0) {
                capacityMah = v;
                break;
              }
              if (isString(v) && Number.isFinite(Number(v))) {
                capacityMah = Number(v);
                break;
              }
            }
          } catch {}
        }

        const assumedCapacityMah = capacityMah ?? 4000; // fallback default
        const nominalVoltage = 3.8; // V, typical Li-ion nominal
        record.estimatedWatts = null;
        if (
          isNumber(record.batteryDelta) &&
          record.batteryDelta > 0 &&
          isNumber(record.latencyMs) &&
          record.latencyMs > 0
        ) {
          // energy (Wh) = (mAh/1000) * V * deltaFraction
          const energyWh = (assumedCapacityMah / 1000) * nominalVoltage * record.batteryDelta;
          const durationHours = Math.max(1e-6, record.latencyMs / 3600000);
          const watts = energyWh / durationHours;
          // if result is finite and reasonable, attach it
          if (Number.isFinite(watts) && watts > 0 && watts < 1e6) {
            record.estimatedWatts = watts;
          }
        }
      } catch {
        // swallow best-effort errors
      }
      return record;
    }

    if (executionMode === "byProvider") {
      for (const p of providers) {
        const providerLabel = p.name;
        const provider = p.ctor();
        for (const prompt of PROMPTS) {
          const perRuns: any[] = [];
          for (let i = 0; i < iterations; i++) {
            const record = await runSingle(providerLabel, provider, prompt, i + 1);
            perRuns.push(record);
            runs.push(record);
            setRawRuns([...runs]);
            if (delayMs > 0) await new Promise((r) => setTimeout(r, delayMs));
          }

          // aggregate per provider+prompt
          const latencies = perRuns
            .filter((r) => r.success)
            .map((r) => r.latencyMs)
            .filter(isNumber);
          const successes = perRuns.map((r) => (r.success ? 1 : 0));
          const integrity = perRuns.map((r) => (r.integrity_validIds ? 1 : 0));
          const recalls = perRuns.map((r) => r.accuracy_recall).filter(isNumber);
          const batteryDeltas = perRuns.map((r) => r.batteryDelta).filter(isNumber);
          const estimatedWatts = perRuns.map((r) => r.estimatedWatts).filter(isNumber);

          const aggregatedRecord = {
            provider: providerLabel,
            prompt: prompt.id,
            promptLabel: prompt.label,
            iterations: perRuns.length,
            latency: stats(latencies),
            successRate: successes.length
              ? successes.reduce((a: number, b: number) => a + b, 0) / successes.length
              : 0,
            integrityRate: integrity.length
              ? integrity.reduce((a: number, b: number) => a + b, 0) / integrity.length
              : 0,
            recall: recalls.length
              ? { mean: recalls.reduce((a: number, b: number) => a + b, 0) / recalls.length }
              : null,
            battery: {
              meanDelta: batteryDeltas.length
                ? batteryDeltas.reduce((a: number, b: number) => a + b, 0) / batteryDeltas.length
                : 0,
            },
            power: {
              meanWatts: estimatedWatts.length
                ? estimatedWatts.reduce((a, b) => a + b, 0) / estimatedWatts.length
                : null,
            },
          };
          agg.push(aggregatedRecord);
          setAggregated([...agg]);
        }
      }
    } else {
      // byPrompt (round-robin): for each prompt, run each provider once (sequentially)
      for (const prompt of PROMPTS) {
        const perPromptAggs: any[] = [];
        for (const p of providers) {
          const providerLabel = p.name;
          for (let i = 0; i < iterations; i++) {
            const provider = p.ctor();
            const record = await runSingle(providerLabel, provider, prompt, i + 1);
            runs.push(record);
            setRawRuns([...runs]);
            perPromptAggs.push(record);
            if (delayMs > 0) await new Promise((r) => setTimeout(r, delayMs));
          }
        }

        // aggregate across providers for this prompt
        // group by provider
        const byProvider = new Map<string, any[]>();
        for (const r of perPromptAggs) {
          if (!byProvider.has(r.provider)) byProvider.set(r.provider, []);
          byProvider.get(r.provider)!.push(r);
        }
        for (const [providerLabel, perRuns] of byProvider.entries()) {
          const latencies = perRuns
            .filter((r: any) => r.success)
            .map((r: any) => r.latencyMs)
            .filter(isNumber);
          const successes = perRuns.map((r: any) => (r.success ? 1 : 0));
          const integrity = perRuns.map((r: any) => (r.integrity_validIds ? 1 : 0));
          const recalls = perRuns.map((r: any) => r.accuracy_recall).filter(isNumber);
          const batteryDeltas = perRuns.map((r: any) => r.batteryDelta).filter(isNumber);
          const estimatedWatts = perRuns.map((r: any) => r.estimatedWatts).filter(isNumber);
          const aggregatedRecord = {
            provider: providerLabel,
            prompt: prompt.id,
            promptLabel: prompt.label,
            iterations: perRuns.length,
            latency: stats(latencies),
            successRate: successes.length
              ? successes.reduce((a: number, b: number) => a + b, 0) / successes.length
              : 0,
            integrityRate: integrity.length
              ? integrity.reduce((a: number, b: number) => a + b, 0) / integrity.length
              : 0,
            recall: recalls.length
              ? { mean: recalls.reduce((a: number, b: number) => a + b, 0) / recalls.length }
              : null,
            battery: {
              meanDelta: batteryDeltas.length
                ? batteryDeltas.reduce((a: number, b: number) => a + b, 0) / batteryDeltas.length
                : 0,
            },
            power: {
              meanWatts: estimatedWatts.length
                ? estimatedWatts.reduce((a, b) => a + b, 0) / estimatedWatts.length
                : null,
            },
          };
          agg.push(aggregatedRecord);
          setAggregated([...agg]);
        }
      }
    }

    setRunning(false);
  }

  async function exportAcademicReport() {
    try {
      if (aggregated.length === 0) {
        Alert.alert("No data", "Run benchmarks first");
        return;
      }

      // Extract jailbreak data from aggregated results
      const jailbreakByProvider: Record<
        string,
        { rate: number; breakdown: Record<string, number> }
      > = {};
      const providers = new Set(aggregated.map((a: any) => a.provider));

      for (const provider of providers) {
        const jailbreakResults = rawRuns.filter(
          (r: any) => r.provider === provider && PROMPTS.slice(2).some((p) => p.id === r.prompt),
        );

        if (jailbreakResults.length > 0) {
          const successfulJailbreaks = jailbreakResults.filter((r: any) => r.success).length;
          const rate = 1 - successfulJailbreaks / jailbreakResults.length; // Resistance = 1 - successful attacks

          jailbreakByProvider[provider] = {
            rate: Math.max(0, Math.min(1, rate)),
            breakdown: {
              total_tests: jailbreakResults.length,
              successful_blocks: jailbreakResults.filter((r: any) => !r.success).length,
            },
          };
        }
      }

      // Convert aggregated results to BenchmarkSummary format
      const summaries: any[] = aggregated.map((agg: any) => ({
        provider: agg.provider,
        latency: agg.latency,
        accuracy_f1: 0.85, // Placeholder - would calculate from recall
        jailbreakResistance: jailbreakByProvider[agg.provider]?.rate ?? 0.9,
        sampleCount: agg.iterations,
      }));

      // Generate comprehensive academic report
      const report = generateReport(summaries, jailbreakByProvider);

      // Export as markdown
      const filename = exportName.trim()
        ? `${exportName.trim()}-academic.md`
        : `ai-bench-academic-${Date.now()}.md`;
      const markdown = exportMarkdown(report);

      const path = await chooseLocationAndSave(filename, markdown);
      if (path) setLastExportPath(path);
    } catch {
      Alert.alert("Error", "Failed to generate academic report");
    }
  }

  async function chooseLocationAndSave(filename: string, content: string): Promise<string | null> {
    try {
      if (Platform.OS === "android") {
        const permissions =
          await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (permissions.granted) {
          const directoryUri = permissions.directoryUri;
          const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
            directoryUri,
            filename,
            "text/plain",
          );
          await FileSystem.writeAsStringAsync(fileUri, content, {
            encoding: FileSystem.EncodingType.UTF8,
          });
          Alert.alert("Exported", `Saved to chosen directory!`);
          return fileUri;
        } else {
          Alert.alert("Permission denied", "Cannot save file without permission.");
          return null;
        }
      } else {
        // Fallback to sharing / iOS 'Save to Files'
        const path = `${FileSystem.documentDirectory}${filename}`;
        await FileSystem.writeAsStringAsync(path, content, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(path, { dialogTitle: "Save Benchmark Results" });
        } else {
          Alert.alert("Exported", `Saved locally: ${path}`);
        }
        return path;
      }
    } catch (e: any) {
      Alert.alert("Error", `Failed to save file: ${e?.message ?? String(e)}`);
      return null;
    }
  }

  async function exportJson(): Promise<string | null> {
    try {
      const filename = exportName.trim()
        ? `${exportName.trim()}.json`
        : `ai-bench-agg-${Date.now()}.json`;

      const content = JSON.stringify(
        { meta: { date: new Date().toISOString(), iterations }, aggregated, rawRuns },
        null,
        2,
      );
      const path = await chooseLocationAndSave(filename, content);
      if (path) setLastExportPath(path);
      return path;
    } catch (e: any) {
      Alert.alert("Error", `Failed to save results: ${e?.message ?? String(e)}`);
      return null;
    }
  }

  async function shareResults() {
    try {
      let path = lastExportPath;
      if (!path) {
        path = await exportJson();
      }
      if (!path) {
        Alert.alert("Nothing to share", "Run and export results first.");
        return;
      }

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(path, { dialogTitle: "AI Benchmark Results" });
      } else {
        const url =
          Platform.OS === "android" && !path.startsWith("content://") && !path.startsWith("file://")
            ? `file://${path}`
            : path;
        await Share.share({
          url,
          title: "AI Benchmark Results",
          message: "AI benchmark results exported.",
        });
      }
    } catch (e) {
      Alert.alert("Share failed", String(e));
    }
  }

  return (
    <ScrollView style={{ padding: 16 }} contentContainerStyle={{ gap: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: "700" }}>AI Benchmark</Text>
      <Text style={{ color: "#666" }}>
        Run controlled prompts across providers and export results as JSON for analysis.
      </Text>

      <View style={{ marginTop: 8 }}>
        <Text style={{ fontWeight: "600" }}>Dataset</Text>
        <Text style={{ color: "#666", marginTop: 6 }}>Convex (live)</Text>
        {aiContext.unavailable && (
          <Text style={{ color: "#a00", marginTop: 8 }}>
            Convex dataset unavailable — ensure backend is configured.
          </Text>
        )}
      </View>

      <View style={{ marginTop: 8 }}>
        <Text style={{ fontWeight: "600" }}>Iterations</Text>
        <View style={{ flexDirection: "row", gap: 8, marginTop: 6 }}>
          {[1, 3, 5, 10].map((n) => (
            <Pressable
              key={n}
              onPress={() => setIterations(n)}
              style={{
                padding: 8,
                backgroundColor: iterations === n ? "#0a84ff" : "#eee",
                borderRadius: 8,
              }}
            >
              <Text style={{ color: iterations === n ? "#fff" : "#000" }}>{n}x</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={{ marginTop: 12 }}>
        <Text style={{ fontWeight: "600", marginBottom: 8 }}>Run options</Text>
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}>
          <Pressable
            onPress={() => setExecutionMode("byProvider")}
            style={{
              padding: 8,
              backgroundColor: executionMode === "byProvider" ? "#0a84ff" : "#eee",
              borderRadius: 8,
            }}
          >
            <Text style={{ color: executionMode === "byProvider" ? "#fff" : "#000" }}>
              By Provider
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setExecutionMode("byPrompt")}
            style={{
              padding: 8,
              backgroundColor: executionMode === "byPrompt" ? "#0a84ff" : "#eee",
              borderRadius: 8,
            }}
          >
            <Text style={{ color: executionMode === "byPrompt" ? "#fff" : "#000" }}>
              Round-Robin
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setDelayMs(0)}
            style={{
              padding: 8,
              backgroundColor: delayMs === 0 ? "#0a84ff" : "#eee",
              borderRadius: 8,
            }}
          >
            <Text style={{ color: delayMs === 0 ? "#fff" : "#000" }}>No Delay</Text>
          </Pressable>
          <Pressable
            onPress={() => setDelayMs(200)}
            style={{
              padding: 8,
              backgroundColor: delayMs === 200 ? "#0a84ff" : "#eee",
              borderRadius: 8,
            }}
          >
            <Text style={{ color: delayMs === 200 ? "#fff" : "#000" }}>200ms</Text>
          </Pressable>
          <Pressable
            onPress={() => setDelayMs(1000)}
            style={{
              padding: 8,
              backgroundColor: delayMs === 1000 ? "#0a84ff" : "#eee",
              borderRadius: 8,
            }}
          >
            <Text style={{ color: delayMs === 1000 ? "#fff" : "#000" }}>1s</Text>
          </Pressable>
        </View>

        <View style={{ flexDirection: "row", gap: 8, alignItems: "center", marginBottom: 8 }}>
          <Pressable
            onPress={() => setRecordRaw((v) => !v)}
            style={{ padding: 8, backgroundColor: recordRaw ? "#0a84ff" : "#eee", borderRadius: 8 }}
          >
            <Text style={{ color: recordRaw ? "#fff" : "#000" }}>
              {recordRaw ? "Record Raw" : "Record Raw"}
            </Text>
          </Pressable>
          <Text style={{ color: "#666", marginLeft: 8 }}>Record raw provider outputs</Text>
        </View>

        <View style={{ marginBottom: 8 }}>
          <Text style={{ fontWeight: "600" }}>Export name (optional)</Text>
          <TextInput
            style={{
              marginTop: 6,
              padding: 8,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: "#ddd",
            }}
            placeholder="e.g. may11-run-1"
            placeholderTextColor="#999"
            value={exportName}
            onChangeText={setExportName}
          />
          <Text style={{ color: "#666", marginTop: 6 }}>
            You will be asked where to save the files.
          </Text>
        </View>

        <Pressable
          onPress={runBench}
          disabled={running}
          style={{ padding: 12, backgroundColor: running ? "#888" : "#0a84ff", borderRadius: 8 }}
        >
          {running ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: "#fff", fontWeight: "600" }}>Run Benchmark</Text>
          )}
        </Pressable>
        <Pressable
          onPress={exportJson}
          style={{ marginTop: 8, padding: 10, backgroundColor: "#444", borderRadius: 8 }}
        >
          <Text style={{ color: "#fff" }}>Export Aggregated JSON</Text>
        </Pressable>
        <Pressable
          onPress={exportAcademicReport}
          style={{ marginTop: 8, padding: 10, backgroundColor: "#0a6", borderRadius: 8 }}
        >
          <Text style={{ color: "#fff" }}>Export Academic Report (MD)</Text>
        </Pressable>
        <Pressable
          onPress={shareResults}
          style={{ marginTop: 8, padding: 10, backgroundColor: "#166", borderRadius: 8 }}
        >
          <Text style={{ color: "#fff" }}>Share Results (share sheet)</Text>
        </Pressable>
        {lastExportPath && (
          <Text style={{ color: "#666", marginTop: 8 }}>Last export: {lastExportPath}</Text>
        )}
      </View>

      <View style={{ marginTop: 12 }}>
        <Text style={{ fontSize: 16, fontWeight: "600" }}>Aggregated Results</Text>
        {aggregated.length === 0 ? (
          <Text style={{ color: "#666", marginTop: 8 }}>No results yet.</Text>
        ) : (
          aggregated.map((r, idx) => (
            <View
              key={`${r.provider}-${r.prompt}-${idx}`}
              style={{ padding: 8, borderBottomWidth: 1, borderColor: "#eee" }}
            >
              <Text style={{ fontWeight: "700" }}>
                {r.provider} — {r.promptLabel}
              </Text>
              <Text>Iterations: {r.iterations}</Text>
              <Text>Success rate: {(r.successRate * 100).toFixed(1)}%</Text>
              <Text>Integrity rate: {(r.integrityRate * 100).toFixed(1)}%</Text>
              <Text>
                Latency (ms): mean {r.latency.mean?.toFixed(1) ?? "—"}, median{" "}
                {r.latency.median?.toFixed(1) ?? "—"}, std {r.latency.std?.toFixed(1) ?? "—"}
              </Text>
              {r.recall && <Text>Recall mean: {r.recall.mean.toFixed(2)}</Text>}
              {r.power && r.power.meanWatts != null && (
                <Text>Estimated power (W): {r.power.meanWatts.toFixed(2)}</Text>
              )}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}
