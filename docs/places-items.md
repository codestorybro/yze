# Places and Items

This document is the current product and API contract for Yze's first complete domain slice. The
older `GEAR_ORGANIZER_PROJECT_SPEC.md` remains a historical bootstrap brief; when it conflicts with
this document, this document describes the implemented behavior.

## Domain concepts

A **Place** is any physical location or container chosen by the user: a room, desk, drawer, shelf,
case, backpack, or a precise flat description. Place types are deliberately not modeled. A Place may
have one parent, any number of direct child Places, and any number of direct Items. Nesting is
optional and has no application-defined depth limit.

Every organizer has one persisted system Place named **All gear**. It is the visible root of the
hierarchy, not user content: it cannot be renamed, moved, or deleted. User Places and Items may live
directly under it. The API keeps the earlier nullable-parent contract for Place writes, so
`parentPlaceId: null` means “under All gear”; Items use the root's real ID because an Item always has
a required Place foreign key.

An **Item** is a physical object stored in exactly one current Place. It has a required name and a
stable semantic `iconKey`. The icon key is independent from SF Symbols and Material Symbols; mobile
owns the explicit platform mapping and renders `generic-device` for unknown historical keys.

The current application has one unscoped organizer. Authentication, users, households, tenancy, and
sharing are not implemented. Add ownership columns only together with a real authentication and
authorization boundary.

## Hierarchy invariants

- A Place cannot be its own parent.
- A Place cannot be moved below one of its descendants.
- The backend walks the proposed parent's ancestry inside a serializable transaction and rejects a
  cycle with `409 place_cycle`.
- Moving to `parentPlaceId: null` puts a Place under the immutable organizer root.
- The organizer root returns `409 organizer_root_immutable` for update, move, and delete attempts.
- Deleting a Place never cascades into user content. A Place with a direct child Place or Item returns
  `409 place_not_empty`; the user must move or delete the contents first.
- Items can be moved between existing Places and can be deleted directly.

## Fields and validation

Identifiers are UUIDs generated with `Guid.CreateVersion7()`. System timestamps are UTC
`DateTimeOffset` values. Product, purchase, and warranty dates are nullable date-only ISO values
(`YYYY-MM-DD`). Money uses `decimal(19,4)` in the backend and a JSON number in the current API.

### Place

| Field                    | Required | Rules                                   |
| ------------------------ | -------- | --------------------------------------- |
| `id`                     | managed  | UUID                                    |
| `name`                   | yes      | trimmed, 1–120 characters               |
| `parentPlaceId`          | no       | existing Place or `null` root           |
| `photoUrl`               | no       | absolute HTTPS URL, max 2048 characters |
| `description`            | no       | trimmed, max 2000 characters            |
| `createdAt`, `updatedAt` | managed  | UTC timestamps                          |

### Item

| Group          | Fields                                                                             |
| -------------- | ---------------------------------------------------------------------------------- |
| Required       | `id`, `placeId`, `name` (1–120), `iconKey` (catalogue value)                       |
| Identification | `photoUrl`, `brand`, `model`, `serialNumber`, `category`, `productionDate`         |
| Purchase       | `purchaseDate`, `purchasePrice`, `purchaseCurrency`, `warrantyUntil`, `productUrl` |
| Organization   | `quantity` (integer, default 1, greater than zero), `tags` (max 12), `notes`       |
| Managed        | `createdAt`, `updatedAt`                                                           |

Remote URLs accept only HTTPS; clear-text and local `file://` URIs are rejected. Currency is an optional three-letter
code normalized to uppercase. Tags are stored as JSON in one SQLite text column; no speculative Tag,
Category, Manufacturer, Currency, or Warranty tables exist.

The initial icon catalogue is: `computer`, `laptop`, `monitor`, `smartphone`, `tablet`, `keyboard`,
`mouse`, `headphones`, `speaker`, `microphone`, `camera`, `game-controller`, `console`, `cable`,
`charger`, `adapter`, `battery`, `storage-drive`, `router`, `smartwatch`, `book`, `tools`, `box`, and
`generic-device`.

## HTTP API

All routes are under the unauthenticated development API on port `8080`.

| Method   | Route                       | Behavior                                                              |
| -------- | --------------------------- | --------------------------------------------------------------------- |
| `GET`    | `/api/hello`                | connectivity smoke test                                               |
| `GET`    | `/health`                   | database connectivity health check                                    |
| `GET`    | `/api/organizer/tree`       | immutable root plus every lightweight Place and Item tree node        |
| `GET`    | `/api/places`               | root Places with direct child and Item counts                         |
| `POST`   | `/api/places`               | create a root or child Place                                          |
| `GET`    | `/api/places/{id}`          | current Place, root-to-parent ancestry, direct children, direct Items |
| `GET`    | `/api/places/{id}/children` | direct child Places only                                              |
| `PUT`    | `/api/places/{id}`          | update name, description, and photo URL                               |
| `PUT`    | `/api/places/{id}/parent`   | move to another parent or root                                        |
| `DELETE` | `/api/places/{id}`          | delete an empty Place                                                 |
| `GET`    | `/api/places/{id}/items`    | direct Items only                                                     |
| `POST`   | `/api/places/{id}/items`    | create an Item in the Place                                           |
| `GET`    | `/api/items/{id}`           | retrieve Item details                                                 |
| `PUT`    | `/api/items/{id}`           | update Item details, not its Place                                    |
| `PUT`    | `/api/items/{id}/place`     | move an Item                                                          |
| `DELETE` | `/api/items/{id}`           | delete an Item                                                        |

