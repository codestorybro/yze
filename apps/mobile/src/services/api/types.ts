import type { ApiFailure } from "./apiProblem"

export interface HelloResponse {
  message: string
}

export type ApiResult<T> = { kind: "ok"; data: T } | ApiFailure

export interface PlaceSummary {
  id: string
  name: string
  photoUrl: string | null
  description: string | null
  childPlaceCount: number
  itemCount: number
  createdAt: string
  updatedAt: string
}

export interface PlacePath {
  id: string
  name: string
}

export interface PlaceDetails {
  id: string
  isRoot: boolean
  name: string
  parentPlaceId: string | null
  photoUrl: string | null
  description: string | null
  createdAt: string
  updatedAt: string
  ancestry: PlacePath[]
  children: PlaceSummary[]
  items: Item[]
}

export interface OrganizerRootNode {
  id: string
  name: string
  childPlaceCount: number
  itemCount: number
}

export interface OrganizerPlaceNode {
  id: string
  parentPlaceId: string
  name: string
  photoUrl: string | null
  description: string | null
  createdAt: string
  updatedAt: string
}

export interface OrganizerItemNode {
  id: string
  placeId: string
  name: string
  iconKey: string
  quantity: number
}

export interface OrganizerTree {
  root: OrganizerRootNode
  places: OrganizerPlaceNode[]
  items: OrganizerItemNode[]
}

export interface PlaceWriteRequest {
  name: string
  parentPlaceId?: string | null
  photoUrl?: string | null
  description?: string | null
}

export interface Item {
  id: string
  placeId: string
  name: string
  iconKey: string
  photoUrl: string | null
  brand: string | null
  model: string | null
  serialNumber: string | null
  category: string | null
  productionDate: string | null
  purchaseDate: string | null
  purchasePrice: number | null
  purchaseCurrency: string | null
  warrantyUntil: string | null
  productUrl: string | null
  quantity: number
  tags: string[]
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface ItemWriteRequest {
  name: string
  iconKey: string
  photoUrl?: string | null
  brand?: string | null
  model?: string | null
  serialNumber?: string | null
  category?: string | null
  productionDate?: string | null
  purchaseDate?: string | null
  purchasePrice?: number | null
  purchaseCurrency?: string | null
  warrantyUntil?: string | null
  productUrl?: string | null
  quantity?: number
  tags?: string[]
  notes?: string | null
}

/**
 * The options used to configure apisauce.
 */
export interface ApiConfig {
  /**
   * The URL of the api.
   */
  url: string

  /**
   * Milliseconds before we timeout the request.
   */
  timeout: number
}
