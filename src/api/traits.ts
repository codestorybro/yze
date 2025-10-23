import { apiClient, ApiResponse } from "./httpClient"
import type { ArchetypeKey } from "@/types/archetype"

export interface TraitDefinitionResponseItem {
  id: string
  label: string
  archetypeId: ArchetypeKey
}

export async function fetchAllTraits(params: { lang?: string } = {}) {
  const { lang = "en" } = params
  try {
    const response = await apiClient.get<ApiResponse<TraitDefinitionResponseItem[]>>("/traits", {
      params: { lang },
    })
    return response.data?.data ?? []
  } catch (error) {
    console.warn("Failed to fetch traits", error)
    return []
  }
}
