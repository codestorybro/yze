# Yze agent guide

This file is the canonical repository guidance for Codex and other coding agents.

## Product and scope

- Build **Yze**, a visual organizer for technical equipment and storage places. Its brand lockup is
  **Yze — Gear, organized.**
- Treat `docs/places-items.md` as the current Places/Items product and API contract.
  `docs/GEAR_ORGANIZER_PROJECT_SPEC.md` is the historical bootstrap brief.
- The current milestone contains the first persisted Places/Items vertical slice. Do not expand it
  into authentication, sharing, media upload, offline synchronization, scanning, AI recognition, or
  cloud infrastructure unless a task explicitly changes that boundary.

## Git workflow

- Implement subsequent changes directly on `main`; do not create a separate branch for each task.
- Do not create or use Git worktrees in this repository.
- OMP reads this file and `.omp/config.yml`. Do not override the repository setting that disables
  task isolation/worktrees.
- Before editing, inspect the current branch and working-tree state. Preserve unrelated user changes.
- Divide work into focused commits and always include a proposed commit message in the handoff.
  Never create commits: the user reviews the changes and commits them manually.
- Leave validation results in the handoff.
- Only one terminal/agent should write to the shared checkout at a time. Other model sessions may
  review, investigate, or propose diffs, then hand ownership back before edits begin.
- Treat this Codex chat as the default integrator. Treat a separate OMP session as read-only unless
  write ownership is explicitly handed to it for a focused task.

## Repository layout

- `apps/mobile` — Expo + React Native + TypeScript application based on Ignite.
- `apps/backend` — ASP.NET Core 10 Minimal API, EF Core, SQLite, migrations, and integration tests.
- `docs` — product specification, architecture notes, and decisions.

## Mobile conventions

- Use Expo Router for routes and keep route files thin; screens live under `src/screens`.
- Keep HTTP code under `src/services/api`; screens must not call `fetch` directly.
- Read the backend URL from `EXPO_PUBLIC_API_URL`. Never add a hidden production fallback.
- Development commands must keep `EXPO_PUBLIC_API_URL` automatic and cross-platform through
  `apps/mobile/scripts/development.mjs`. Do not reintroduce manual per-device URL switching.
- Use `APP_VARIANT=development`, not the API URL, to enable native local-HTTP permissions. Keep
  production builds on HTTPS without clear-text exceptions.
- Prefer strict TypeScript, named exports, existing theme tokens, and small focused tests.
- Do not add a package when the platform or an existing dependency already covers the need.
- Public Expo environment variables are not secrets.
- Follow `docs/design-system.md` for adaptive platform surfaces. Keep Liquid Glass and OS checks out
  of screens, prefer native controls, and keep any capability check inside a semantic component.
- Use semantic theme tokens rather than raw palette values. Preserve the quiet mineral foundation,
  lime signal color, dominant product imagery, and restrained single-column hierarchy.
- Review meaningful UI changes against the eight Expo design principles recorded in
  `docs/design-system.md`, then inspect light/dark screenshots and iterate before handoff.
- Keep Place/Item server state behind `useFocusedApiResource` and `src/services/api`. Do not add a
  second cache/query layer without first replacing this boundary deliberately.
- Persist semantic Item `iconKey` values and render them through the explicit catalogue mapping.
  Unknown keys must use the `generic-device` fallback.
- Do not persist local photo URIs. Until a media service exists, accept only optional HTTPS URLs
  and always provide a no-photo/error fallback.

## Backend conventions and networking

- The local ASP.NET Core API listens on all interfaces at `0.0.0.0:8080`, not only on
  loopback, so emulators and physical devices can use the mobile launcher's LAN URL.
- Docker Compose must publish host port `8080` to container port `8080`.
- Keep this clear-text, all-interface binding development-only. Deployed environments use HTTPS.
- Keep permissive CORS development-only; production origins require an explicit policy.
- Extend the existing Minimal API directly; do not add CQRS, MediatR, generic repositories, or
  speculative domain tables.
- Keep EF entities internal to persistence and return explicit DTOs. Use Problem Details with stable
  machine-readable `code` values and field errors for validation.
- Preserve Place hierarchy invariants in the backend: no self-parenting, descendant cycles, or
  cascading deletion of non-empty Places.
- Add an EF migration and update the model snapshot for every schema change.

## Validation

From `apps/mobile`, run before handoff:

```bash
pnpm format:check
pnpm lint:check
pnpm compile
pnpm test --runInBand
pnpm expo:doctor
```

For changes that affect bundling, also run `pnpm bundle:web`. Native changes require a fresh CNG
prebuild/development build before release.

For backend changes, run either local .NET 10 checks:

```bash
dotnet restore apps/backend/Yze.slnx
dotnet build apps/backend/Yze.slnx --no-restore
dotnet test apps/backend/Yze.slnx --no-build
```

or the deterministic Docker test stage when the host SDK is unavailable:

```bash
docker build --target test --tag yze-backend-test apps/backend
```

## Documentation

- Update `README.md` when setup commands, prerequisites, or project status change.
- Update `docs/architecture.md` when module boundaries or major technology choices change.
- State what was verified and what remains unverified; never imply a native build ran when only web
  or static checks ran.
