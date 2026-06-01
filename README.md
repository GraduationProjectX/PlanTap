<a id="readme-top"></a>

<div align="center">
  <img src="apps/mobile/assets/images/planTap-icon.png" alt="PlanTap logo" width="120" height="120" />

  <h1>PlanTap</h1>

  <p>
    PlanTap is an Events discovery app built with React Native(Expo) and Convex
  </p>

  <p>
    <a href="#about">About</a>
    |
    <a href="#getting-started">Getting Started</a>
    |
    <a href="#development">Development</a>
    |
    <a href="#troubleshooting">Troubleshooting</a>
  </p>
</div>

## About

The app combines an Expo React Native client with a Convex backend and shared TypeScript packages.

The current workspace is organized around:

- `apps/mobile`: Expo app, native mobile UI, routing, local storage, auth, maps, onboarding, and AI helpers.
- `packages/backend`: Convex functions, schema, ingestion, events, users, bookmarks, reviews, and webhook handling.
- `packages/shared`: shared TypeScript exports used across the workspace.
- `docs`: implementation notes, agent guides, and feature planning documents.

### Built With

- [Expo](https://expo.dev/)
- [React Native](https://reactnative.dev/)
- [Convex](https://www.convex.dev/)
- [Turborepo](https://turbo.build/repo)
- [pnpm](https://pnpm.io/)
- [TypeScript](https://www.typescriptlang.org/)
- [HeroUI Native](https://www.heroui.com/)

<p align="right"><a href="#readme-top">Back to top</a></p>

## Getting Started

### Prerequisites

Install these before running the app locally:

| Tool | Version | Notes |
| --- | --- | --- |
| Node.js | 20.19+ or 22 LTS | Required by Expo and the workspace tooling. |
| pnpm | 10+ | The repo is configured with `pnpm@10.28.2`. |
| Git | Latest | Required to clone and work with the repository. |
| Android Studio | Latest | Required for Android emulator/device builds. |

If pnpm is not available, enable it through Corepack:

```bash
corepack enable pnpm
```

### Installation

Clone the repository, install dependencies, then start the mobile app:

```bash
git clone https://github.com/GraduationProjectX/PlanTap.git
cd PlanTap
pnpm install
pnpm --filter mobile android
```

The first Android run can take several minutes because Expo builds the native project.

### Android Setup

1. Install Android Studio.
2. Open SDK Manager from `Tools > SDK Manager`.
3. Install Android SDK Platform 34 or newer.
4. Install Android SDK Build-Tools, Android Emulator, and Android SDK Platform-Tools.
5. Create and start an emulator from `Tools > Device Manager`.
6. Add platform tools to your PATH:

```text
%LOCALAPPDATA%\Android\Sdk\platform-tools
```

<p align="right"><a href="#readme-top">Back to top</a></p>

## Development

Run commands from the repository root unless noted otherwise.

### Workspace Commands

| Command | Description |
| --- | --- |
| `pnpm install` | Install all workspace dependencies. |
| `pnpm run dev` | Start all persistent development tasks through Turborepo. |
| `pnpm run build` | Build all packages that define a build task. |
| `pnpm run lint` | Lint the workspace. |
| `pnpm run typecheck` | Type-check the workspace. |
| `pnpm run format` | Format the workspace with oxfmt. |
| `pnpm run format:check` | Check formatting without writing changes. |
| `pnpm android` | Run the mobile app on Android. |
| `pnpm ios` | Run the mobile app on iOS. |

### Mobile Commands

| Command | Description |
| --- | --- |
| `pnpm --filter mobile dev -- -c` | Start Expo for a development client and clear cache. |
| `pnpm --filter mobile start` | Start the Expo Metro server. |
| `pnpm --filter mobile android` | Build and run the Android app. |
| `pnpm --filter mobile ios` | Build and run the iOS app on macOS. |
| `pnpm --filter mobile web` | Start the Expo web target. |

### Backend Commands

| Command | Description |
| --- | --- |
| `pnpm --filter backend dev` | Start Convex development mode. |
| `pnpm --filter backend typecheck` | Type-check the backend package. |
| `pnpm --filter backend lint` | Lint the backend package. |

<p align="right"><a href="#readme-top">Back to top</a></p>

## Troubleshooting

### pnpm reports ignored build scripts

Approve and rebuild pending scripts:

```bash
pnpm approve-builds
pnpm rebuild --pending
```

### Android emulator is not detected

Start an emulator in Android Studio, then confirm that `adb` can see it:

```bash
adb devices
```

### Android native project is malformed

Regenerate the native Android project from the Expo app:

```bash
cd apps/mobile
Remove-Item -Recurse -Force android
pnpm expo:prebuild -- --platform android
pnpm android
```

<p align="right"><a href="#readme-top">Back to top</a></p>

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.

<p align="right"><a href="#readme-top">Back to top</a></p>
