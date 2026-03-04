/**
 * Model download manager.
 *
 * Downloads GGUF model files from HuggingFace into the app's document
 * directory. Supports progress tracking and deletion.
 */

import RNFS from "react-native-fs";
import { useAiStore } from "@/stores/ai-store";

/** Pre-configured model entries the user can choose from. */
export type ModelEntry = {
  id: string;
  label: string;
  url: string;
  filename: string;
  sizeBytes: number;
  sizeLabel: string;
};

export const AVAILABLE_MODELS: ModelEntry[] = [
  {
    id: "tinyllama-1.1b-q4",
    label: "TinyLlama 1.1B (Q4_K_M)",
    url: "https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF/resolve/main/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf",
    filename: "tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf",
    sizeBytes: 670_000_000,
    sizeLabel: "~670 MB",
  },
  {
    id: "phi3-mini-4k-q4",
    label: "Phi-3 Mini 4K (Q4_K_M)",
    url: "https://huggingface.co/bartowski/Phi-3-mini-4k-instruct-GGUF/resolve/main/Phi-3-mini-4k-instruct-Q4_K_M.gguf",
    filename: "Phi-3-mini-4k-instruct-Q4_K_M.gguf",
    sizeBytes: 2_300_000_000,
    sizeLabel: "~2.3 GB",
  },
];

const MODEL_DIR = `${RNFS.DocumentDirectoryPath}/models`;

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

/**
 * Download a model and track progress via the AI store.
 * Returns the absolute path of the downloaded file.
 */
export async function downloadModel(model: ModelEntry): Promise<string> {
  const store = useAiStore.getState();
  await ensureModelDir();

  const destPath = modelFilePath(model.filename);

  // If already downloaded, short-circuit
  if (await RNFS.exists(destPath)) {
    store.setDownloadComplete(destPath);
    return destPath;
  }

  store.startDownload();

  return new Promise<string>((resolve, reject) => {
    const { jobId, promise } = RNFS.downloadFile({
      fromUrl: model.url,
      toFile: destPath,
      background: true,
      discretionary: false,
      cacheable: false,
      progressInterval: 500,
      progress: (res) => {
        const progress = Math.round(
          (res.bytesWritten / res.contentLength) * 100,
        );
        useAiStore.getState().setDownloadProgress(progress);
      },
    });

    _currentJobId = jobId;

    promise
      .then((result) => {
        _currentJobId = null;
        if (result.statusCode === 200) {
          useAiStore.getState().setDownloadComplete(destPath);
          resolve(destPath);
        } else {
          useAiStore.getState().cancelDownload();
          reject(new Error(`Download failed with status ${result.statusCode}`));
        }
      })
      .catch((err) => {
        _currentJobId = null;
        useAiStore.getState().cancelDownload();
        reject(err);
      });
  });
}

/** Cancel an in-progress download. */
export function cancelDownload(): void {
  if (_currentJobId != null) {
    RNFS.stopDownload(_currentJobId);
    _currentJobId = null;
  }
  useAiStore.getState().cancelDownload();
}

/** Delete a downloaded model from disk and reset store state. */
export async function deleteModel(filename: string): Promise<void> {
  const path = modelFilePath(filename);
  if (await RNFS.exists(path)) {
    await RNFS.unlink(path);
  }
  useAiStore.getState().deleteLocalModel();
}
