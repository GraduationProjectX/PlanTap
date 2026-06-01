import { STORAGE_KEYS } from "@/storage/keys";
import { zustandMMKVStorage } from "@/storage/mmkv";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/** Supported AI providers */
export type AiProvider = "gemini" | "openai" | "claude" | "local";

export type DownloadStatus = "idle" | "downloading" | "paused" | "error";

type AiState = {
  /** Currently selected provider */
  provider: AiProvider;
  /** Whether a local GGUF model has been downloaded */
  localModelDownloaded: boolean;
  /** Name/path of the downloaded model file */
  localModelPath: string | null;
  /** Optional metadata about the downloaded model */
  localModelMeta: { filename: string; sizeBytes?: number | null; etag?: string | null } | null;
  /** Whether a download is currently in progress */
  isDownloading: boolean;
  /** Download progress 0-100 */
  downloadProgress: number;
  /** Current download status */
  downloadStatus: DownloadStatus;
  /** Download job ID from RNFS */
  downloadJobId: number | null;
  /** Model ID currently downloading */
  downloadModelId: string | null;
  /** Whether the current job is resumable */
  downloadCanResume: boolean;

  // --- Actions ---
  setProvider: (provider: AiProvider) => void;
  setLocalModelPath: (path: string | null) => void;
  setLocalModelDownloaded: (downloaded: boolean) => void;
  startDownload: (modelId: string, jobId: number) => void;
  setDownloadProgress: (progress: number) => void;
  setDownloadComplete: (modelPath: string) => void;
  setDownloadPaused: () => void;
  setDownloadResumed: () => void;
  setDownloadError: () => void;
  setDownloadJobId: (jobId: number | null) => void;
  setDownloadCanResume: (canResume: boolean) => void;
  setLocalModelMeta: (meta: {
    filename: string;
    sizeBytes?: number | null;
    etag?: string | null;
  }) => void;
  cancelDownload: () => void;
  deleteLocalModel: () => void;
};

type AiInitialState = Pick<
  AiState,
  | "provider"
  | "localModelDownloaded"
  | "localModelPath"
  | "localModelMeta"
  | "isDownloading"
  | "downloadProgress"
  | "downloadStatus"
  | "downloadJobId"
  | "downloadModelId"
  | "downloadCanResume"
>;

const initialState: AiInitialState = {
  provider: "gemini",
  localModelDownloaded: false,
  localModelPath: null,
  localModelMeta: null,
  isDownloading: false,
  downloadProgress: 0,
  downloadStatus: "idle",
  downloadJobId: null,
  downloadModelId: null,
  downloadCanResume: false,
};

export const useAiStore = create<AiState>()(
  persist(
    (set) => ({
      ...initialState,

      setProvider: (provider) => set({ provider }),

      setLocalModelPath: (path) => set({ localModelPath: path }),

      setLocalModelDownloaded: (downloaded) => set({ localModelDownloaded: downloaded }),

      startDownload: (modelId, jobId) =>
        set({
          isDownloading: true,
          downloadProgress: 0,
          downloadStatus: "downloading",
          downloadJobId: jobId,
          downloadModelId: modelId,
          downloadCanResume: false,
        }),

      setDownloadProgress: (progress) => set({ downloadProgress: progress }),

      setDownloadComplete: (modelPath) =>
        set({
          isDownloading: false,
          downloadProgress: 100,
          localModelDownloaded: true,
          localModelPath: modelPath,
          downloadStatus: "idle",
          downloadJobId: null,
          downloadModelId: null,
          downloadCanResume: false,
        }),

      setDownloadPaused: () =>
        set({
          isDownloading: false,
          downloadStatus: "paused",
        }),

      setDownloadResumed: () =>
        set({
          isDownloading: true,
          downloadStatus: "downloading",
        }),

      setDownloadError: () =>
        set({
          isDownloading: false,
          downloadStatus: "error",
        }),

      setDownloadJobId: (jobId) => set({ downloadJobId: jobId }),

      setDownloadCanResume: (canResume) => set({ downloadCanResume: canResume }),

      setLocalModelMeta: (meta) => set({ localModelMeta: meta }),

      cancelDownload: () =>
        set({
          isDownloading: false,
          downloadProgress: 0,
          downloadStatus: "idle",
          downloadJobId: null,
          downloadModelId: null,
          downloadCanResume: false,
        }),

      deleteLocalModel: () =>
        set({
          localModelDownloaded: false,
          localModelPath: null,
          downloadProgress: 0,
          downloadStatus: "idle",
          downloadJobId: null,
          downloadModelId: null,
          downloadCanResume: false,
        }),
    }),
    {
      name: STORAGE_KEYS.AI_STATE,
      storage: createJSONStorage(() => zustandMMKVStorage),
      version: 1,
    },
  ),
);
