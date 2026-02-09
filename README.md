# 🌱 PlanTap

**A Collaborative University Schedule App** built with Expo (React Native), Turborepo, and pnpm workspaces.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

| Tool               | Version                | Download Link                                                 |
| ------------------ | ---------------------- | ------------------------------------------------------------- |
| **Node.js**        | 20[must be 20 exactly] | [nodejs.org](https://nodejs.org/)                             |
| **pnpm**           | 10+ (via Corepack)     | [pnpm.io](https://pnpm.io/)                                   |
| **Android Studio** | Latest                 | [developer.android.com](https://developer.android.com/studio) |
| **Git**            | Latest                 | [git-scm.com](https://git-scm.com/)                           |

> pnpm is managed via Corepack (ships with Node). In this repo you can always use `corepack pnpm ...`.

### Android Studio Setup

1. Install Android Studio
2. Open **SDK Manager** (Tools → SDK Manager)
3. Install:
   - **SDK Platforms**: Android 14 (API 34)
   - **SDK Tools**: Android SDK Build-Tools, Android Emulator, Android SDK Platform-Tools
4. Create an emulator (Tools → Device Manager → Create Device)
5. Add to your system PATH:
   ```
   %LOCALAPPDATA%\Android\Sdk\platform-tools
   ```

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_ORG/PlanTap.git
cd PlanTap
```

### 2. Install Dependencies

```bash
corepack pnpm install
```

This installs all dependencies for the entire monorepo (mobile app, backend, shared packages).

### 3. Run the Mobile App

```bash
corepack pnpm --filter mobile android
```

> **First run takes 5-10 minutes** as it builds the native Android project.

---

## 📁 Project Structure

```
PlanTap/
├── apps/
│   └── mobile/          # 📱 Expo React Native app
│       ├── app/         # Expo Router screens
│       ├── components/  # Reusable UI components
│       ├── theme/       # Unistyles design system
│       ├── locales/     # i18n translations (ar, en)
│       └── android/     # Native Android project (generated)
├── packages/
│   ├── backend/         # ⚙️ Convex backend
│   └── shared/          # 📦 Shared types & utilities
├── turbo.json           # Turborepo configuration
├── package.json         # Root workspace config
├── pnpm-workspace.yaml  # Workspace config
└── pnpm-lock.yaml       # Lockfile
```

---

## 📜 Available Scripts

Run these from the **root** directory:

| Command                       | Description                   |
| ----------------------------- | ----------------------------- |
| `corepack pnpm install`       | Install all dependencies      |
| `corepack pnpm run dev`       | Start all development servers |
| `corepack pnpm run build`     | Build all packages            |
| `corepack pnpm run lint`      | Lint all packages             |
| `corepack pnpm run typecheck` | Type-check all packages       |

Run these from `apps/mobile/`:

| Command                 | Description                     |
| ----------------------- | ------------------------------- |
| `corepack pnpm dev`     | Start Metro for Dev Client      |
| `corepack pnpm android` | Run on Android emulator/device  |
| `corepack pnpm ios`     | Run on iOS simulator (Mac only) |
| `corepack pnpm start`   | Start Metro bundler only        |

---

## 🔧 Troubleshooting

### pnpm build scripts are blocked

If `corepack pnpm install` warns about **Ignored build scripts**, run:

```bash
corepack pnpm approve-builds
corepack pnpm rebuild --pending
```

### "The android project is malformed"

Delete the android folder and regenerate:

```bash
cd apps/mobile
Remove-Item -Recurse -Force android
corepack pnpm prebuild
corepack pnpm android
```

### Android emulator not detected

1. Open Android Studio
2. Start an emulator from Device Manager
3. Verify with: `adb devices` (should show your emulator)

## 📝 License

MIT License - see [LICENSE](LICENSE) for details.