Creates return `201` with a `Location` header, reads and updates return `200`, and successful deletes
return `204`. Errors use RFC 7807 Problem Details with a stable top-level `code`. Validation errors
also contain `errors: Record<string, string[]>`. Important codes include `validation_failed`,
`place_not_found`, `parent_place_not_found`, `destination_place_not_found`, `item_not_found`,
`malformed_request`, `place_cycle`, `place_not_empty`, and `organizer_root_immutable`.

`GET /api/organizer/tree` is deliberately a flat transfer shape: one root descriptor, Places with
their `parentPlaceId`, and lightweight Items containing only tree identity, parent, semantic icon,
and quantity. Mobile reconstructs the visible hierarchy in one pass. Item detail fields remain on
the Item endpoints, avoiding an N+1 request pattern without making the tree payload grow with notes,
purchase data, or tags.

## Persistence and migrations

The API uses EF Core 10 with SQLite. `Place.parentPlaceId` and `Item.placeId` are indexed, both foreign
keys use restrictive deletion, and the first migration is `202608010001_InitialPlacesAndItems`.
`202608020001_AddOrganizerRoot` seeds the immutable root and reparents every legacy top-level Place
under it. Its downgrade preserves Items that were stored directly in root by moving them into a
recovery Place before removing the system row; a later upgrade can therefore run again without
losing data or colliding with the root ID.
Compose stores `/data/yze.db` in the named `yze-data` volume. The API applies pending migrations at
startup; the current deployment model is one local API instance.

With a local .NET 10 SDK, restore the repository tool manifest and apply migrations explicitly:

```bash
dotnet tool restore
dotnet ef database update --project apps/backend/Yze.Api --startup-project apps/backend/Yze.Api
```

Create a future migration after changing the EF model:

```bash
dotnet ef migrations add MigrationName --project apps/backend/Yze.Api --startup-project apps/backend/Yze.Api --output-dir Data/Migrations
```

## Mobile data and interaction

The Places tab owns a nested Expo Router Stack. Its root is an animated, virtualized hierarchy that
shows **All gear**, nested Places, and Items together. All branches start expanded; a Place can be
collapsed without navigating away. Place rows precede Item rows and duplicate names receive a stable
ID tiebreaker. The root is visibly locked and never exposes edit, move, or delete actions.

Long-pressing a Place or Item starts drag and drop. Only legal destination containers highlight;
self-parenting, the current parent, and a Place's descendants are rejected before the request and
again by the backend. Hovering expands a collapsed branch, holding near an edge continuously
autoscrolls, and newly visible targets are remeasured. The UI applies the move optimistically,
refreshes after success, and rolls back with an error toast on failure. Drag and drop changes only
the parent container: the current domain has no manual sibling ordering or persisted `sortOrder`.
The accessible **Move** action opens the same complete hierarchy for keyboard, switch-control, and
screen-reader users.

A lightweight focus-aware resource hook reloads server state when a modal closes or a route regains
focus. This matches the project's existing local-state approach and avoids introducing a second
cache library. Mutations disable duplicate submission, preserve drafts on failure, and refresh source
and destination screens through focus reload.

Place and Item insertions use short Reanimated layout transitions and spring feedback with the
system Reduce Motion setting. A global toast confirms successful create, update, move, and delete
operations after their API response and survives closing the current sheet. Haptics are best-effort
only: unavailable native feedback is ignored and never blocks navigation.

The root Places screen and an empty Place keep guidance in the primary header rather than repeating
the same message and Add action below it. Root Places retains the normal native bottom navigation;
its compact Add/Manage toolbar sits above it and aligns to the trailing edge. Nested Place and Item
routes hide the global tabs, keep a fixed floating Back control, and use their contextual toolbars.
The nested Stack declares `index` as its initial route so Back still has a destination after a cold
deep link.

Add inside a Place supports creating a child Place, creating an Item, or selecting an existing Place
to move there. Root Add supports Places and Items directly under **All gear**. Move and existing-Place
selection show the complete hierarchy instead of requiring level-by-level browsing; invalid branches
remain visible but disabled. The selected destination and confirmation action stay in a fixed bottom
sheet bar, so selecting a deep node never requires returning to the top. The backend remains the
final hierarchy authority.

Add, form, move, and selection routes use an 80%-height native form sheet with top-aligned,
scrollable content. `FloatingBackButton` owns the persistent native-header Back control on Place and
Item details while the screen content scrolls beneath it; iOS receives its system material and
Android receives a tonal floating surface.

There is no binary upload service yet. Creation accepts an optional remote HTTPS photo URL behind
the typed API boundary. Missing or failed images always render semantic fallbacks, and permission or
media support can be added later without changing the Place/Item domain.

## Tests

Backend integration tests use `WebApplicationFactory<Program>` with relational SQLite in memory and
exercise the HTTP contract, validation, hierarchy movement, cycle protection, non-empty deletion,
Item CRUD, organizer-root immutability, and the full-tree projection. A separate migration test runs
the real initial-to-root migration and a down/up round trip with an Item directly under root.

```bash
dotnet test apps/backend/Yze.slnx
```

Without a local .NET SDK, use the deterministic Docker test stage:

```bash
docker build --target test --tag yze-backend-test apps/backend
```

Mobile unit and interaction tests run with Jest and React Native Testing Library:

```bash
cd apps/mobile
pnpm test --runInBand
```
