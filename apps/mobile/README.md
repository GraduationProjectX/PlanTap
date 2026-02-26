# 📱 PlanTap Mobile App

Expo React Native app for PlanTap - a collaborative university schedule app.

## Quick Start

```bash
# From the repo root
pnpm --filter mobile android

# Or from this directory
pnpm android
```

## Development

### Running on Device

1. Enable **USB Debugging** on your Android phone
2. Connect via USB
3. Run `adb devices` to verify connection
4. Run `pnpm --filter mobile android`

### Hot Reload

The app auto-reloads when you save files. If something breaks:

- Press `r` in the terminal to reload
- Press `m` for the dev menu

### Project Structure

```
mobile/
├── app/              # Screens (Expo Router file-based routing)
│   ├── (auth)/       # Guest-only routes (sign-in)
│   ├── (main)/       # Signed-in routes
│   │   ├── (tabs)/   # Bottom tabs navigator
│   ├── _layout.tsx   # Root layout with providers
│   └── +not-found.tsx
├── components/       # Reusable UI components
├── theme/            # Unistyles design system
│   └── unistyles.ts  # Colors, spacing, typography tokens
├── locales/          # Translations
│   ├── ar.json       # Arabic
│   └── en.json       # English
├── i18n.ts           # i18next configuration
├── rtl.ts            # RTL layout utilities
└── app.json          # Expo configuration
```

See `ROUTING.md` for a detailed explanation of the `(auth)` + `(main)` route architecture.

### Adding New Screens

Create a new file in the route group that owns it (`(main)` or `(auth)`):

```tsx
// app/(main)/settings/notifications.tsx
export default function NotificationsScreen() {
  return (
    <View>
      <Text>Notifications</Text>
    </View>
  );
}
```

Navigate to it with a path that excludes route groups.

### Adding Translations

1. Add keys to `locales/ar.json` and `locales/en.json`
2. Use in components:

```tsx
import { useTranslation } from "react-i18next";

function MyComponent() {
  const { t } = useTranslation();
  return <Text>{t("myKey")}</Text>;
}
```

## Building for Production

```bash
# Generate APK
cd android
./gradlew assembleRelease
```

APK will be at: `android/app/build/outputs/apk/release/`
