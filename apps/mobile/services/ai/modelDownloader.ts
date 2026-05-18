/**
 * Model download manager.
 *
 * Downloads GGUF model files from HuggingFace into the app's document
 * directory. Supports progress tracking and deletion.
 */

import { NativeModules } from "react-native";
import { useAiStore } from "@/stores/ai-store";
import { fetchWithTimeout, retry } from "./utils";
import { getRNFS, requireRNFS } from "../nativeFileSystem";

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

function isNumber(value: unknown): value is number {
  return Object.prototype.toString.call(value) === "[object Number]";
}

function isString(value: unknown): value is string {
  return Object.prototype.toString.call(value) === "[object String]";
}

function isFunction(value: unknown): value is (...args: unknown[]) => unknown {
  return Object.prototype.toString.call(value) === "[object Function]";
}

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
    const deviceInfo = NativeModules.DeviceInfo;
    const constants = isFunction(deviceInfo?.getConstants)
      ? deviceInfo.getConstants()
      : null;
    const totalMemory = constants?.TotalMemory;
    if (isNumber(totalMemory) && Number.isFinite(totalMemory)) {
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
    const RNFS = getRNFS();
    const info = await RNFS?.getFSInfo?.();

    if (!info) {
      return { freeSpaceBytes: null, totalSpaceBytes: null };
    }

    return {
      freeSpaceBytes:
        isNumber(info.freeSpace) ? info.freeSpace : null,
      totalSpaceBytes:
        isNumber(info.totalSpace) ? info.totalSpace : null,
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
  const RNFS = requireRNFS();
  const modelDir = `${RNFS.DocumentDirectoryPath}/models`;
  const exists = await RNFS.exists(modelDir);
  if (!exists) {
    await RNFS.mkdir(modelDir);
  }
}

/** Full path where a model file will be stored. */
export function modelFilePath(filename: string): string {
  const RNFS = getRNFS();
  const modelDir = RNFS ? `${RNFS.DocumentDirectoryPath}/models` : "/models";
  return `${modelDir}/${filename}`;
}

/** Check if a model file exists on disk. */
export async function isModelDownloaded(filename: string): Promise<boolean> {
  const RNFS = getRNFS();
  if (!RNFS) {
    return false;
  }

  return RNFS.exists(modelFilePath(filename));
}

let _currentJobId: number | null = null;
let _currentTempPath: string | null = null;
let _cancelRequested = false;
let _pauseRequested = false;
let _isConnectedCache: boolean | null = null;

function getNetInfo(): { fetch: () => Promise<{ isConnected: boolean | null }> } | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require("@react-native-community/netinfo");
  } catch {
    return null;
  }
}

/**
 * Download a model and track progress via the AI store.
 * Returns the absolute path of the downloaded file.
 */
