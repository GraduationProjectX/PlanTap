export const STORAGE_KEYS = {
  UI_STATE: "plantap.ui-state",
  AUTH_STATE: "plantap.auth-state",
  ONBOARDING_COMPLETED: "plantap.onboarding-completed",
  EVENTS_CACHE: "plantap.cache.events",
  CATEGORIES_CACHE: "plantap.cache.categories",
  AI_STATE: "plantap.ai-state",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

