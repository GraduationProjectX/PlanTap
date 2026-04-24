import { STORAGE_KEYS } from "@/storage/keys";
import { zustandMMKVStorage } from "@/storage/mmkv";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type AppLanguage = "ar" | "en";
export type AppThemeMode = "system" | "light" | "dark";

type UIState = {
  languageOverride: AppLanguage | null;
  themeMode: AppThemeMode;
  homeSearch: string;
  selectedCategories: string[];
  setLanguageOverride: (value: AppLanguage | null) => void;
  setThemeMode: (value: AppThemeMode) => void;
  setHomeSearch: (value: string) => void;
  setSelectedCategories: (value: string[]) => void;
  toggleCategory: (category: string) => void;
  resetHomeFilters: () => void;
};

type PersistedUIState = Partial<{
  languageOverride: AppLanguage | null;
  themeMode: AppThemeMode;
  homeSearch: string;
  selectedCategories: string[];
}>;

function isPersistedUIState(value: unknown): value is PersistedUIState {
  return !!value && typeof value === "object";
}

const initialState: {
  languageOverride: AppLanguage | null;
  themeMode: AppThemeMode;
  homeSearch: string;
  selectedCategories: string[];
} = {
  languageOverride: null,
  themeMode: "system",
  homeSearch: "",
  selectedCategories: [],
};

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      ...initialState,
      setLanguageOverride: (value) => set({ languageOverride: value }),
      setThemeMode: (value) => set({ themeMode: value }),
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
      version: 3,
      partialize: (state) => ({
        languageOverride: state.languageOverride,
        themeMode: state.themeMode,
        homeSearch: state.homeSearch,
        selectedCategories: state.selectedCategories,
      }),
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
            languageOverride: state.languageOverride ?? initialState.languageOverride,
            themeMode: "system",
            homeSearch: state.homeSearch ?? initialState.homeSearch,
            selectedCategories: state.selectedCategories ?? initialState.selectedCategories,
          };
        }

        return {
          languageOverride: state.languageOverride ?? initialState.languageOverride,
          themeMode: state.themeMode ?? initialState.themeMode,
          homeSearch: state.homeSearch ?? initialState.homeSearch,
          selectedCategories: state.selectedCategories ?? initialState.selectedCategories,
        };
      },
    },
  ),
);
