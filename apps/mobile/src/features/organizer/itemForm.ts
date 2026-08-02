import type { Item, ItemWriteRequest } from "@/services/api/types"

export interface ItemFormDraft {
  brand: string
  category: string
  iconKey: string
  model: string
  name: string
  notes: string
  photoUrl: string
  productionDate: string
  productUrl: string
  purchaseCurrency: string
  purchaseDate: string
  purchasePrice: string
  quantity: string
  serialNumber: string
  tags: string
  warrantyUntil: string
}

export type ItemFormErrors = Partial<Record<keyof ItemFormDraft | "placeId", string>>

export const emptyItemDraft: ItemFormDraft = {
  brand: "",
  category: "",
  iconKey: "",
  model: "",
  name: "",
  notes: "",
  photoUrl: "",
  productionDate: "",
  productUrl: "",
  purchaseCurrency: "",
  purchaseDate: "",
  purchasePrice: "",
  quantity: "1",
  serialNumber: "",
  tags: "",
  warrantyUntil: "",
}

export function itemDraftFromItem(item: Item): ItemFormDraft {
  return {
    brand: item.brand ?? "",
    category: item.category ?? "",
    iconKey: item.iconKey,
    model: item.model ?? "",
    name: item.name,
    notes: item.notes ?? "",
    photoUrl: item.photoUrl ?? "",
    productionDate: item.productionDate ?? "",
    productUrl: item.productUrl ?? "",
    purchaseCurrency: item.purchaseCurrency ?? "",
    purchaseDate: item.purchaseDate ?? "",
    purchasePrice: item.purchasePrice?.toString() ?? "",
    quantity: item.quantity.toString(),
    serialNumber: item.serialNumber ?? "",
    tags: item.tags.join(", "),
    warrantyUntil: item.warrantyUntil ?? "",
  }
}

export function validateItemDraft(draft: ItemFormDraft, placeId?: string): ItemFormErrors {
  const errors: ItemFormErrors = {}
  if (!draft.name.trim()) errors.name = "Give this Item a name."
  if (!draft.iconKey) errors.iconKey = "Select the icon that best identifies this Item."
  if (!placeId) errors.placeId = "Select a destination Place."

  const quantity = Number(draft.quantity)
  if (!Number.isInteger(quantity) || quantity <= 0) {
    errors.quantity = "Quantity must be a whole number greater than zero."
  }

  if (draft.purchasePrice.trim()) {
    const price = Number(draft.purchasePrice.replace(",", "."))
    if (!Number.isFinite(price) || price < 0) errors.purchasePrice = "Enter a non-negative amount."
  }

  if (draft.purchaseCurrency.trim() && !/^[A-Za-z]{3}$/.test(draft.purchaseCurrency.trim())) {
    errors.purchaseCurrency = "Use a three-letter currency code, for example PLN."
  }

  for (const key of ["productionDate", "purchaseDate", "warrantyUntil"] as const) {
    if (draft[key].trim() && !isDateOnly(draft[key].trim())) {
      errors[key] = "Use YYYY-MM-DD."
    }
  }

  for (const key of ["photoUrl", "productUrl"] as const) {
    if (draft[key].trim() && !isHttpsUrl(draft[key].trim())) {
      errors[key] = "Use an absolute HTTPS URL."
    }
  }

  return errors
}

export function itemRequestFromDraft(draft: ItemFormDraft): ItemWriteRequest {
  const optional = (value: string) => value.trim() || null
  return {
    name: draft.name.trim(),
    iconKey: draft.iconKey,
    photoUrl: optional(draft.photoUrl),
    brand: optional(draft.brand),
    model: optional(draft.model),
    serialNumber: optional(draft.serialNumber),
    category: optional(draft.category),
    productionDate: optional(draft.productionDate),
    purchaseDate: optional(draft.purchaseDate),
    purchasePrice: draft.purchasePrice.trim()
      ? Number(draft.purchasePrice.trim().replace(",", "."))
      : null,
    purchaseCurrency: optional(draft.purchaseCurrency)?.toUpperCase() ?? null,
    warrantyUntil: optional(draft.warrantyUntil),
    productUrl: optional(draft.productUrl),
    quantity: Number(draft.quantity),
    tags: draft.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
    notes: optional(draft.notes),
  }
}

function isDateOnly(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split("-").map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  )
}

function isHttpsUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === "https:"
  } catch {
    return false
  }
}
