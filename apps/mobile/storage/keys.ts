export const STORAGE_KEYS = {
  UI_STATE: "plantap.ui-state",
  LANGUAGE_OVERRIDE: "plantap.language-override",
  AUTH_STATE: "plantap.auth-state",
  EVENTS_CACHE: "plantap.cache.events",
  CATEGORIES_CACHE: "plantap.cache.categories",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
