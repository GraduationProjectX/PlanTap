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

const initialState = {
  hasCompletedOnboarding: false,
  languageOverride: null,
  themeMode: "system" as AppThemeMode,
  notificationsEnabled: true,
  homeSearch: "",
  selectedCategories: [] as string[],
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
        if (!persistedState || typeof persistedState !== "object") {
          return {
            ...initialState,
          };
        }

        const state = persistedState as Partial<UIState>;
        const hasValidThemeMode =
          state.themeMode === "system" || state.themeMode === "light" || state.themeMode === "dark";

        if (version < 2 || !hasValidThemeMode) {
          return {
            ...state,
            themeMode: "system" as AppThemeMode,
          };
        }

        return state;
      },
    },
  ),
);
