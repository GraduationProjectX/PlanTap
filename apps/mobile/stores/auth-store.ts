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
  _hasHydrated: boolean;
  setUser: (user: AuthUserCache | null) => void;
  setSignedIn: (value: boolean, user?: AuthUserCache) => void;
  clearAuth: () => void;
  _setHasHydrated: (value: boolean) => void;
};

const initialAuthState: { user: AuthUserCache | null; isSignedIn: boolean; _hasHydrated: boolean } =
  {
    user: null,
    isSignedIn: false,
    _hasHydrated: false,
  };

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...initialAuthState,
      _setHasHydrated: (value) => set({ _hasHydrated: value }),
      setUser: (user) =>
        set({
          user,
          isSignedIn: !!user,
        }),
      setSignedIn: (value, user) => {
        if (!value) {
          set((state) => ({
            ...initialAuthState,
            _hasHydrated: state._hasHydrated,
          }));
          return;
        }

        if (!user) {
          throw new Error("setSignedIn(true) requires a user payload");
        }

        set({ user, isSignedIn: true });
      },
      clearAuth: () =>
        set((state) => ({
          ...initialAuthState,
          _hasHydrated: state._hasHydrated,
        })),
    }),
    {
      name: STORAGE_KEYS.AUTH_STATE,
      storage: createJSONStorage(() => zustandMMKVStorage),
      version: 1,
      partialize: (state) => ({
        user: state.user,
        isSignedIn: state.isSignedIn,
      }),
      onRehydrateStorage: () => {
        return (state, error) => {
          state?._setHasHydrated(true);

          if (error) {
            console.error("Failed to rehydrate auth store", error);
          }
        };
      },
    },
  ),
);
