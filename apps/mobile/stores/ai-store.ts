import { STORAGE_KEYS } from "@/storage/keys";
import { zustandMMKVStorage } from "@/storage/mmkv";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/** Supported AI providers */
export type AiProvider = "gemini" | "openai" | "claude" | "local";

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

  // --- Actions ---
  setProvider: (provider: AiProvider) => void;
  setLocalModelPath: (path: string | null) => void;
  setLocalModelDownloaded: (downloaded: boolean) => void;
  startDownload: () => void;
  setDownloadProgress: (progress: number) => void;
  setDownloadComplete: (modelPath: string) => void;
  setLocalModelMeta: (meta: { filename: string; sizeBytes?: number | null; etag?: string | null }) => void;
  cancelDownload: () => void;
  deleteLocalModel: () => void;
};

const initialState = {
  provider: "gemini" as AiProvider,
  localModelDownloaded: false,
  localModelPath: null as string | null,
  localModelMeta: null as { filename: string; sizeBytes?: number | null; etag?: string | null } | null,
  isDownloading: false,
  downloadProgress: 0,
};

export const useAiStore = create<AiState>()(
  persist(
    (set) => ({
      ...initialState,

      setProvider: (provider) => set({ provider }),

      setLocalModelPath: (path) => set({ localModelPath: path }),

      setLocalModelDownloaded: (downloaded) => set({ localModelDownloaded: downloaded }),

      startDownload: () =>
        set({ isDownloading: true, downloadProgress: 0 }),

      setDownloadProgress: (progress) =>
        set({ downloadProgress: progress }),

      setDownloadComplete: (modelPath) =>
        set({
          isDownloading: false,
          downloadProgress: 100,
          localModelDownloaded: true,
          localModelPath: modelPath,
        }),

      setLocalModelMeta: (meta) => set({ localModelMeta: meta }),

      cancelDownload: () =>
        set({ isDownloading: false, downloadProgress: 0 }),

      deleteLocalModel: () =>
        set({
          localModelDownloaded: false,
          localModelPath: null,
          downloadProgress: 0,
        }),
    }),
    {
      name: STORAGE_KEYS.AI_STATE,
      storage: createJSONStorage(() => zustandMMKVStorage),
      version: 1,
    },
  ),
);
