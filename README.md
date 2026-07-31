# Gear Organizer

Visual organizer for technical equipment and the places where it is stored. The repository is being
rebuilt from the project specification, beginning with a deliberately small mobile foundation.

## Current status

- Mobile: Ignite-based Expo Router application under `apps/mobile`.
- API preparation: typed `GET /api/hello` client with loading, success, error, and retry states.
- Backend and Docker Compose: planned next; see `docs/architecture.md`.
- Removed legacy Social Mirror features: authentication, partner flows, moods, ratings, calendar,
  and their mock API.

## Prerequisites

Install the common tools before continuing:

- Git.
- Node.js 24 LTS. The repository's `.nvmrc` selects this major version.
- Corepack, used to install the exact pnpm version declared by the mobile project.

For a native Android build, also install Android Studio, an Android SDK, and create an emulator.
For a native iOS build, use macOS with Xcode, Xcode Command Line Tools, CocoaPods, and an iOS
Simulator. iOS cannot be built locally on Windows.

The quickest smoke test is the web target, which does not require Android Studio or Xcode.

## First-time setup

### 1. Clone the repository

```bash
git clone git@github.com:codestorybro/yze.git
cd yze
```

If the repository is already cloned, open a terminal in its root directory instead.

### 2. Select Node.js 24

On macOS or Linux with `nvm`:

```bash
nvm install
nvm use
```

On Windows with nvm-windows, use PowerShell:

```powershell
nvm install 24
nvm use 24
```

Then install the package manager and dependencies. Run these commands from the repository root:

```bash
cd apps/mobile
corepack enable
corepack install
node --version
pnpm --version
pnpm install --frozen-lockfile
```

`node --version` should report `v24.x`, and `pnpm --version` should report `11.18.0`. All commands in
the following sections assume the terminal remains in `apps/mobile`.

### 3. Verify automatic development networking

The development commands automatically detect the computer's LAN IPv4 address and expose the future
API to every target through one URL, for example `http://192.168.1.42:8080`. A local `.env` file is
not required, and there is no separate URL to select for Android Emulator, iOS Simulator, or a
physical device.

Print the detected configuration without starting Expo:

```bash
pnpm dev:info
```

Every development command prints the selected URL before starting. If the computer has multiple
network interfaces and the wrong one is selected, override it for that terminal session.

On macOS or Linux:

```bash
EXPO_PUBLIC_API_URL=http://192.168.x.x:8080 pnpm start
```

On Windows PowerShell:

```powershell
$env:EXPO_PUBLIC_API_URL="http://192.168.x.x:8080"
pnpm start
```

`EXPO_PUBLIC_*` values are included in the client bundle and must never contain secrets. Do not
commit a real LAN address.

The backend is not implemented yet. The application itself can be opened, but pressing **Test API
connection** will show the expected error state until an API is running at the printed URL.

## Run the application

Choose one of the following targets.

### Web: fastest smoke test

```bash
pnpm web
```

Expo starts Metro and opens the application in a browser. Stop it with `Ctrl+C`.

### Android Emulator: first native run

1. Start an emulator from Android Studio's Device Manager.
2. Build, install, and start the Android development client:

```bash
pnpm android
```

The first run generates the uncommitted native project through Expo Continuous Native Generation,
compiles it, installs it in the emulator, and starts Metro.

For later sessions, start Metro and press `a` in the Expo terminal:

```bash
pnpm start
```

Run `pnpm android` again whenever a native dependency or native configuration changes.

### iOS Simulator: first native run

This workflow is available only on macOS:

1. Install and open Xcode once so it can finish installing its components.
2. Build, install, and start the iOS development client:

```bash
pnpm ios
```

For later sessions, start Metro and press `i` in the Expo terminal:

```bash
pnpm start
```

Run `pnpm ios` again whenever a native dependency or native configuration changes.

### Physical device

The computer and device must be on the same local network. Connect and unlock the device, then run:

```bash
# Android device
pnpm android:device

# iOS device on macOS; Apple signing may be required
pnpm ios:device
```

This project uses `expo-dev-client`. Expo Go is not the supported first-run path, and `pnpm start`
alone cannot install the required development client on a clean device.

