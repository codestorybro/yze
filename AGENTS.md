# Gear Organizer agent guide

This file is the canonical repository guidance for Codex and other coding agents.

## Product and scope

- Build **Gear Organizer**, a visual organizer for technical equipment and storage places.
- Treat `docs/GEAR_ORGANIZER_PROJECT_SPEC.md` as the product source of truth.
- The current branch is **Phase 0: mobile cleanup and toolchain refresh**. The target milestone is a
  thin mobile-to-API vertical slice, but the backend and Docker layer are not implemented yet. Do not
  add authentication, persistence, Places/Items CRUD, image upload, or cloud infrastructure unless
  the task explicitly expands the scope.
- Keep the repository ready for the planned `.NET 10` backend under `apps/backend`, but do not invent
  backend behavior ahead of the specification.

## Git workflow

- Never implement directly on `main`.
- Use a normal Git branch for every task, with names such as `feature/...`, `fix/...`, or `chore/...`.
- Do not create or use Git worktrees in this repository.
- Before editing, inspect the current branch and working-tree state. Preserve unrelated user changes.
- Keep each branch focused and leave validation results in the handoff.
- Only one terminal/agent should write to the shared checkout at a time. Other model sessions may
  review, investigate, or propose diffs, then hand ownership back before edits begin.

## Repository layout

- `apps/mobile` — Expo + React Native + TypeScript application based on Ignite.
- `apps/backend` — planned ASP.NET Core API; it may not exist yet.
- `docs` — product specification, architecture notes, and decisions.

## Mobile conventions

- Use Expo Router for routes and keep route files thin; screens live under `src/screens`.
- Keep HTTP code under `src/services/api`; screens must not call `fetch` directly.
- Read the backend URL from `EXPO_PUBLIC_API_URL`. Never add a hidden production fallback.
- Prefer strict TypeScript, named exports, existing theme tokens, and small focused tests.
- Do not add a package when the platform or an existing dependency already covers the need.
- Public Expo environment variables are not secrets.

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

## Documentation

- Update `README.md` when setup commands, prerequisites, or project status change.
- Update `docs/architecture.md` when module boundaries or major technology choices change.
- State what was verified and what remains unverified; never imply a native build ran when only web
  or static checks ran.
