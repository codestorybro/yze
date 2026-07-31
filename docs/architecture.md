# Architecture

## Current foundation

Gear Organizer is being rebuilt as a small monorepo. The first implemented application is
`apps/mobile`, generated from Ignite 11.5.0 and upgraded to the current stable Expo SDK. It uses:

- Expo Router for file-based navigation;
- React Native and strict TypeScript;
- Ignite's theme and reusable UI primitives;
- `apisauce` behind a typed service boundary;
- `EXPO_PUBLIC_API_URL` as the explicit backend base URL.

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

## Environment URLs

- Web and iOS Simulator: `http://localhost:8080`
- Android Emulator: `http://10.0.2.2:8080`
- Physical device: the development machine's LAN address

Local clear-text HTTP is enabled by Expo build properties only when the configured public API URL
starts with `http://`. Production builds should use HTTPS.

## Deliberate omissions

Authentication, persistent storage, database migrations, gear CRUD, image uploads, and cloud
deployment are outside the current slice. Add them only through separate, scoped branches.

The future domain is a tree of storage `Place` records (room, cabinet, drawer, shelf, box, backpack,
case, or desk setup) containing nested places and technical `Item` records such as cables, adapters,
computers, camera equipment, networking devices, tools, and spare parts. This is documentation only;
no domain models or CRUD are part of Phase 0.
