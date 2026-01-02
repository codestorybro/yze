export type MoodRating = "happy" | "loving" | "average" | "bored" | "sad" | "angry"

export type DayRating = {
  id: string
  date: string // ISO date string (YYYY-MM-DD)
  mood: MoodRating
  comment?: string
  createdAt: string
}

export type PartnerType = {
  id: string
  name: string
  avatarUri?: string
}
