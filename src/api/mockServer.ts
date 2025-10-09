import { AxiosError } from "axios"
import type { AxiosAdapter, AxiosHeaders, AxiosResponse, InternalAxiosRequestConfig } from "axios"
import { Platform } from "react-native"
import * as SecureStore from "expo-secure-store"

import type { AttributeType } from "@/types/attributeType"
import type { UserType } from "@/types/userType"

type LoginBody = {
  email: string
  password: string
}

type RefreshBody = {
  refreshToken: string
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
  name: "John Doe",
  avatarUri: "https://i.pravatar.cc/150?img=3",
  dominantArchetypeId: "flash",
}

const baseAttributes: Record<string, AttributeType[]> = {
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

let activeSession: MockSession | null = null
const SESSION_STORAGE_KEY = "mockServer.session"

const hydrationPromise = restoreSession()

const TIMELINE_LENGTH_BY_VIEW: Record<string, number> = {
  overall: 1,
  weekly: 8,
  monthly: 12,
  yearly: 5,
}

const DEFAULT_TIMELINE_LENGTH = 8

const attributesTimeline: Record<string, AttributeType[][]> = Object.fromEntries(
  Object.entries(TIMELINE_LENGTH_BY_VIEW).map(([view, length]) => [
    view,
    createTimelineForView(view, length),
  ]),
)

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

function handleAttributes(config: InternalAxiosRequestConfig): AxiosResponse {
  const authCheck = assertAuthHeader(config)
  if (!authCheck.valid) {
    return createResponse(config, 401, { error: authCheck.message })
  }

  const view = (config.params?.view as string) ?? "overall"
  const timeline = ensureTimeline(view)

  return createResponse(config, 200, {
    data: timeline,
  })
}

function applyOffset(view: string, offset: number): AttributeType[] {
  if (view === "overall" || offset === 0) {
    return baseAttributes[view] ?? baseAttributes.overall
  }

  const DECAY_PER_STEP: Record<string, number> = {
    weekly: 5,
    monthly: 8,
    yearly: 12,
  }

  const VARIANCE_PER_INDEX: Record<string, number> = {
    weekly: 3,
    monthly: 5,
    yearly: 7,
  }

  const fallback = baseAttributes.overall
  const source = baseAttributes[view] ?? fallback
  const decay = DECAY_PER_STEP[view] ?? 5
  const variance = VARIANCE_PER_INDEX[view] ?? 3

  return source.map((attribute, index) => {
    const trendModifier = index % 2 === 0 ? -variance : variance
    const rawScore = attribute.score - decay * offset + trendModifier * offset
    return {
      ...attribute,
      score: Math.max(2, Math.round(rawScore)),
    }
  })
}

function ensureTimeline(view: string): AttributeType[][] {
  if (!attributesTimeline[view]) {
    const length = TIMELINE_LENGTH_BY_VIEW[view] ?? DEFAULT_TIMELINE_LENGTH
    attributesTimeline[view] = createTimelineForView(view, length)
  }

  return attributesTimeline[view]
}

function createTimelineForView(view: string, length: number): AttributeType[][] {
  const normalizedLength = Math.max(1, Math.floor(length))
  return Array.from({ length: normalizedLength }, (_, index) => {
    if (index === 0) {
      const base = baseAttributes[view] ?? baseAttributes.overall
      return base.map((attribute) => ({ ...attribute }))
    }

    return applyOffset(view, index)
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

const handlerMap: Record<string, (config: InternalAxiosRequestConfig) => AxiosResponse> = {
  "POST /auth/login": handleLogin,
  "POST /auth/refresh": handleRefresh,
  "POST /auth/logout": handleLogout,
  "GET /attributes": handleAttributes,
}

export const mockAdapter: AxiosAdapter = async (config) => {
  await delay(250)
  await hydrationPromise
  const key = `${config.method?.toUpperCase() ?? "GET"} ${normalizeUrl(config.url ?? "")}`
  const handler = handlerMap[key]

  if (!handler) {
    const response = createResponse(config, 404, { error: `Mock endpoint not implemented: ${key}` })
    throw new AxiosError(response.statusText, `${response.status}`, config, undefined, response)
  }
  const response = handler(config)

  if (response.status >= 400) {
    throw new AxiosError(response.statusText, `${response.status}`, config, undefined, response)
  }

  return response
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
