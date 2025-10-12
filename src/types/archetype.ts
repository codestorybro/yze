export const archetypeKeys = ["flow", "buddy", "rise", "guru"] as const

export type ArchetypeKey = (typeof archetypeKeys)[number]
