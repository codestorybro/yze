import { AxiosError } from "axios"
import type { AxiosAdapter, AxiosHeaders, AxiosResponse, InternalAxiosRequestConfig } from "axios"
import { Platform } from "react-native"
import * as SecureStore from "expo-secure-store"

import type { UserType } from "@/types/userType"
import type { DayRating, MoodRating, PartnerType } from "@/types/ratingType"

type LoginBody = {
  email: string
  password: string
}

type RefreshBody = {
  refreshToken: string
}

type CreateRatingBody = {
  date: string
  mood: MoodRating
  comment?: string
}

type MockTokens = {
  accessToken: string
  refreshToken: string
}

type MockSession = MockTokens & {
  user: UserType
}

const mockUser: UserType = {
  id: "1",
  email: "example@example.com",
  name: "You",
  avatarUri: "https://avatar.iran.liara.run/public/60",
}

const mockPartner: PartnerType = {
  id: "2",
  name: "Your Partner",
  avatarUri: "https://avatar.iran.liara.run/public/16",
}

// Generate mock ratings for the current and previous months
function generateMockRatings(): DayRating[] {
  const ratings: DayRating[] = []
  const today = new Date()
  const moods: MoodRating[] = ["happy", "loving", "average", "bored", "sad", "angry"]
  const comments = [
    "Had a great day together!",
    "We had a nice dinner.",
    "Watched a movie together.",
    "Had a small argument but resolved it.",
    "Went for a walk in the park.",
    undefined,
    undefined,
    undefined,
  ]

  // Generate ratings for the past 60 days
  for (let i = 0; i < 60; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    // Skip some days randomly (70% chance of having a rating)
    if (Math.random() > 0.7) continue

    const dateStr = date.toISOString().split("T")[0]
    const mood = moods[Math.floor(Math.random() * moods.length)]
    const comment = comments[Math.floor(Math.random() * comments.length)]

    ratings.push({
      id: `rating-${i}`,
      date: dateStr,
      mood,
      comment,
      createdAt: date.toISOString(),
    })
  }

  return ratings
}

let mockRatings: DayRating[] = generateMockRatings()

let activeSession: MockSession | null = null
const SESSION_STORAGE_KEY = "mockServer.session"

const hydrationPromise = restoreSession()

function createTokens(): MockTokens {
  const now = Date.now()
  return {
    accessToken: `mockAccessToken-${now}`,
    refreshToken: `mockRefreshToken-${now}`,
  }
}

function assertAuthHeader(config: InternalAxiosRequestConfig) {
  const authHeader =
    getHeader(config.headers, "Authorization") ?? getHeader(config.headers, "authorization")
  if (!authHeader || typeof authHeader !== "string") {
    return { valid: false, message: "Missing Authorization header" }
  }

  const token = authHeader.replace("Bearer", "").trim()
  if (!activeSession || token !== activeSession.accessToken) {
    return { valid: false, message: "Invalid or expired token" }
  }

  return { valid: true }
}

function handleLogin(config: InternalAxiosRequestConfig): AxiosResponse {
  const body = parseBody<LoginBody>(config)

  if (!body.email || !body.password) {
    return createResponse(config, 400, { error: "Missing credentials" })
  }

  const tokens = createTokens()
  activeSession = {
    user: mockUser,
    ...tokens,
  }

  persistSessionSafely(activeSession)

  return createResponse(config, 200, {
    data: {
      user: mockUser,
      tokens,
    },
  })
}

function handleRefresh(config: InternalAxiosRequestConfig): AxiosResponse {
  const body = parseBody<RefreshBody>(config)
  if (!body.refreshToken) {
    return createResponse(config, 400, { error: "Missing refresh token" })
  }
  if (!activeSession || body.refreshToken !== activeSession.refreshToken) {
    return createResponse(config, 401, { error: "Refresh token invalid" })
  }

  const tokens = createTokens()
  activeSession = {
    user: mockUser,
    ...tokens,
  }

  persistSessionSafely(activeSession)

  return createResponse(config, 200, {
    data: {
      tokens,
    },
  })
}

function handleLogout(config: InternalAxiosRequestConfig): AxiosResponse {
  activeSession = null
  persistSessionSafely(null)
  return createResponse(config, 200, { success: true })
}

function handleGetPartner(config: InternalAxiosRequestConfig): AxiosResponse {
  const authCheck = assertAuthHeader(config)
  if (!authCheck.valid) {
    return createResponse(config, 401, { error: authCheck.message })
  }

  return createResponse(config, 200, {
    data: mockPartner,
  })
}

function handleGetRatings(config: InternalAxiosRequestConfig): AxiosResponse {
  const authCheck = assertAuthHeader(config)
  if (!authCheck.valid) {
    return createResponse(config, 401, { error: authCheck.message })
  }

  const year = parseInt(config.params?.year as string, 10)
  const month = parseInt(config.params?.month as string, 10)

  const filteredRatings = mockRatings.filter((rating) => {
    const ratingDate = new Date(rating.date)
    return ratingDate.getFullYear() === year && ratingDate.getMonth() + 1 === month
  })

  return createResponse(config, 200, {
    data: filteredRatings,
  })
}

function handleGetRatingForDay(config: InternalAxiosRequestConfig): AxiosResponse {
  const authCheck = assertAuthHeader(config)
  if (!authCheck.valid) {
    return createResponse(config, 401, { error: authCheck.message })
  }

  const url = config.url ?? ""
  const dateMatch = url.match(/\/ratings\/(\d{4}-\d{2}-\d{2})/)
  const date = dateMatch?.[1]

  if (!date) {
    return createResponse(config, 400, { error: "Invalid date format" })
  }

  const rating = mockRatings.find((r) => r.date === date) ?? null

  return createResponse(config, 200, {
    data: rating,
  })
}

