import type { AttributesViewType } from "./attributesViewType"
import type { ArchetypeKey } from "./archetype"
import type { AttributeTraitType } from "./attributeType"

export type AttributeDetails = {
  archetypeId: ArchetypeKey
  label: string
  totalScore: number
  view: AttributesViewType
  offset: number
  traits: AttributeTraitType[]
}
