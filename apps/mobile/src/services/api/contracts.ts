import type { Item, PlaceDetails, PlacePath, PlaceSummary } from "./types"

export function isPlaceSummary(value: unknown): value is PlaceSummary {
  if (!isRecord(value)) return false

  return (
    isString(value.id) &&
    isString(value.name) &&
    isNullableString(value.photoUrl) &&
    isNullableString(value.description) &&
    isNonNegativeNumber(value.childPlaceCount) &&
    isNonNegativeNumber(value.itemCount) &&
    isString(value.createdAt) &&
    isString(value.updatedAt)
  )
}

export function isPlaceDetails(value: unknown): value is PlaceDetails {
  if (!isRecord(value)) return false

  return (
    isString(value.id) &&
    isString(value.name) &&
    isNullableString(value.parentPlaceId) &&
    isNullableString(value.photoUrl) &&
    isNullableString(value.description) &&
    isString(value.createdAt) &&
    isString(value.updatedAt) &&
    Array.isArray(value.ancestry) &&
    value.ancestry.every(isPlacePath) &&
    Array.isArray(value.children) &&
    value.children.every(isPlaceSummary) &&
    Array.isArray(value.items) &&
    value.items.every(isItem)
  )
}

export function isItem(value: unknown): value is Item {
  if (!isRecord(value)) return false

  return (
    isString(value.id) &&
    isString(value.placeId) &&
    isString(value.name) &&
    isString(value.iconKey) &&
    isNullableString(value.photoUrl) &&
    isNullableString(value.brand) &&
    isNullableString(value.model) &&
    isNullableString(value.serialNumber) &&
    isNullableString(value.category) &&
    isNullableString(value.productionDate) &&
    isNullableString(value.purchaseDate) &&
    (value.purchasePrice === null || typeof value.purchasePrice === "number") &&
    isNullableString(value.purchaseCurrency) &&
    isNullableString(value.warrantyUntil) &&
    isNullableString(value.productUrl) &&
    typeof value.quantity === "number" &&
    value.quantity > 0 &&
    Array.isArray(value.tags) &&
    value.tags.every(isString) &&
    isNullableString(value.notes) &&
    isString(value.createdAt) &&
    isString(value.updatedAt)
  )
}

export function isArrayOf<T>(guard: (value: unknown) => value is T) {
  return (value: unknown): value is T[] => Array.isArray(value) && value.every(guard)
}

function isPlacePath(value: unknown): value is PlacePath {
  return isRecord(value) && isString(value.id) && isString(value.name)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isString(value: unknown): value is string {
  return typeof value === "string"
}

function isNullableString(value: unknown): value is string | null {
  return value === null || isString(value)
}

function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === "number" && value >= 0
}
