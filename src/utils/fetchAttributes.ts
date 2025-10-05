import { AttributesViewType } from "@/types/attributesViewType"
import { AttributeType } from "@/types/attributeType"

export type FetchAttributesParams = {
  view?: AttributesViewType
  offset?: number
}

const ATTRIBUTES_ENDPOINT = "https://api.yze.app/attributes"

type AttributesApiResponse = {
  data: AttributeType[]
}

export async function fetchAttributes(
  params: FetchAttributesParams = {},
): Promise<AttributeType[]> {
  const { view = "overall", offset = 0 } = params

  const sanitizedOffset = view === "overall" ? 0 : Math.max(0, Math.floor(offset))
  const query = `view=${encodeURIComponent(view)}&offset=${encodeURIComponent(sanitizedOffset)}`
  const url = `${ATTRIBUTES_ENDPOINT}?${query}`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to fetch attributes (status ${response.status})`)
  }

  const json: Partial<AttributesApiResponse> = await response.json()

  if (!json || !Array.isArray(json.data)) {
    throw new Error("Attributes response is missing data array")
  }

  return json.data
}
