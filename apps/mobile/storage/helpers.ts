import { storage } from "@/storage/mmkv";

export const setString = (key: string, value: string) => {
  storage.set(key, value);
};

export const getString = (key: string) => {
  return storage.getString(key) ?? null;
};

export const setBoolean = (key: string, value: boolean) => {
  storage.set(key, value);
};

export const getBoolean = (key: string) => {
  return storage.getBoolean(key) ?? null;
};

export const setNumber = (key: string, value: number) => {
  storage.set(key, value);
};

export const getNumber = (key: string) => {
  return storage.getNumber(key) ?? null;
};

export const setJSON = <T>(key: string, value: T) => {
  storage.set(key, JSON.stringify(value));
};

export const getJSON = <T>(key: string) => {
  const rawValue = storage.getString(key);
  if (!rawValue) return null;

  try {
    return JSON.parse(rawValue) as T;
  } catch {
    return null;
  }
};

export const removeValue = (key: string) => {
  storage.remove(key);
};

export const clearStorage = () => {
  storage.clearAll();
};
