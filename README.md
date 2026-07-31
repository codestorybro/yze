# Gear Organizer

Visual organizer for technical equipment and the places where it is stored. The repository is being
rebuilt from the project specification, beginning with a deliberately small mobile foundation.

## Current status

- Mobile: Ignite-based Expo Router application under `apps/mobile`.
- API preparation: typed `GET /api/hello` client with loading, success, error, and retry states.
- Backend and Docker Compose: planned next; see `docs/architecture.md`.
- Removed legacy Social Mirror features: authentication, partner flows, moods, ratings, calendar,
  and their mock API.

## Requirements

- Node.js 24 LTS (`nvm use` reads the committed `.nvmrc`)
- Corepack with pnpm 11
- Android Studio or Xcode for native development builds

## Install and validate

```bash
nvm use
cd apps/mobile
corepack enable
pnpm install
cp ../../.env.example .env
pnpm format:check
pnpm lint:check
pnpm compile
pnpm test --runInBand
pnpm expo:doctor
```

## Run the mobile app

Start the development client bundler:

```bash
cd apps/mobile
pnpm start
```

For the browser, use `pnpm web`. For a locally generated native app, use `pnpm ios` or
`pnpm android`. The hello request will show an expected connection error until the backend is
running on the URL configured in `apps/mobile/.env`.

Android Emulator cannot reach the host through `localhost`; set
`EXPO_PUBLIC_API_URL=http://10.0.2.2:8080` instead. A physical device needs the development
machine's LAN address.

## Agent workflow

All implementation happens on normal branches, never directly on `main` and never in Git
worktrees. `AGENTS.md` is the shared repository instruction file. Keep this Codex chat as the
integrating session; a second model-switching terminal should review or investigate while the
integrator is writing, so two agents do not mutate the same checkout concurrently.

See `docs/GEAR_ORGANIZER_PROJECT_SPEC.md` for the product scope and `docs/architecture.md` for the
current technical boundary.
