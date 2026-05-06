import { STORAGE_KEYS } from "@/storage/keys";
import { zustandMMKVStorage } from "@/storage/mmkv";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type AppLanguage = "ar" | "en";
export type AppThemeMode = "system" | "light" | "dark";

type UIState = {
  hasCompletedOnboarding: boolean;
  languageOverride: AppLanguage | null;
  themeMode: AppThemeMode;
  notificationsEnabled: boolean;
  homeSearch: string;
  selectedCategories: string[];
  setHasCompletedOnboarding: (value: boolean) => void;
  setLanguageOverride: (value: AppLanguage | null) => void;
  setThemeMode: (value: AppThemeMode) => void;
  setNotificationsEnabled: (value: boolean) => void;
  setHomeSearch: (value: string) => void;
  setSelectedCategories: (value: string[]) => void;
  toggleCategory: (category: string) => void;
  resetHomeFilters: () => void;
};

type PersistedUIState = Partial<{
  hasCompletedOnboarding: boolean;
  languageOverride: AppLanguage | null;
  themeMode: AppThemeMode;
  notificationsEnabled: boolean;
  homeSearch: string;
  selectedCategories: string[];
}>;

function isPersistedUIState(value: unknown): value is PersistedUIState {
  return value !== null && value !== undefined && typeof value === "object" && !Array.isArray(value);
}

const initialState: {
  hasCompletedOnboarding: boolean;
  languageOverride: AppLanguage | null;
  themeMode: AppThemeMode;
  notificationsEnabled: boolean;
  homeSearch: string;
  selectedCategories: string[];
} = {
  hasCompletedOnboarding: false,
  languageOverride: null,
  themeMode: "system",
  notificationsEnabled: true,
  homeSearch: "",
  selectedCategories: [],
};

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      ...initialState,
      setHasCompletedOnboarding: (value) => set({ hasCompletedOnboarding: value }),
      setLanguageOverride: (value) => set({ languageOverride: value }),
      setThemeMode: (value) => set({ themeMode: value }),
      setNotificationsEnabled: (value) => set({ notificationsEnabled: value }),
      setHomeSearch: (value) => set({ homeSearch: value }),
      setSelectedCategories: (value) => set({ selectedCategories: value }),
      toggleCategory: (category) => 
        set((state) => ({
          selectedCategories: state.selectedCategories.includes(category)
          ? state.selectedCategories.filter((item) => item !== category)
          : [...state.selectedCategories, category],
      })),
      resetHomeFilters: () =>
        set({
          homeSearch: initialState.homeSearch,
          selectedCategories: initialState.selectedCategories,
        }),
    }),
    {
      name: STORAGE_KEYS.UI_STATE,
      storage: createJSONStorage(() => zustandMMKVStorage),
      version: 2,
      migrate: (persistedState, version) => {
        if (!isPersistedUIState(persistedState)) {
          return {
            ...initialState,
          };
        }

        const state = persistedState;
        const hasValidThemeMode =
          state.themeMode === "system" || state.themeMode === "light" || state.themeMode === "dark";

        if (version < 2 || !hasValidThemeMode) {
          return {
            ...state,
            themeMode: "system",
          };
        }

        return state;
      },
    },
  ),
);
