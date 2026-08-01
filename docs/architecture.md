# Architecture

## Current foundation

Yze is being built as a small monorepo. Historical bootstrap material uses the working name Gear
Organizer; `docs/GEAR_ORGANIZER_PROJECT_SPEC.md` remains an unchanged record of that initial scope.
The first implemented application is `apps/mobile`, generated from Ignite 11.5.0 and upgraded to the
current stable Expo SDK. It uses:

- Expo Router for file-based navigation;
- Expo Router native tabs behind `src/components/navigation/AppTabs.tsx` for adaptive bottom
  navigation;
- React Native and strict TypeScript;
- Ignite's theme and reusable UI primitives;
- `apisauce` behind a typed service boundary;
- `EXPO_PUBLIC_API_URL` as the explicit backend base URL;
- `scripts/development.mjs` as the local LAN URL launcher and native-config synchronizer for Expo
  commands.

The initial screen describes technical gear and storage places and owns only presentation state.
Network details and response validation live in `src/services/api`.

Platform-native visual effects are progressive enhancements behind semantic component boundaries.
The rules, supported component categories, fallback requirements, and first reference implementation
are documented in [`design-system.md`](./design-system.md).

```text
src/app/_layout.tsx
  -> src/app/(tabs)/_layout.tsx
    -> src/components/navigation/AppTabs.tsx
      -> src/app/(tabs)/index.tsx
        -> src/screens/GearOrganizerScreen.tsx
          -> src/services/api/index.ts
            -> GET {EXPO_PUBLIC_API_URL}/api/hello
```

## Visual architecture

Yze's brand lockup is **Yze — Gear, organized.** and its longer campaign line is **Get Yze. Get your
gear organized.** The interface translates Apple-like restraint and the Tesla app's strong hero-led
hierarchy into Yze's own visual language; it does not copy Tesla branding, assets, controls, or screen
layouts.

The theme boundary owns cool mineral neutrals, the restrained lime signal, light and dark variants,
typography, spacing, and shape. Components consume semantic color roles, so a screen never selects a
raw light- or dark-palette value. Light and dark modes preserve the same information hierarchy while
using independently designed surface and contrast relationships.

```text
theme tokens
  -> shared content primitives (Screen, Text, Button, future ContentCard)
  -> semantic feature components (BrandHeader, OrganizerHero, QuickAction, future PlaceCard and ItemRow)
  -> platform-adaptive controls (AppTabs, future FloatingToolbar and SearchControl)
  -> route screens
```

Screens own content composition, not platform capability decisions. Liquid Glass is limited to
system navigation or controls that genuinely float above content. `AppTabs` is the current reference
boundary: supported iOS versions receive the native material, while older iOS and Android retain
their deliberate native treatments. Heroes, cards, rows, forms, and status panels remain semantic
content surfaces on every platform; no custom blur stack attempts to imitate Liquid Glass.

The Home composition has one dominant hero, at most three high-frequency quick actions, and a
restrained single-column flow. A future populated hero represents the active place or gear context,
not a copied vehicle metaphor. Planned actions are **Add item**, **Add place**, and **Find gear**;
planned sections include **Recent gear**, **Your spaces**, and **Unplaced items**. They must appear
only when backed by real behavior and data. During Phase 0, the empty state remains truthful and the
API connection check is presented as subordinate development status rather than the product's main
value.

## Phase 0 boundary and planned backend

This branch covers mobile cleanup and the toolchain refresh; it is not yet the completed vertical
slice. The project specification calls for an ASP.NET Core 10 API in `apps/backend`, a mobile
development container, and a root `compose.yaml`. Those pieces are intentionally pending; the first
backend endpoint will be `GET /api/hello` returning `{ "message": "..." }`.

## Development networking

The mobile `start`, `web`, `android`, and `ios` commands detect the development machine's LAN IPv4
address and set one process-local URL such as `http://192.168.1.42:8080`. The same Metro process and
URL can therefore serve the web target, both simulators/emulators, and physical devices on the same
network. `EXPO_PUBLIC_API_URL` remains an optional terminal override for VPN or multi-interface
machines; it is public bundle configuration, never a secret.

Native clear-text/local-network permissions are selected by `APP_VARIANT=development`, independently
of the runtime API address. Local Expo commands and EAS development profiles set this build variant.
Preview and production profiles do not enable the development exception and must use HTTPS.

Before `expo run:ios` or `expo run:android`, the development launcher resolves Expo's prebuild config
and fingerprints it together with referenced native assets and `pnpm-lock.yaml`. Each generated
platform stores its own fingerprint inside its ignored native directory. A changed or missing
fingerprint triggers one clean, platform-specific CNG prebuild before compilation; an unchanged
fingerprint goes directly to the incremental native build. The runtime LAN API URL is deliberately
excluded from this fingerprint because changing networks does not change native code.

The generated `ios` and `android` directories are disposable implementation output. Required native
customization belongs in Expo config or a config plugin, never as an untracked manual edit. EAS keeps
using its own isolated prebuild and is not coupled to the local fingerprint.
Machine-local `android/local.properties` is the exception: the launcher preserves it across CNG and
falls back to Android Studio's standard SDK location when no Android SDK environment variable is
available.

The future local ASP.NET Core API must bind to `0.0.0.0:8080` (all interfaces), rather than only
`127.0.0.1`. Docker Compose must publish host port `8080` to container port `8080`. Without both
settings, physical devices and emulators cannot reach the host through the automatically selected
LAN URL.

## Deliberate omissions

Authentication, persistent storage, database migrations, gear CRUD, image uploads, and cloud
deployment are outside the current slice. Add them only through separate, scoped branches.

The future domain is a tree of storage `Place` records (room, cabinet, drawer, shelf, box, backpack,
case, or desk setup) containing nested places and technical `Item` records such as cables, adapters,
computers, camera equipment, networking devices, tools, and spare parts. This is documentation only;
no domain models or CRUD are part of Phase 0.
