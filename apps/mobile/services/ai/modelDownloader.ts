/**
 * Model download manager.
 *
 * Downloads GGUF model files from HuggingFace into the app's document
 * directory. Supports progress tracking and deletion.
 */

import RNFS from "react-native-fs";
import { NativeModules } from "react-native";
import { useAiStore } from "@/stores/ai-store";
import { fetchWithTimeout, retry } from "./utils";
import NetInfo from "@react-native-community/netinfo";

/** Pre-configured model entries the user can choose from. */
export type ModelEntry = {
  id: string;
  label: string;
  url: string;
  huggingFacePage?: string;
  filename: string;
  sizeBytes: number;
  sizeLabel: string;
  recommendedForMobile?: boolean;
  minRamBytes?: number;
};

export const AVAILABLE_MODELS: ModelEntry[] = [
  {
    id: "qwen2.5-1.5b-q4",
    label: "Qwen2.5 1.5B Instruct (Q4_K_M)",
    url: "https://huggingface.co/bartowski/Qwen2.5-1.5B-Instruct-GGUF/resolve/main/Qwen2.5-1.5B-Instruct-Q4_K_M.gguf",
    huggingFacePage: "https://huggingface.co/bartowski/Qwen2.5-1.5B-Instruct-GGUF",
    filename: "Qwen2.5-1.5B-Instruct-Q4_K_M.gguf",
    sizeBytes: 1_050_000_000,
    sizeLabel: "~1.05 GB",
    recommendedForMobile: true,
    minRamBytes: 4_000_000_000,
  },
  {
    id: "tinyllama-1.1b-q4",
    label: "TinyLlama 1.1B (Q4_K_M)",
    url: "https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf",
    huggingFacePage: "https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF",
    filename: "tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf",
    sizeBytes: 670_000_000,
    sizeLabel: "~670 MB",
    recommendedForMobile: true,
    minRamBytes: 3_000_000_000,
  },
  {
    id: "llama-3.2-1b-q4",
    label: "Llama 3.2 1B Instruct (Q4_K_M)",
    url: "https://huggingface.co/bartowski/Llama-3.2-1B-Instruct-GGUF/resolve/main/Llama-3.2-1B-Instruct-Q4_K_M.gguf",
    huggingFacePage: "https://huggingface.co/bartowski/Llama-3.2-1B-Instruct-GGUF",
    filename: "Llama-3.2-1B-Instruct-Q4_K_M.gguf",
    sizeBytes: 820_000_000,
    sizeLabel: "~820 MB",
    recommendedForMobile: true,
    minRamBytes: 3_000_000_000,
  },
  {
    id: "phi3-mini-4k-q4",
    label: "Phi-3 Mini 4K (Q4_K_M)",
    url: "https://huggingface.co/bartowski/Phi-3-mini-4k-instruct-GGUF/resolve/main/Phi-3-mini-4k-instruct-Q4_K_M.gguf",
    huggingFacePage: "https://huggingface.co/bartowski/Phi-3-mini-4k-instruct-GGUF",
    filename: "Phi-3-mini-4k-instruct-Q4_K_M.gguf",
    sizeBytes: 2_300_000_000,
    sizeLabel: "~2.3 GB",
    recommendedForMobile: false,
    minRamBytes: 6_000_000_000,
  },
];

const MODEL_DIR = `${RNFS.DocumentDirectoryPath}/models`;
const STORAGE_SAFETY_FACTOR = 1.25;
const TMP_SUFFIX = ".download";

export type ModelSupportAssessment = {
  canDownload: boolean;
  likelyCanRun: boolean;
  tier: "good" | "warning" | "blocked";
  reason: string;
  freeSpaceBytes: number | null;
  totalSpaceBytes: number | null;
  estimatedRamBytes: number | null;
};

function parseFilenameFromUrl(url: string): string {
  const clean = url.split("?")[0].trim();
  const parts = clean.split("/");
  const filename = parts[parts.length - 1] ?? "";
  return filename;
}

