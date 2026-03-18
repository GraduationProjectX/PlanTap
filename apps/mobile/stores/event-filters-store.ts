import { create } from "zustand";

import type { EventFilters } from "@/lib/events-data";

type EventFiltersState = {
  appliedFilters: EventFilters | null;
  setAppliedFilters: (value: EventFilters) => void;
  clearAppliedFilters: () => void;
};

export const useEventFiltersStore = create<EventFiltersState>((set) => ({
  appliedFilters: null,
  setAppliedFilters: (value) => set({ appliedFilters: value }),
  clearAppliedFilters: () => set({ appliedFilters: null }),
}));
