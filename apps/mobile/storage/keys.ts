export const STORAGE_KEYS = {
  UI_STATE: "plantap.ui-state",
  AUTH_STATE: "plantap.auth-state",
  ONBOARDING_COMPLETED: "plantap.onboarding-completed",
  AI_STATE: "plantap.ai-state",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS]; // THIS IS SHORTER and Dynamic VERSION Of
// export type StorageKey = "plantap.ui-state" | "plantap.auth-state" | "plantap.onboarding-completed"

