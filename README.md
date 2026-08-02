# Yze

**Gear, organized.** Yze is a visual home for technical equipment and the places where it is
stored. The repository is being rebuilt from the original project specification, beginning with a
deliberately small mobile foundation.

## Current status

- Mobile: Ignite-based Expo Router application under `apps/mobile`.
- Core experience: persistent root and arbitrarily nested Places, mixed Place/Item contents, creation,
  editing, movement, safe deletion, and a curated Item icon catalogue.
- Visual foundation: adaptive light/dark theme, native bottom navigation, visual Place maps,
  object-like Item cards, meaningful reduced-motion-aware transitions, and semantic photo fallbacks.
- Brand assets: initial Yze launcher icon, adaptive splash artwork, and theme-specific organizer
  hero imagery.
- API: ASP.NET Core 10 Minimal API with typed DTOs, Problem Details errors, hierarchy protection, and
  a connectivity endpoint.
- Persistence: EF Core 10 + SQLite, an initial Places/Items migration, and a named Docker volume.
- Removed legacy Social Mirror features: authentication, partner flows, moods, ratings, calendar,
  and their mock API.

## Prerequisites

Install the common tools before continuing:

- Git.
- Node.js 24 LTS. The repository's `.nvmrc` selects this major version.
- Corepack, used to install the exact pnpm version declared by the mobile project.
- Docker Desktop for the recommended cross-platform backend workflow, or the .NET 10 SDK for local
  backend development and migration tooling.

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

`node --version` should report `v24.x`, and `pnpm --version` should report `11.18.0`. Mobile commands
in the following sections run from `apps/mobile`; backend commands run from the repository root.

### 3. Start the backend

Open a second terminal in the repository root and start the API:

```bash
docker compose up --build api
```

Wait for the health check, then verify it from another terminal:

```bash
curl --fail http://localhost:8080/health
```

The response should be `{"status":"healthy"}`. Compose stores the SQLite database in the named
`yze-data` volume, so Places and Items survive container recreation. `Ctrl+C` stops the foreground
container. `docker compose down` removes the container while preserving data.

If the .NET 10 SDK is installed locally, backend build, tests, and migrations are also available:

```bash
dotnet tool restore
dotnet restore apps/backend/Yze.slnx
dotnet build apps/backend/Yze.slnx --no-restore
dotnet test apps/backend/Yze.slnx --no-build
dotnet ef database update --project apps/backend/Yze.Api --startup-project apps/backend/Yze.Api
```

Run the API without Docker with `dotnet run --project apps/backend/Yze.Api`; the development profile
listens on `0.0.0.0:8080`, so simulators and LAN devices use the same address strategy as Compose.

Without a host .NET SDK, run the same integration suite through the Docker test stage:

```bash
docker build --target test --tag yze-backend-test apps/backend
```

### 4. Verify automatic development networking

The development commands automatically detect the computer's LAN IPv4 address and expose the Yze
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

Keep the Compose API running while developing. The Home connection check and the Places/Items flows
use the same printed URL.

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

The command resolves the Expo native configuration, regenerates the uncommitted Android project
through Continuous Native Generation when its fingerprint is stale, compiles it, installs it, and
starts Metro. The fingerprint includes native dependencies and referenced icon/splash assets, so a
branding change at the same file path is detected too. The launcher preserves an existing
`android/local.properties` across a clean prebuild and can detect the standard Android Studio SDK
location when `ANDROID_HOME` is not exported.

For later sessions, start Metro and press `a` in the Expo terminal:

```bash
pnpm start
```

Run `pnpm android` again whenever a native dependency, icon, splash, or native configuration
changes. The clean prebuild runs only when that platform's fingerprint changed; ordinary rebuilds
reuse the existing Android project.

### iOS Simulator: first native run

This workflow is available only on macOS:

1. Install and open Xcode once so it can finish installing its components.
2. Build, install, and start the iOS development client:

```bash
pnpm ios
```

As on Android, the command regenerates the ignored iOS project only when its resolved native
configuration or referenced assets changed. The first run after the Yze rebrand replaces the old
launcher name, icon, and splash before installing the application.

For later sessions, start Metro and press `i` in the Expo terminal:

```bash
pnpm start
```

Run `pnpm ios` again whenever a native dependency, icon, splash, or native configuration changes.
Ordinary JavaScript and TypeScript changes do not trigger a prebuild.

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
- **A physical device cannot reach Metro or the API:** verify that both devices use the same
  network, disconnect an interfering VPN, and allow the connection through the operating-system
  firewall.
- **A native dependency, icon, splash, or native setting changed:** stop Metro and run `pnpm
android` or `pnpm ios`. The launcher detects the change, performs a clean prebuild for that
  platform, and then rebuilds it. `pnpm prebuild:clean` remains the manual recovery command if a
  generated native project was edited or corrupted:

  ```bash
  pnpm prebuild:clean
  pnpm android # or: pnpm ios
  ```

- **The launcher or launch screen still flashes cached Ignite branding:** the current iOS config
  uses `UILaunchScreen` specifically to replace snapshots created by the old Ignite storyboard.
  Stop Metro and install a fresh native build with `pnpm ios:device` (or `pnpm ios` for the
  simulator). If a device still has a build older than Yze `1.0.1 (2)`, run `pnpm prebuild:clean`
  before reinstalling. Removing the app and restarting the device is now only a last-resort cleanup
  for an operating-system cache, not a normal development step. The package and bundle identifiers
  intentionally remain stable; the visible application name is `Yze`. See Apple's
  [launch-screen troubleshooting note](https://developer.apple.com/documentation/technotes/tn3118-debugging-your-apps-launch-screen).

- **The API or Places screen cannot connect:** run `docker compose ps`, verify that `api` is healthy,
  and confirm `curl http://localhost:8080/health` succeeds. For a physical device, also verify the
  host firewall and the LAN address printed by `pnpm dev:info`.

## Backend networking

The local backend listens on all network interfaces at `0.0.0.0:8080`, not only on
`127.0.0.1`/`localhost`. Docker must publish host port `8080` to container port `8080`. Otherwise,
physical devices and emulators cannot reach the API through the LAN URL printed by the mobile
development launcher. This requirement applies only to local development; deployed environments
must use HTTPS.

## Agent workflow

Implementation happens directly on `main`, never in Git worktrees. Changes are divided into focused
commits, but the user reviews and creates every commit manually. `AGENTS.md` is the shared repository
instruction file. Keep this Codex chat as the integrating session; a second model-switching terminal
should review or investigate while the integrator is writing, so two agents do not mutate the same
checkout concurrently.

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
Review the current changes against AGENTS.md and docs/places-items.md.
Do not modify files. Rank actionable findings P0-P3 and finish with a ship/block verdict.
```

Optional zsh completion can be enabled in `~/.zshrc` with `eval "$(omp completions zsh)"`.

See `docs/places-items.md` for the current domain/API contract, `docs/design-system.md` for visual
rules, and `docs/architecture.md` for the technical boundary. `docs/GEAR_ORGANIZER_PROJECT_SPEC.md`
is retained as the historical bootstrap brief.
