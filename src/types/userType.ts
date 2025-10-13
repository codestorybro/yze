import type { ArchetypeKey } from "./archetype"

export type UserType = {
  id: string
  name: string
  email?: string
  avatarUri?: string
  dominantArchetypeId?: ArchetypeKey
  alreadyAppreciated?: boolean
  isAdmin?: boolean
}
