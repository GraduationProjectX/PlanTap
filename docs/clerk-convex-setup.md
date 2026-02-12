# Clerk Expo Setup (Official Quickstart, Mobile-Only)

This guide follows Clerk's official Expo quickstart and keeps setup minimal.

Scope of this document:

- `apps/mobile` only
- Clerk auth in Expo app
- No backend user-sync steps

Official reference:

- https://clerk.com/docs/expo/getting-started/quickstart

---

## 1) Clerk Dashboard

1. Create a Clerk app.
2. Enable **Native API**.
3. Enable **Google** provider.
4. Enable **Apple** provider.
5. Copy your **Publishable key**.

---

## 2) Mobile env

Create/update `apps/mobile/.env.local`:

```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
```

---

## 3) Install required packages

From repo root:

```bash
corepack pnpm --filter mobile add @clerk/clerk-expo expo-secure-store
```

---

## 4) Root provider (`app/_layout.tsx`)

Wrap the app with `ClerkProvider` and `tokenCache`.

```tsx
import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";

// ...existing imports

export default function RootLayout() {
  // ...existing setup

  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!publishableKey) {
    throw new Error("Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY");
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(public)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="+not-found" options={{ headerShown: true }} />
        </Stack>
      </ClerkProvider>
    </ThemeProvider>
  );
}
```

---

## 5) Route groups

Use route groups to protect screens.

```text
app/
  _layout.tsx
  +not-found.tsx
  (auth)/
    _layout.tsx
    sign-in.tsx
  (public)/
    _layout.tsx
    index.tsx
```

### `app/(auth)/_layout.tsx`

```tsx
import { useAuth } from "@clerk/clerk-expo";
import { Redirect, Stack } from "expo-router";

export default function AuthRoutesLayout() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) return null;
  if (isSignedIn) return <Redirect href="/" />;

  return <Stack />;
}
```

### `app/(public)/_layout.tsx`

```tsx
import { useAuth } from "@clerk/clerk-expo";
import { Redirect, Stack } from "expo-router";

export default function PublicRoutesLayout() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) return null;
  if (!isSignedIn) return <Redirect href="/(auth)/sign-in" />;

  return <Stack />;
}
```

---

## 6) Sign-in screen (OAuth)

In `app/(auth)/sign-in.tsx`, use `useOAuth()` for Google/Apple and set session active.

Key points:

- `WebBrowser.maybeCompleteAuthSession()` once at module scope.
- `startOAuthFlow({ strategy: "oauth_google" })` and `oauth_apple`.
- On success: `await setActive?.({ session: createdSessionId })` then `router.replace("/")`.

---

## 7) Sign out

Use `useClerk()` and call `signOut()` from any public screen (profile/settings).

```tsx
const { signOut } = useClerk();
await signOut();
router.replace("/(auth)/sign-in");
```

---

## 8) Validate

Run:

```bash
corepack pnpm --filter mobile dev -- -c
```

Checklist:

- Sign in with Google works.
- Sign in with Apple works on iOS.
- Signed-out users are redirected to `/(auth)/sign-in`.
- Signed-in users are redirected away from auth screens.
- Sign out returns user to auth flow.
