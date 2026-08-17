/**
 * This Api class lets you define an API endpoint and methods to request
 * data and process it.
 *
 * See the [Backend API Integration](https://docs.infinite.red/ignite-cli/boilerplate/app/services/#backend-api-integration)
 * documentation for more details.
 */
import { ApiResponse, ApisauceInstance, create } from "apisauce"

import { getApiBaseUrl } from "@/config/api"

import { getApiFailure } from "./apiProblem"
import { isArrayOf, isItem, isOrganizerTree, isPlaceDetails, isPlaceSummary } from "./contracts"
import type {
  ApiConfig,
  ApiResult,
  HelloResponse,
  Item,
  ItemWriteRequest,
  OrganizerTree,
  PlaceDetails,
  PlaceSummary,
  PlaceWriteRequest,
} from "./types"

/**
 * Configuring the apisauce instance.
 */
export const getDefaultApiConfig = (): ApiConfig => ({ url: getApiBaseUrl(), timeout: 10000 })

/**
 * Manages all requests to the API. You can use this class to build out
 * various requests that you need to call from your backend API.
 */
export class Api {
  apisauce: ApisauceInstance
  config: ApiConfig

  /**
   * Set up our API instance. Keep this lightweight!
   */
  constructor(config: ApiConfig = getDefaultApiConfig()) {
    this.config = config
    this.apisauce = create({
      baseURL: this.config.url,
      timeout: this.config.timeout,
      headers: {
        Accept: "application/json",
      },
    })
  }

  async getHello(): Promise<ApiResult<HelloResponse>> {
    const response = await this.apisauce.get<HelloResponse>("/api/hello")

    if (!response.ok) {
      return getApiFailure(response)
    }

    if (!response.data || typeof response.data.message !== "string") {
      return { kind: "bad-data" }
    }

    return { kind: "ok", data: response.data }
  }

  async getRootPlaces(): Promise<ApiResult<PlaceSummary[]>> {
    const response = await this.apisauce.get<unknown>("/api/places")
    return this.result(response, isArrayOf(isPlaceSummary))
  }

  async getOrganizerTree(): Promise<ApiResult<OrganizerTree>> {
    const response = await this.apisauce.get<unknown>("/api/organizer/tree")
    return this.result(response, isOrganizerTree)
  }

  async getPlace(id: string): Promise<ApiResult<PlaceDetails>> {
    const response = await this.apisauce.get<unknown>(`/api/places/${id}`)
    return this.result(response, isPlaceDetails)
  }

  async getChildPlaces(id: string): Promise<ApiResult<PlaceSummary[]>> {
    const response = await this.apisauce.get<unknown>(`/api/places/${id}/children`)
    return this.result(response, isArrayOf(isPlaceSummary))
  }

  async createPlace(request: PlaceWriteRequest): Promise<ApiResult<PlaceSummary>> {
    const response = await this.apisauce.post<unknown>("/api/places", request)
    return this.result(response, isPlaceSummary)
  }

  async updatePlace(id: string, request: PlaceWriteRequest): Promise<ApiResult<PlaceSummary>> {
    const { name, photoUrl, description } = request
    const response = await this.apisauce.put<unknown>(`/api/places/${id}`, {
      name,
      photoUrl,
      description,
    })
    return this.result(response, isPlaceSummary)
  }

  async movePlace(id: string, parentPlaceId: string | null): Promise<ApiResult<PlaceSummary>> {
    const response = await this.apisauce.put<unknown>(`/api/places/${id}/parent`, {
      parentPlaceId,
    })
    return this.result(response, isPlaceSummary)
  }

  async deletePlace(id: string): Promise<ApiResult<undefined>> {
    return this.emptyResult(await this.apisauce.delete(`/api/places/${id}`))
  }

  async getItem(id: string): Promise<ApiResult<Item>> {
    const response = await this.apisauce.get<unknown>(`/api/items/${id}`)
    return this.result(response, isItem)
  }

  async createItem(placeId: string, request: ItemWriteRequest): Promise<ApiResult<Item>> {
    const response = await this.apisauce.post<unknown>(`/api/places/${placeId}/items`, request)
    return this.result(response, isItem)
  }

  async updateItem(id: string, request: ItemWriteRequest): Promise<ApiResult<Item>> {
    const response = await this.apisauce.put<unknown>(`/api/items/${id}`, request)
    return this.result(response, isItem)
  }

  async moveItem(id: string, placeId: string): Promise<ApiResult<Item>> {
    const response = await this.apisauce.put<unknown>(`/api/items/${id}/place`, { placeId })
    return this.result(response, isItem)
  }

  async deleteItem(id: string): Promise<ApiResult<undefined>> {
    return this.emptyResult(await this.apisauce.delete(`/api/items/${id}`))
  }

  private result<T>(
    response: ApiResponse<unknown>,
    guard: (value: unknown) => value is T,
  ): ApiResult<T> {
    if (!response.ok) return getApiFailure(response)
    return guard(response.data) ? { kind: "ok", data: response.data } : { kind: "bad-data" }
  }

  private emptyResult(response: ApiResponse<unknown>): ApiResult<undefined> {
    return response.ok ? { kind: "ok", data: undefined } : getApiFailure(response)
  }
}

export const getHello = () => new Api().getHello()
export const getRootPlaces = () => new Api().getRootPlaces()
export const getOrganizerTree = () => new Api().getOrganizerTree()
export const getPlace = (id: string) => new Api().getPlace(id)
export const getChildPlaces = (id: string) => new Api().getChildPlaces(id)
export const createPlace = (request: PlaceWriteRequest) => new Api().createPlace(request)
export const updatePlace = (id: string, request: PlaceWriteRequest) =>
  new Api().updatePlace(id, request)
export const movePlace = (id: string, parentPlaceId: string | null) =>
  new Api().movePlace(id, parentPlaceId)
export const deletePlace = (id: string) => new Api().deletePlace(id)
export const getItem = (id: string) => new Api().getItem(id)
export const createItem = (placeId: string, request: ItemWriteRequest) =>
  new Api().createItem(placeId, request)
export const updateItem = (id: string, request: ItemWriteRequest) =>
  new Api().updateItem(id, request)
export const moveItem = (id: string, placeId: string) => new Api().moveItem(id, placeId)
export const deleteItem = (id: string) => new Api().deleteItem(id)
