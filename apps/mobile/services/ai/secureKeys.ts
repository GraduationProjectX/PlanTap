import * as SecureStore from "expo-secure-store";

/** Supported AI provider identifiers */
export type AiProviderKey = "gemini" | "openai" | "claude";

const SECURE_KEY_PREFIX = "plantap.ai-key.";

/** Map provider → expo-secure-store key */
const storeKey = (provider: AiProviderKey) =>
  `${SECURE_KEY_PREFIX}${provider}` as const;

/**
 * Env-variable fallback names, checked when SecureStore has no value.
 * These should be set via `EXPO_PUBLIC_*` at build time for dev convenience.
 */
const ENV_FALLBACK: Record<AiProviderKey, string | undefined> = {
  gemini: process.env.EXPO_PUBLIC_GEMINI_API_KEY,
  openai: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
  claude: process.env.EXPO_PUBLIC_CLAUDE_API_KEY,
};

/**
 * Retrieve an API key for the given provider.
 * Fallback chain: SecureStore → env variable → null
 */
export async function getApiKey(
  provider: AiProviderKey,
): Promise<string | null> {
  try {
    const stored = await SecureStore.getItemAsync(storeKey(provider));
    if (stored) return stored;
  } catch {
    // SecureStore may fail on simulators / web — fall through
  }
  return ENV_FALLBACK[provider] ?? null;
}

/** Persist a user-provided API key in device Secure Store. */
export async function setApiKey(
  provider: AiProviderKey,
  key: string,
): Promise<void> {
  await SecureStore.setItemAsync(storeKey(provider), key);
}

/** Remove a stored API key. */
export async function clearApiKey(provider: AiProviderKey): Promise<void> {
  await SecureStore.deleteItemAsync(storeKey(provider));
}
