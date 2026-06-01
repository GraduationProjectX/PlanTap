import { storage } from "@/storage/mmkv";

const CACHE_SCHEMA_VERSION = 2;

type CacheEnvelope<T> = {
  version: number;
  updatedAt: number;
  data: T;
};

const memoryCache = new Map<string, CacheEnvelope<unknown>>();

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object";
}

function isValidEnvelope<T>(value: unknown): value is CacheEnvelope<T> {
  if (!isRecord(value)) {
    return false;
  }

  return (
    value.version === CACHE_SCHEMA_VERSION && typeof value.updatedAt === "number" && "data" in value
  );
}

function isFresh(updatedAt: number, ttlMs: number) {
  return Date.now() - updatedAt <= ttlMs;
}

export function readCachedData<T>(key: string, ttlMs: number): T | null {
  const inMemory = memoryCache.get(key);
  if (isValidEnvelope<T>(inMemory) && isFresh(inMemory.updatedAt, ttlMs)) {
    return inMemory.data;
  }

  const persistedRaw = storage.getString(key);
  if (!persistedRaw) {
    return null;
  }

  try {
    const parsed = JSON.parse(persistedRaw);
    if (!isValidEnvelope<T>(parsed) || !isFresh(parsed.updatedAt, ttlMs)) {
      return null;
    }

    memoryCache.set(key, parsed);
    return parsed.data;
  } catch {
    return null;
  }
}

export function writeCachedData<T>(key: string, data: T) {
  const envelope: CacheEnvelope<T> = {
    version: CACHE_SCHEMA_VERSION,
    updatedAt: Date.now(),
    data,
  };

  memoryCache.set(key, envelope);

  try {
    storage.set(key, JSON.stringify(envelope));
  } catch {}
}
