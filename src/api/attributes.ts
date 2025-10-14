import { apiClient, ApiResponse } from "./httpClient"

import type { ArchetypeAttribute } from "@/types/attributeType"
import type { AttributeDetails } from "@/types/attributeDetails"
import type { AttributesViewType } from "@/types/attributesViewType"
import type { ArchetypeKey } from "@/types/archetype"

export type GetAttributesPayload = {
  view?: string
}

export async function getAttributes(
  params: GetAttributesPayload = {},
): Promise<ArchetypeAttribute[][]> {
  const response = await apiClient.get<ApiResponse<ArchetypeAttribute[][]>>("/attributes", {
    params,
  })
  return response.data.data
}

export type GetAttributeDetailsPayload = {
  view?: AttributesViewType
  offset?: number
  archetypeId: ArchetypeKey
  lang?: string
}

export async function getAttributeDetails(
  params: GetAttributeDetailsPayload,
): Promise<AttributeDetails> {
  const response = await apiClient.get<ApiResponse<AttributeDetails>>("/attributes/details", {
    params,
  })
  return response.data.data
}
