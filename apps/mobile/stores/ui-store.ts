import { STORAGE_KEYS } from "@/storage/keys";
import { removeValue, setString } from "@/storage/helpers";
import { zustandMMKVStorage } from "@/storage/mmkv";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type AppLanguage = "ar" | "en";

type UIState = {
  languageOverride: AppLanguage | null;
  homeSearch: string;
  selectedCategories: string[];
  setLanguageOverride: (value: AppLanguage | null) => void;
  setHomeSearch: (value: string) => void;
  setSelectedCategories: (value: string[]) => void;
  toggleCategory: (category: string) => void;
  resetHomeFilters: () => void;
};

type PersistedUIState = Partial<{
  languageOverride: AppLanguage | null;
  homeSearch: string;
  selectedCategories: string[];
}>;

function isPersistedUIState(value: unknown): value is PersistedUIState {
  return (
    value !== null && value !== undefined && typeof value === "object" && !Array.isArray(value)
  );
}

const initialState: {
  languageOverride: AppLanguage | null;
  homeSearch: string;
  selectedCategories: string[];
} = {
  languageOverride: null,
  homeSearch: "",
  selectedCategories: [],
};

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      ...initialState,
      setLanguageOverride: (value) =>
        set(() => {
          if (value === null) {
            removeValue(STORAGE_KEYS.LANGUAGE_OVERRIDE);
          } else {
            setString(STORAGE_KEYS.LANGUAGE_OVERRIDE, value);
          }

          return { languageOverride: value };
        }),
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
      version: 4,
      partialize: (state) => ({
        languageOverride: state.languageOverride,
        homeSearch: state.homeSearch,
        selectedCategories: state.selectedCategories,
      }),
      migrate: (persistedState) => {
        if (!isPersistedUIState(persistedState)) {
          return {
            ...initialState,
          };
        }

        const state = persistedState;
        return {
          languageOverride: state.languageOverride ?? initialState.languageOverride,
          homeSearch: state.homeSearch ?? initialState.homeSearch,
          selectedCategories: state.selectedCategories ?? initialState.selectedCategories,
        };
      },
    },
  ),
);