function handleCreateRating(config: InternalAxiosRequestConfig): AxiosResponse {
  const authCheck = assertAuthHeader(config)
  if (!authCheck.valid) {
    return createResponse(config, 401, { error: authCheck.message })
  }

  const body = parseBody<CreateRatingBody>(config)

  if (!body.date || !body.mood) {
    return createResponse(config, 400, { error: "Missing required fields" })
  }

  // Remove existing rating for this date if it exists
  mockRatings = mockRatings.filter((r) => r.date !== body.date)

  const newRating: DayRating = {
    id: `rating-${Date.now()}`,
    date: body.date,
    mood: body.mood,
    comment: body.comment,
    createdAt: new Date().toISOString(),
  }

  mockRatings.push(newRating)

  return createResponse(config, 200, {
    data: newRating,
  })
}

function parseBody<T>(config: InternalAxiosRequestConfig): T {
  try {
    if (!config.data) return {} as T
    return typeof config.data === "string" ? (JSON.parse(config.data) as T) : (config.data as T)
  } catch (error) {
    console.error("Failed to parse mock body", error)
    return {} as T
  }
}

function createResponse(
  config: InternalAxiosRequestConfig,
  status: number,
  data: Record<string, unknown>,
): AxiosResponse {
  return {
    config,
    data,
    status,
    statusText: status >= 200 && status < 400 ? "OK" : "Error",
    headers: {},
  }
}

function normalizeUrl(url: string) {
  const path = url.split("?")[0]
  if (!path.startsWith("/")) return `/${path}`
  return path
}

function getHeader(headers: InternalAxiosRequestConfig["headers"], key: string) {
  if (!headers) return undefined

  if (typeof (headers as AxiosHeaders).get === "function") {
    return (headers as AxiosHeaders).get(key)
  }

  return (headers as Record<string, unknown>)[key]
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function restoreSession() {
  const session = await readPersistedSession()
  if (session) {
    activeSession = session
  }
}

async function readPersistedSession(): Promise<MockSession | null> {
  try {
    const raw = await readStorageItem()
    if (!raw) return null
    const parsed = JSON.parse(raw) as MockSession
    if (
      !parsed ||
      typeof parsed !== "object" ||
      typeof parsed.accessToken !== "string" ||
      typeof parsed.refreshToken !== "string" ||
      !parsed.user
    ) {
      await removePersistedSession()
      return null
    }
    return parsed
  } catch (error) {
    console.warn("Failed to restore mock session", error)
    await removePersistedSession()
    return null
  }
}

function persistSessionSafely(session: MockSession | null) {
  persistSession(session).catch((error) => {
    console.warn("Failed to persist mock session", error)
  })
}

async function persistSession(session: MockSession | null) {
  const serialized = session ? JSON.stringify(session) : null
  if (Platform.OS === "web") {
    if (typeof localStorage === "undefined") return
    if (serialized) {
      localStorage.setItem(SESSION_STORAGE_KEY, serialized)
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY)
    }
    return
  }

  if (serialized) {
    await SecureStore.setItemAsync(SESSION_STORAGE_KEY, serialized)
  } else {
    await SecureStore.deleteItemAsync(SESSION_STORAGE_KEY)
  }
}

async function removePersistedSession() {
  if (Platform.OS === "web") {
    if (typeof localStorage === "undefined") return
    localStorage.removeItem(SESSION_STORAGE_KEY)
    return
  }

  await SecureStore.deleteItemAsync(SESSION_STORAGE_KEY)
}

async function readStorageItem() {
  if (Platform.OS === "web") {
    if (typeof localStorage === "undefined") return null
    try {
      return localStorage.getItem(SESSION_STORAGE_KEY)
    } catch (error) {
      console.warn("Failed to access web storage", error)
      return null
    }
  }

  try {
    return await SecureStore.getItemAsync(SESSION_STORAGE_KEY)
  } catch (error) {
    console.warn("Failed to access secure storage", error)
    return null
  }
}

const handlerMap: Record<string, (config: InternalAxiosRequestConfig) => AxiosResponse> = {
  "POST /auth/login": handleLogin,
  "POST /auth/refresh": handleRefresh,
  "POST /auth/logout": handleLogout,
  "GET /partner": handleGetPartner,
  "GET /ratings": handleGetRatings,
  "POST /ratings": handleCreateRating,
}

// Dynamic route handler for /ratings/:date
function findHandler(
  method: string,
  url: string,
): ((config: InternalAxiosRequestConfig) => AxiosResponse) | null {
  const normalizedUrl = normalizeUrl(url)
  const key = `${method} ${normalizedUrl}`

  // Check static routes first
  if (handlerMap[key]) {
    return handlerMap[key]
  }

  // Check dynamic routes
  if (method === "GET" && normalizedUrl.match(/^\/ratings\/\d{4}-\d{2}-\d{2}$/)) {
    return handleGetRatingForDay
  }

  return null
}

export const mockAdapter: AxiosAdapter = async (config) => {
  await delay(250)
  await hydrationPromise

  const method = config.method?.toUpperCase() ?? "GET"
  const handler = findHandler(method, config.url ?? "")

  if (!handler) {
    const key = `${method} ${normalizeUrl(config.url ?? "")}`
    const response = createResponse(config, 404, { error: `Mock endpoint not implemented: ${key}` })
    throw new AxiosError(response.statusText, `${response.status}`, config, undefined, response)
  }

  const response = handler(config)

  if (response.status >= 400) {
    throw new AxiosError(response.statusText, `${response.status}`, config, undefined, response)
  }

  return response
}
