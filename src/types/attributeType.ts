import type { ArchetypeKey } from "./archetype"

export type AttributeTraitType<TId = string> = {
  id: TId
  label: string
  score: number
}

export type ArchetypeAttribute = AttributeTraitType<ArchetypeKey>
