import { getAttributes } from "@/api/attributes"
import type { AttributesViewType } from "@/types/attributesViewType"

export type FetchAttributesParams = {
  view?: AttributesViewType
  offset?: number
}

export async function fetchAttributes(
  params: FetchAttributesParams = {},
): Promise<Awaited<ReturnType<typeof getAttributes>>> {
  const { view = "overall" } = params

  return getAttributes({ view })
}
