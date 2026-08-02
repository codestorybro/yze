# Architecture

## Current system

Yze is a small monorepo with a React Native application and an ASP.NET Core API:

```text
apps/mobile   Expo Router + React Native + TypeScript
     |
     | HTTP / RFC 7807
     v
apps/backend  ASP.NET Core 10 Minimal API + EF Core 10
     |
     v
   SQLite     yze.db / Docker named volume
```

`docs/GEAR_ORGANIZER_PROJECT_SPEC.md` is the unchanged historical bootstrap brief.
[`places-items.md`](./places-items.md) is the current domain and API contract.

## Mobile

The mobile app retains its Ignite foundation and uses:

- Expo Router for file-based routes and a nested Stack inside the Places native tab;
- Expo Router native tabs behind `src/components/navigation/AppTabs.tsx`;
- strict TypeScript and semantic Ignite-derived theme primitives;
- `apisauce` behind `src/services/api`, including runtime response guards and structured API errors;
- `EXPO_PUBLIC_API_URL` as the explicit public backend base URL;
- Reanimated for short layout/spring transitions, a root toast host for persistent mutation
  feedback, and best-effort Expo Haptics after confirmed mutations;
- `expo-symbols` with an explicit semantic `iconKey` catalogue and generic fallback;
- `scripts/development.mjs` for one automatic LAN URL across simulators and physical devices.

Routes stay thin. Feature composition lives in `src/screens`, reusable Place/Item surfaces live in
`src/components/organizer`, form serialization and icon mapping live in `src/features/organizer`,
and no screen calls `fetch` directly.

Within the Places Stack, the global native tab bar is hidden while route-level native Stack
toolbars provide contextual actions. `FloatingBackButton` owns the fixed Back control in transparent
Stack headers, and native form-sheet routes open at 80% with a stable full-height expansion detent. `ContextualToolbar` and
`FloatingBackButton` isolate the native implementations and provide web fallbacks; feature screens
contain no platform/version checks. Form-sheet screens opt out of the full-screen status-bar and
Back-button content clearances so their content remains aligned to the sheet itself. Their shared
`SheetScrollView`/`SheetList` boundary renders a scrollable as the route's first native content view,
allowing `react-native-screens` to coordinate detents and keyboard insets reliably.

```text
(tabs)/places/index
  -> PlacesScreen
    -> useFocusedApiResource
      -> services/api
        -> GET /api/places

(tabs)/places/[placeId]
  -> PlaceDetailsScreen
    -> GET /api/places/{id}
      -> ancestry + direct child Places + direct Items
```

### Server-state strategy

The repository did not have a query/cache library. The first domain slice deliberately extends the
existing local-state approach with a small focus-aware resource hook instead of introducing a second
data layer. It keeps existing data during pull-to-refresh, ignores obsolete responses, exposes retry,
and refetches when a route regains focus. A successful form closes only after persistence succeeds;
the source route then reloads. Moving content therefore refreshes the source immediately and the
destination the next time it becomes visible.

If future features require cross-screen optimistic updates, offline synchronization, or background
refetch, replace this boundary with one shared query solution rather than building another cache in
parallel.

## Backend

`apps/backend/Yze.Api` is a deliberately direct ASP.NET Core 10 Minimal API. Endpoint modules use
`YzeDbContext` without CQRS, MediatR, generic repositories, or speculative application layers.
Persistence entities never leave the API; endpoint contracts are explicit records.

The domain contains only `Place` and `Item`. A Place has a restrictive self-reference and Items have
a restrictive required Place reference. Cycle checks walk only the proposed ancestry, Place details
load one direct level, and summary counts are projected by SQL. Moving a Place uses a serializable
transaction. Deleting a non-empty Place is checked in the domain flow and protected again by foreign
keys.

Errors use ASP.NET Core Problem Details with stable machine-readable codes. Mobile preserves field
errors and domain conflicts rather than flattening every 4xx response. The permissive browser CORS
policy is enabled only in the Development environment; deployed origins must be configured
explicitly when a web deployment exists.

### Persistence

SQLite provides durable local persistence without adding another service. The first EF migration is
`InitialPlacesAndItems`; indexes exist on `Places.ParentPlaceId` and `Items.PlaceId`. Tags are a small
JSON array in one text column, dates use `DateOnly`, timestamps use UTC `DateTimeOffset`, and prices
use `decimal(19,4)`.

The API runs at `0.0.0.0:8080`. `compose.yaml` publishes port `8080` and mounts the named `yze-data`
volume at `/data`. This clear-text binding is development-only; deployed environments use HTTPS.

## Visual architecture

Yze's brand lockup is **Yze — Gear, organized.** The interface uses cool mineral neutrals, one
restrained lime signal, strong imagery, quiet spacing, and independently designed light/dark themes.
Screens consume semantic tokens and never select raw palette values.

```text
theme tokens
  -> shared primitives (Screen, ListScreen, Text, Button, FormField)
  -> domain surfaces (PlaceCard, ItemCard, ItemIcon, RemotePhoto)
  -> platform-adaptive controls (AppTabs and native Stack presentation)
  -> route screens
```

Place cards read as containers; Item cards read as physical objects. Missing images use intentional
semantic artwork rather than broken placeholders. Liquid Glass remains limited to native floating
navigation/controls and is not emulated on content cards. The full adaptive-surface and design review
rules remain in [`design-system.md`](./design-system.md).

## Development networking and native generation

The mobile `start`, `web`, `android`, and `ios` commands detect the development machine's LAN IPv4
address and expose `http://<LAN-IP>:8080` to every connected target. `EXPO_PUBLIC_API_URL` remains an
optional terminal override and is never a secret. The API must bind to all interfaces so physical
devices can reach it.

Native clear-text permissions are controlled by `APP_VARIANT=development`, independently from the
runtime URL. Generated `ios` and `android` directories remain disposable CNG output. Native
dependencies, config plugins, and assets are fingerprinted by the launcher; changes trigger a clean
platform-specific prebuild.

## Current boundaries

- No authentication, users, tenancy, sharing, or collaboration.
- No binary image upload; only optional remote HTTPS URLs and visual fallbacks.
- No offline synchronization or competing persistent API cache.
- No QR/barcode/OCR/AI recognition, analytics dashboard, or drag-and-drop physics.
- SQLite and automatic startup migration assume one local API instance; production scaling requires
  an explicit database/deployment decision.
