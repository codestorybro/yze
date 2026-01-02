import { apiClient, ApiResponse } from "./httpClient"
import type { DayRating, MoodRating, PartnerType } from "@/types/ratingType"

type CreateRatingPayload = {
  date: string
  mood: MoodRating
  comment?: string
}

type GetRatingsParams = {
  year: number
  month: number
}

export async function getPartner(): Promise<PartnerType> {
  const response = await apiClient.get<ApiResponse<PartnerType>>("/partner")
  return response.data.data
}

export async function getRatings(params: GetRatingsParams): Promise<DayRating[]> {
  const response = await apiClient.get<ApiResponse<DayRating[]>>("/ratings", { params })
  return response.data.data
}

export async function getRatingForDay(date: string): Promise<DayRating | null> {
  const response = await apiClient.get<ApiResponse<DayRating | null>>(`/ratings/${date}`)
  return response.data.data
}

export async function createRating(payload: CreateRatingPayload): Promise<DayRating> {
  const response = await apiClient.post<ApiResponse<DayRating>>("/ratings", payload)
  return response.data.data
}
