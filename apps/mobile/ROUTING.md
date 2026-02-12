# Expo Router structure: `(auth)` + `(public)`

This app now uses two top-level route groups:

- `(auth)`: screens for users who are not signed in.
- `(public)`: screens for users who are signed in.

Route groups are organizational folders and are not part of the URL path.

## Folder tree

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

## Why this structure

### 1) Clear access boundaries

- `(auth)` handles guest-only screens.
- `(public)` handles signed-in screens.
- Each group has its own `_layout.tsx`, so access control is centralized and consistent.

### 2) Predictable redirects with Clerk

- In `app/(auth)/_layout.tsx`:
  - If the user is signed in, redirect to `/`.
  - If not signed in, allow auth screens.
- In `app/(public)/_layout.tsx`:
  - If the user is not signed in, redirect to `/(auth)/sign-in`.
  - If signed in, allow public screens.

This means deep links and app restarts always land in the correct area for the current auth state.

### 3) Root layout stays focused on app-wide concerns

`app/_layout.tsx` now only does global setup:

- Providers (theme + Clerk).
- Font/splash setup.
- Registering top-level stacks: `(public)`, `(auth)`, and `+not-found`.

This keeps auth logic out of the root and prevents the root layout from becoming a "god file."

## Navigation flow

1. App boots through `app/_layout.tsx`.
2. Router enters `(public)` by default.
3. `(public)` layout checks auth:
   - Not signed in -> redirect to `/(auth)/sign-in`.
   - Signed in -> render public screens.
4. If a signed-in user opens an auth screen, `(auth)` layout redirects them back to `/`.

## Practical rule of thumb

- Put auth-state checks in group layouts, not in every screen.
- Keep screens simple; keep routing/guard logic close to the navigator that owns them.
