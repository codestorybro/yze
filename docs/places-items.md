# Places and Items

This document is the current product and API contract for Yze's first complete domain slice. The
older `GEAR_ORGANIZER_PROJECT_SPEC.md` remains a historical bootstrap brief; when it conflicts with
this document, this document describes the implemented behavior.

## Domain concepts

A **Place** is any physical location or container chosen by the user: a room, desk, drawer, shelf,
case, backpack, or a precise flat description. Place types are deliberately not modeled. A Place may
have one parent, any number of direct child Places, and any number of direct Items. Nesting is
optional and has no application-defined depth limit.

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
- Moving to `parentPlaceId: null` puts a Place at the root.
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
`malformed_request`, `place_cycle`, and `place_not_empty`.

## Persistence and migrations

The API uses EF Core 10 with SQLite. `Place.parentPlaceId` and `Item.placeId` are indexed, both foreign
keys use restrictive deletion, and the first migration is `202608010001_InitialPlacesAndItems`.
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

The Places tab owns a nested Expo Router Stack. Root Places use a virtualized two-column visual map;
Place details mix larger container cards and compact Item cards without loading the full tree. A
lightweight focus-aware resource hook reloads the visible level when a modal closes or a route regains
focus. This matches the project's existing local-state approach and avoids introducing a second
cache library. Mutations disable duplicate submission, preserve drafts on failure, and refresh source
and destination screens through focus reload.

Place and Item insertions use short Reanimated layout transitions and spring feedback with the
system Reduce Motion setting. A global toast confirms successful create, update, move, and delete
operations after their API response and survives closing the current sheet. Haptics are best-effort
only: unavailable native feedback is ignored and never blocks navigation.

The root Places screen and an empty Place keep guidance in the primary header rather than repeating
the same message and Add action below it. Contextual native toolbars own Add/Manage actions for
Places and Delete/Move/Edit for Item details. Add inside a Place supports creating a child Place,
creating an Item, or selecting an existing Place to move there. The destination-first selector
keeps ancestors browseable but not selectable when choosing one would create a cycle; the backend
remains the final hierarchy authority.

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
and Item CRUD.

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
