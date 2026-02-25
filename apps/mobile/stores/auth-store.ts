import { STORAGE_KEYS } from "@/storage/keys";
import { zustandMMKVStorage } from "@/storage/mmkv";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type AuthUserCache = {
  clerkUserId: string;
};

type AuthState = {
  user: AuthUserCache | null;
  isSignedIn: boolean;
  setUser: (user: AuthUserCache | null) => void;
  setSignedIn: (value: boolean, user?: AuthUserCache) => void;
  clearAuth: () => void;
};

const initialAuthState = {
  user: null as AuthUserCache | null,
  isSignedIn: false,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...initialAuthState,
      setUser: (user) =>
        set({
          user,
          isSignedIn: !!user,
        }),
      setSignedIn: (value, user) => {
        if (!value) {
          set(initialAuthState);
          return;
        }

        if (!user) {
          throw new Error("setSignedIn(true) requires a user payload");
        }

        set({ user, isSignedIn: true });
      },
      clearAuth: () => set(initialAuthState),
    }),
    {
      name: STORAGE_KEYS.AUTH_STATE,
      storage: createJSONStorage(() => zustandMMKVStorage),
      version: 1,
    },
  ),
);