function formatBytes(bytes: number): string {
  const gb = bytes / 1_000_000_000;
  if (gb >= 1) return `~${gb.toFixed(2)} GB`;
  const mb = bytes / 1_000_000;
  return `~${Math.round(mb)} MB`;
}

function getEstimatedRamBytes(): number | null {
  try {
    const modules = NativeModules as Record<string, unknown>;
    const deviceInfo = modules.DeviceInfo as {
      getConstants?: () => Record<string, unknown>;
    } | undefined;

    const constants = deviceInfo?.getConstants?.();
    const totalMemory = constants?.TotalMemory;
    if (typeof totalMemory === "number" && Number.isFinite(totalMemory)) {
      return totalMemory;
    }
  } catch {
    // Best-effort only; absence of RAM info should not block download.
  }
  return null;
}

async function getStorageInfo(): Promise<{
  freeSpaceBytes: number | null;
  totalSpaceBytes: number | null;
}> {
  try {
    const info = await (RNFS as unknown as {
      getFSInfo?: () => Promise<{ freeSpace: number; totalSpace: number }>;
    }).getFSInfo?.();

    if (!info) {
      return { freeSpaceBytes: null, totalSpaceBytes: null };
    }

    return {
      freeSpaceBytes:
        typeof info.freeSpace === "number" ? info.freeSpace : null,
      totalSpaceBytes:
        typeof info.totalSpace === "number" ? info.totalSpace : null,
    };
  } catch {
    return { freeSpaceBytes: null, totalSpaceBytes: null };
  }
}

export function buildCustomModelEntry(url: string): ModelEntry {
  const cleanUrl = url.trim();
  if (!cleanUrl.startsWith("https://huggingface.co/")) {
    throw new Error("Custom model URL must be a Hugging Face link.");
  }

  const filename = parseFilenameFromUrl(cleanUrl);
  if (!filename || !filename.toLowerCase().endsWith(".gguf")) {
    throw new Error("Custom URL must point directly to a .gguf file.");
  }

  const page = cleanUrl.includes("/resolve/")
    ? cleanUrl.split("/resolve/")[0]
    : cleanUrl;

  return {
    id: `custom-${filename.toLowerCase()}`,
    label: `Custom: ${filename}`,
    url: cleanUrl,
    huggingFacePage: page,
    filename,
    sizeBytes: 0,
    sizeLabel: "Unknown size",
    recommendedForMobile: false,
  };
}

export async function assessDeviceSupport(
  model: ModelEntry,
): Promise<ModelSupportAssessment> {
  const { freeSpaceBytes, totalSpaceBytes } = await getStorageInfo();
  const estimatedRamBytes = getEstimatedRamBytes();

  const requiredDownloadBytes =
    model.sizeBytes > 0
      ? Math.ceil(model.sizeBytes * STORAGE_SAFETY_FACTOR)
      : 0;

  const canDownload =
    requiredDownloadBytes === 0 ||
    freeSpaceBytes == null ||
    freeSpaceBytes >= requiredDownloadBytes;

  const estimatedRuntimeBytes = model.minRamBytes ??
    (model.sizeBytes > 0 ? Math.ceil(model.sizeBytes * 2.6) : 0);

  const likelyCanRun =
    estimatedRuntimeBytes === 0 ||
    estimatedRamBytes == null ||
    estimatedRamBytes >= estimatedRuntimeBytes;

  if (!canDownload) {
    return {
      canDownload: false,
      likelyCanRun,
      tier: "blocked",
      reason:
        freeSpaceBytes == null
          ? "Insufficient free storage for this model."
          : `Need about ${formatBytes(requiredDownloadBytes)}, available ${formatBytes(freeSpaceBytes)}.`,
      freeSpaceBytes,
      totalSpaceBytes,
      estimatedRamBytes,
    };
  }

  if (!likelyCanRun) {
    return {
      canDownload: true,
      likelyCanRun: false,
      tier: "warning",
      reason:
        estimatedRamBytes == null
          ? "This model may be heavy on older phones."
          : `Estimated RAM needed ${formatBytes(estimatedRuntimeBytes)}, detected ${formatBytes(estimatedRamBytes)}.`,
      freeSpaceBytes,
      totalSpaceBytes,
      estimatedRamBytes,
    };
  }

  return {
    canDownload: true,
    likelyCanRun: true,
    tier: "good",
    reason:
      model.recommendedForMobile
        ? "Good fit for most modern phones."
        : "Should run on mid/high-end devices.",
    freeSpaceBytes,
    totalSpaceBytes,
    estimatedRamBytes,
  };
}