### Daily development on several targets

After the development client is installed on each target, start one Metro server:

```bash
pnpm start
```

Then:

- press `a` to open the Android Emulator;
- press `i` to open the iOS Simulator on macOS;
- scan the QR code or open the development-client launcher on physical devices.

All connected clients receive platform-specific bundles from the same Metro process and use the
same detected API URL. TypeScript and JavaScript changes appear through Fast Refresh on every open
client. Rebuild a development client only after changing native dependencies, config plugins, or
native application configuration.

### Reusable local EAS builds

The `build:*` scripts create installable artifacts. They are useful for installing the same native
development client later or sharing it, but they do not choose the runtime API URL used by Metro.
They require the EAS CLI and a one-time Expo account login:

```bash
npm install --global eas-cli
eas login
```

Logging in to OMP is independent from logging in to EAS. The regular `pnpm start`, `pnpm android`,
and `pnpm ios` workflows do not require an EAS login.

```bash
# iOS Simulator and physical iPhone require separate binaries
pnpm build:ios:sim
pnpm build:ios:device

# The same Android development APK works on an emulator and a physical device
pnpm build:android:sim
```

For the fastest first installation on the current machine, prefer `pnpm ios`, `pnpm ios:device`,
`pnpm android`, or `pnpm android:device` because these commands also install the app and start Metro.

## Validate the mobile project

After installation, or before handing off a change, run:

```bash
pnpm format:check
pnpm lint:check
pnpm compile
pnpm test --runInBand
pnpm expo:doctor
```

To verify that the web bundle can be produced:

```bash
pnpm bundle:web
```

## Common startup problems

- **`pnpm` has the wrong version:** run `corepack enable` and `corepack install` again from
  `apps/mobile`.
- **No development build is installed:** use `pnpm android` or `pnpm ios` before `pnpm start`.
- **The wrong LAN interface was detected:** set `EXPO_PUBLIC_API_URL` for the terminal session using
  one of the override examples above.
- **A physical device cannot reach Metro or the future API:** verify that both devices use the same
  network, disconnect an interfering VPN, and allow the connection through the operating-system
  firewall.
- **A native dependency or native setting changed:** stop Metro, regenerate the native projects,
  and rebuild the selected platform:

  ```bash
  pnpm prebuild:clean
  pnpm android # or: pnpm ios
  ```

- **The API test fails while the UI works:** this is currently expected because the backend is the
  next project phase.

## Future backend networking requirement

The local backend must listen on all network interfaces at `0.0.0.0:8080`, not only on
`127.0.0.1`/`localhost`. Docker must publish host port `8080` to container port `8080`. Otherwise,
physical devices and emulators cannot reach the API through the LAN URL printed by the mobile
development launcher. This requirement applies only to local development; deployed environments
must use HTTPS.

## Agent workflow

All implementation happens on normal branches, never directly on `main` and never in Git
worktrees. `AGENTS.md` is the shared repository instruction file. Keep this Codex chat as the
integrating session; a second model-switching terminal should review or investigate while the
integrator is writing, so two agents do not mutate the same checkout concurrently.

### OMP terminal

OMP automatically reads `AGENTS.md`. Its committed `.omp/config.yml` asks before write operations,
keeps LSP diagnostics enabled, and disables task isolation/worktrees for this repository. Provider
credentials and personal model choices remain outside Git under `~/.omp`.

Complete private provider login once in your own terminal, then start OMP from the repository root:

```bash
omp setup
cd /path/to/yze
omp
```

Use `/model` to switch the active model, `Ctrl+P` to cycle configured models, or launch a one-off
session with `omp --model <model>`. While Codex is implementing, a useful OMP reviewer prompt is:

```text
Review the current branch against AGENTS.md and docs/GEAR_ORGANIZER_PROJECT_SPEC.md.
Do not modify files. Rank actionable findings P0-P3 and finish with a ship/block verdict.
```

Optional zsh completion can be enabled in `~/.zshrc` with `eval "$(omp completions zsh)"`.

See `docs/GEAR_ORGANIZER_PROJECT_SPEC.md` for the product scope and `docs/architecture.md` for the
current technical boundary.
