import { AttributeType } from "@/types/attributeType"

export type AttributesView = "weekly" | "monthly" | "yearly" | "overall"

export type FetchAttributesParams = {
  view?: AttributesView
  offset?: number
}

const baseAttributes: Record<AttributesView, AttributeType[]> = {
  weekly: [
    { id: "flash", label: "Flash", score: 46 },
    { id: "buddy", label: "Buddy", score: 38 },
    { id: "creator", label: "Creator", score: 31 },
    { id: "guru", label: "Guru", score: 27 },
  ],
  monthly: [
    { id: "flash", label: "Flash", score: 58 },
    { id: "buddy", label: "Buddy", score: 44 },
    { id: "creator", label: "Creator", score: 52 },
    { id: "guru", label: "Guru", score: 41 },
  ],
  yearly: [
    { id: "flash", label: "Flash", score: 72 },
    { id: "buddy", label: "Buddy", score: 65 },
    { id: "creator", label: "Creator", score: 84 },
    { id: "guru", label: "Guru", score: 78 },
  ],
  overall: [
    { id: "flash", label: "Flash", score: 88 },
    { id: "buddy", label: "Buddy", score: 79 },
    { id: "creator", label: "Creator", score: 92 },
    { id: "guru", label: "Guru", score: 86 },
  ],
}

const DECAY_PER_STEP: Record<Exclude<AttributesView, "overall">, number> = {
  weekly: 5,
  monthly: 8,
  yearly: 12,
}

const VARIANCE_PER_INDEX: Record<Exclude<AttributesView, "overall">, number> = {
  weekly: 3,
  monthly: 5,
  yearly: 7,
}

function applyOffset(view: AttributesView, offset: number): AttributeType[] {
  if (view === "overall" || offset === 0) {
    return baseAttributes[view].map((attribute) => ({ ...attribute }))
  }

  const decay = DECAY_PER_STEP[view]
  const variance = VARIANCE_PER_INDEX[view]

  return baseAttributes[view].map((attribute, index) => {
    const trendModifier = index % 2 === 0 ? -variance : variance
    const rawScore = attribute.score - decay * offset + trendModifier * offset

    return {
      ...attribute,
      score: Math.max(2, Math.round(rawScore)),
    }
  })
}

export async function fetchAttributes(
  params: FetchAttributesParams = {},
): Promise<AttributeType[]> {
  const { view = "overall", offset = 0 } = params

  const sanitizedOffset = view === "overall" ? 0 : Math.max(0, Math.floor(offset))

  return applyOffset(view, sanitizedOffset)
}