/** Ensure the models directory exists. */
async function ensureModelDir(): Promise<void> {
  const exists = await RNFS.exists(MODEL_DIR);
  if (!exists) {
    await RNFS.mkdir(MODEL_DIR);
  }
}

/** Full path where a model file will be stored. */
export function modelFilePath(filename: string): string {
  return `${MODEL_DIR}/${filename}`;
}

/** Check if a model file exists on disk. */
export async function isModelDownloaded(filename: string): Promise<boolean> {
  return RNFS.exists(modelFilePath(filename));
}

let _currentJobId: number | null = null;
let _currentTempPath: string | null = null;
let _cancelRequested = false;
let _isConnectedCache: boolean | null = null;

/**
 * Download a model and track progress via the AI store.
 * Returns the absolute path of the downloaded file.
 */
export async function downloadModel(model: ModelEntry): Promise<string> {
  const store = useAiStore.getState();
  await ensureModelDir();

  const support = await assessDeviceSupport(model);
  if (!support.canDownload) {
    throw new Error(`This device cannot download ${model.label} right now. ${support.reason}`);
  }

  const destPath = modelFilePath(model.filename);

  // Perform an optional HEAD request to obtain content-length / etag
  let serverContentLength: number | null = null;
  let serverEtag: string | null = null;
  try {
    const head = await fetchWithTimeout(model.url, { method: "HEAD", redirect: "follow" }, 10_000);
    if (head.ok) {
      const cl = head.headers.get("content-length");
      if (cl) serverContentLength = Number(cl);
      serverEtag = head.headers.get("etag");
    }
  } catch {
    // Best-effort only; continue even if HEAD fails.
  }

  // Re-check free space with more accurate size when available
  const { freeSpaceBytes } = await getStorageInfo();
  const expectedSize = serverContentLength ?? (model.sizeBytes > 0 ? model.sizeBytes : 0);
  const requiredDownloadBytes = expectedSize > 0 ? Math.ceil(expectedSize * STORAGE_SAFETY_FACTOR) : 0;
  if (requiredDownloadBytes > 0 && freeSpaceBytes != null && freeSpaceBytes < requiredDownloadBytes) {
    throw new Error(`Insufficient free storage for ${model.label}. Need about ${formatBytes(requiredDownloadBytes)}.`);
  }

  // If already downloaded and matches expected size, short-circuit
  if (await RNFS.exists(destPath)) {
    try {
      const st = await RNFS.stat(destPath);
      const actualSize = Number((st as any).size);
      if (expectedSize === 0 || (expectedSize > 0 && actualSize === expectedSize)) {
        store.setDownloadComplete(destPath);
        // persist metadata if available
        store.setLocalModelMeta({ filename: model.filename, sizeBytes: expectedSize || null, etag: serverEtag ?? null });
        return destPath;
      }
      // Mismatched size — remove and re-download
      await RNFS.unlink(destPath);
    } catch {
      // ignore and continue with download
    }
  }

  store.startDownload();

  const tempPath = destPath + TMP_SUFFIX;

  const downloadAttempt = async (): Promise<string> => {
    // remove any leftover temp file from previous attempts
    try {
      if (await RNFS.exists(tempPath)) {
        await RNFS.unlink(tempPath);
      }
    } catch {
      // ignore
    }

    return new Promise<string>((resolve, reject) => {
      NetInfo.fetch().then((state) => {
        _isConnectedCache = state.isConnected ?? false;
        if (!_isConnectedCache) {
          reject(new Error("No internet connection"));
          return;
        }

        const { jobId, promise } = RNFS.downloadFile({
          fromUrl: model.url,
          toFile: tempPath,
          background: true,
          discretionary: false,
          cacheable: false,
          progressInterval: 500,
          progress: (res) => {
            const total = (res.contentLength && res.contentLength > 0) ? res.contentLength : serverContentLength;
            let progress = 0;
            if (total && total > 0) {
              progress = Math.round((res.bytesWritten / total) * 100);
            }
            useAiStore.getState().setDownloadProgress(progress);
          },
        });

        _currentJobId = jobId;
        _currentTempPath = tempPath;
        _cancelRequested = false;

        promise
          .then(async (result) => {
            _currentJobId = null;
            _currentTempPath = null;
            if (result.statusCode === 200 || result.statusCode === 201) {
              try {
                const st = await RNFS.stat(tempPath);
                const size = Number((st as any).size);
                if (serverContentLength && serverContentLength > 0 && size !== serverContentLength) {
                  // corrupted/incomplete
                  await RNFS.unlink(tempPath).catch(() => {});
                  useAiStore.getState().cancelDownload();
                  reject(new Error(`Downloaded file size ${size} does not match expected ${serverContentLength}`));
                  return;
                }
              } catch {
                // ignore stat errors
              }

              // move temp -> final
              try {
                if (await RNFS.exists(destPath)) {
                  await RNFS.unlink(destPath).catch(() => {});
                }
              } catch {
                // ignore
              }

              try {
                await RNFS.moveFile(tempPath, destPath);
              } catch {
                // fallback to copy+unlink
                try {
                  await RNFS.copyFile(tempPath, destPath);
                  await RNFS.unlink(tempPath).catch(() => {});
                } catch (e) {
                  useAiStore.getState().cancelDownload();
                  reject(e);
                  return;
                }
              }

              useAiStore.getState().setDownloadComplete(destPath);
              // save metadata
              store.setLocalModelMeta({ filename: model.filename, sizeBytes: serverContentLength ?? (model.sizeBytes > 0 ? model.sizeBytes : null), etag: serverEtag ?? null });
              resolve(destPath);
            } else {
              useAiStore.getState().cancelDownload();
              reject(new Error(`Download failed with status ${result.statusCode}`));
            }
          })
          .catch(async (err) => {
            _currentJobId = null;
            _currentTempPath = null;
            useAiStore.getState().cancelDownload();
            const net = await NetInfo.fetch();
            _isConnectedCache = net.isConnected ?? false;
            if (!_isConnectedCache) {
              // leave temp file for resume
              reject(new Error("Network disconnected during download; resume available"));
            } else {
              if (_cancelRequested) {
                try {
                  if (await RNFS.exists(tempPath)) {
                    await RNFS.unlink(tempPath).catch(() => {});
                  }
                } catch {}
              }
              reject(err);
            }
          });
      }).catch(() => reject(new Error("Failed to check network state")));
    });
  };

  try {
    const resultPath = await retry(() => downloadAttempt(), 2, 4000);
    return resultPath;
  } catch (err) {
    // cleanup
    try {
      if (await RNFS.exists(tempPath)) {
        await RNFS.unlink(tempPath).catch(() => {});
      }
    } catch {}
    throw err;
  } finally {
    _currentJobId = null;
    _currentTempPath = null;
    _cancelRequested = false;
  }
}

/** Cancel an in-progress download. */
export function cancelDownload(): void {
  if (_currentJobId != null) {
    RNFS.stopDownload(_currentJobId);
    _cancelRequested = true;
  }
  useAiStore.getState().cancelDownload();
  // Attempt to remove any temp file
  if (_currentTempPath) {
    RNFS.exists(_currentTempPath)
      .then((exists) => {
        if (exists) RNFS.unlink(_currentTempPath as string).catch(() => {});
      })
      .catch(() => {});
    _currentTempPath = null;
  }
  _currentJobId = null;
}

/** Delete a downloaded model from disk and reset store state. */
export async function deleteModel(filename: string): Promise<void> {
  const path = modelFilePath(filename);
  if (await RNFS.exists(path)) {
    await RNFS.unlink(path);
  }
  const { localModelPath, deleteLocalModel } = useAiStore.getState();
  if (localModelPath === path) {
    deleteLocalModel();
  }
}
