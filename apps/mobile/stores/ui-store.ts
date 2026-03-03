import { STORAGE_KEYS } from "@/storage/keys";
import { zustandMMKVStorage } from "@/storage/mmkv";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type AppLanguage = "ar" | "en";

type UIState = {
  hasCompletedOnboarding: boolean;
  languageOverride: AppLanguage | null;
  notificationsEnabled: boolean;
  homeSearch: string;
  selectedCategories: string[];
  setHasCompletedOnboarding: (value: boolean) => void;
  setLanguageOverride: (value: AppLanguage | null) => void;
  setNotificationsEnabled: (value: boolean) => void;
  setHomeSearch: (value: string) => void;
  setSelectedCategories: (value: string[]) => void;
  toggleCategory: (category: string) => void;
  resetHomeFilters: () => void;
};

const initialState = {
  hasCompletedOnboarding: false,
  languageOverride: null,
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
      version: 1,
    },
  ),
);
