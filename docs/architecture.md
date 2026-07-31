# Architecture

## Current foundation

Gear Organizer is being rebuilt as a small monorepo. The first implemented application is
`apps/mobile`, generated from Ignite 11.5.0 and upgraded to the current stable Expo SDK. It uses:

- Expo Router for file-based navigation;
- React Native and strict TypeScript;
- Ignite's theme and reusable UI primitives;
- `apisauce` behind a typed service boundary;
- `EXPO_PUBLIC_API_URL` as the explicit backend base URL;
- `scripts/development.mjs` as the local LAN URL launcher for Expo commands.

The initial screen describes technical gear and storage places and owns only presentation state.
Network details and response validation live in `src/services/api`.

```text
src/app/index.tsx
  -> src/screens/GearOrganizerScreen.tsx
    -> src/services/api/index.ts
      -> GET {EXPO_PUBLIC_API_URL}/api/hello
```

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
