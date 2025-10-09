import { apiClient, ApiResponse } from "./httpClient"

import type { AttributeType } from "@/types/attributeType"

export type GetAttributesPayload = {
  view?: string
}

export async function getAttributes(params: GetAttributesPayload = {}): Promise<AttributeType[][]> {
  const response = await apiClient.get<ApiResponse<AttributeType[][]>>("/attributes", { params })
  return response.data.data
}
