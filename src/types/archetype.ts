export const archetypeKeys = ["flow", "buddy", "visionary", "guru"] as const

export type ArchetypeKey = (typeof archetypeKeys)[number]
