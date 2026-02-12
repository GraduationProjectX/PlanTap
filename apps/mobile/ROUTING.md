# Expo Router structure: `(auth)` + `(main)`

This app uses protected route groups with Clerk auth state:

- `(auth)`: screens for signed-out users.
- `(main)`: the signed-in app shell.

Route groups are organizational folders and are not part of the URL path.

## Folder tree

```text
app/
  _layout.tsx
  +not-found.tsx
  (auth)/
    _layout.tsx
    sign-in.tsx
  (main)/
    _layout.tsx
    (tabs)/
      _layout.tsx
      index.tsx
      map.tsx
      suggest.tsx
      community.tsx
      profile.tsx
    event/
      [id].tsx
    plan/
      [id].tsx
    settings/
      index.tsx
```

## Why this structure

### 1) Root-level guards (Expo Router best practice)

`app/_layout.tsx` uses `Stack.Protected`:

- `guard={isSignedIn}` for `(main)`
- `guard={!isSignedIn}` for `(auth)`

This keeps auth rules in one place and avoids repeated redirect logic inside each screen.

### 2) Clear navigator ownership

- `app/(main)/_layout.tsx` owns signed-in stack routes.
- `app/(main)/(tabs)/_layout.tsx` owns bottom tabs.
- Detail screens (`event/[id]`, `plan/[id]`, `settings/index`) live next to tabs in the same signed-in stack.

### 3) Stable tab IA while features are in progress

- `community` tab is visible but disabled for now.
- Users can see planned information architecture without entering unfinished flows.

## Navigation flow

1. App boots through `app/_layout.tsx`.
2. Clerk auth state resolves.
3. If signed out, only `(auth)` routes are available.
4. If signed in, only `(main)` routes are available.
5. Tabs are rendered inside `(main)/(tabs)`.

## Practical rule of thumb

- Keep access control in protected layouts, not individual screens.
- Use route groups for semantics: `(auth)` for guest flow, `(main)` for authenticated shell.
- Use nested layouts to model navigator hierarchy (stack -> tabs -> screen).