export async function downloadModel(model: ModelEntry): Promise<string> {
  const store = useAiStore.getState();
  const RNFS = requireRNFS();
  await ensureModelDir();

  const support = await assessDeviceSupport(model);
  if (!support.canDownload) {
    throw new Error(`This device cannot download ${model.label} right now. ${support.reason}`);
  }

  const destPath = modelFilePath(model.filename);

  // Perform an optional HEAD request to obtain content-length / etag
  let serverContentLength: number | null = null;
  let serverEtag: string | null = null;
  let resolvedUrl: string = model.url;
  try {
    const head = await fetchWithTimeout(model.url, { method: "HEAD", redirect: "follow" }, 10_000);
    if (head.ok) {
      if (head.url) {
        resolvedUrl = head.url;
      }
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
      const actualSize = Number(st.size);
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

  const tempPath = destPath + TMP_SUFFIX;

  let keepJobForResume = false;

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
      const NetInfo = getNetInfo();
      const netInfoPromise = NetInfo ? NetInfo.fetch() : Promise.resolve({ isConnected: null });

      const startDownload = () => {
        const { jobId, promise } = RNFS.downloadFile({
          fromUrl: resolvedUrl,
          toFile: tempPath,
          background: true,
          discretionary: false,
          cacheable: false,
          progressInterval: 500,
          headers: {
            "User-Agent": "PlanTap",
            Accept: "application/octet-stream",
          },
          resumable: () => {
            useAiStore.getState().setDownloadCanResume(true);
          },
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
        _pauseRequested = false;
        useAiStore.getState().startDownload(model.id, jobId);

        promise
          .then(async (result) => {
            _currentJobId = null;
            _currentTempPath = null;
            if (result.statusCode === 200 || result.statusCode === 201) {
              try {
                const st = await RNFS.stat(tempPath);
                const size = Number(st.size);
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
            const netInfo = getNetInfo();
            const net = netInfo ? await netInfo.fetch() : { isConnected: null };
            const isConnected = net.isConnected;
            _isConnectedCache = isConnected ?? null;
            if (isConnected === false) {
              keepJobForResume = true;
              useAiStore.getState().setDownloadCanResume(true);
              useAiStore.getState().setDownloadPaused();
              // leave temp file for resume
              reject(new Error("Network disconnected during download; resume available"));
            } else {
              if (_pauseRequested) {
                keepJobForResume = true;
                useAiStore.getState().setDownloadPaused();
                reject(new Error("Download paused"));
                return;
              }
              if (_cancelRequested) {
                useAiStore.getState().cancelDownload();
                try {
                  if (await RNFS.exists(tempPath)) {
                    await RNFS.unlink(tempPath).catch(() => {});
                  }
                } catch {}
              } else {
                useAiStore.getState().setDownloadError();
              }
              reject(err);
            }

            if (!keepJobForResume) {
              _currentJobId = null;
              _currentTempPath = null;
            }
          });
      };

      netInfoPromise
        .then((state) => {
          const isConnected = state.isConnected;
          _isConnectedCache = isConnected ?? null;
          if (isConnected === false) {
            reject(new Error("No internet connection"));
            return;
          }
          startDownload();
        })
        .catch(() => {
          _isConnectedCache = null;
          startDownload();
        });
    });
  };

  try {
    const resultPath = await retry(
      () => downloadAttempt(),
      2,
      4000,
      (err) =>
        !(err instanceof Error) ||
        (err.message !== "Download paused" &&
          err.message !== "Network disconnected during download; resume available"),
    );
    return resultPath;
  } catch (err) {
    const shouldKeepTemp =
      err instanceof Error &&
      (err.message === "Download paused" || err.message === "Network disconnected during download; resume available");
    if (!shouldKeepTemp) {
      try {
        if (await RNFS.exists(tempPath)) {
          await RNFS.unlink(tempPath).catch(() => {});
        }
      } catch {}
      useAiStore.getState().setDownloadError();
    }
    throw err;
  } finally {
    if (!keepJobForResume) {
      _currentJobId = null;
      _currentTempPath = null;
    }
    _cancelRequested = false;
    _pauseRequested = false;
  }
}

/** Pause an in-progress download, keeping temp file for resume. */
export async function pauseDownload(): Promise<void> {
  const RNFS = getRNFS();
  if (_currentJobId != null) {
    _pauseRequested = true;
    RNFS?.stopDownload(_currentJobId);
  }
}

/** Resume a paused download if RNFS supports it. */
export async function resumeDownload(): Promise<void> {
  const RNFS = getRNFS();
  if (_currentJobId != null && RNFS) {
    const resumable = await RNFS.isResumable(_currentJobId).catch(() => false);
    if (resumable) {
      _pauseRequested = false;
      RNFS.resumeDownload(_currentJobId);
      useAiStore.getState().setDownloadJobId(_currentJobId);
      useAiStore.getState().setDownloadCanResume(true);
      useAiStore.getState().setDownloadResumed();
      useAiStore.getState().setDownloadProgress(useAiStore.getState().downloadProgress);
      return;
    }
  }
  throw new Error("Download is not resumable");
}

/** Cancel an in-progress download. */
export function cancelDownload(): void {
  const RNFS = getRNFS();
  if (_currentJobId != null) {
    RNFS?.stopDownload(_currentJobId);
    _cancelRequested = true;
  }
  useAiStore.getState().cancelDownload();
  // Attempt to remove any temp file
  if (_currentTempPath) {
    const tempPath = _currentTempPath;
    RNFS?.exists(tempPath)
      .then((exists) => {
        if (exists) RNFS.unlink(tempPath).catch(() => {});
      })
      .catch(() => {});
    _currentTempPath = null;
  }
  _currentJobId = null;
}

/** Delete a downloaded model from disk and reset store state. */
export async function deleteModel(filename: string): Promise<void> {
  const RNFS = getRNFS();
  if (!RNFS) {
    return;
  }

  const path = modelFilePath(filename);
  if (await RNFS.exists(path)) {
    await RNFS.unlink(path);
  }
  const { localModelPath, deleteLocalModel } = useAiStore.getState();
  if (localModelPath === path) {
    deleteLocalModel();
  }
}
