import { AxiosError } from "axios"
import type { AxiosAdapter, AxiosHeaders, AxiosResponse, InternalAxiosRequestConfig } from "axios"
import { Platform } from "react-native"
import * as SecureStore from "expo-secure-store"

import type { ArchetypeAttribute, AttributeTraitType } from "@/types/attributeType"
import type { AttributeDetails } from "@/types/attributeDetails"
import type { AttributesViewType } from "@/types/attributesViewType"
import type { ArchetypeKey } from "@/types/archetype"
import type { UserType } from "@/types/userType"
import type { AttributeCommentsData, AttributeComment } from "@/types/attributeComment"

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
  avatarUri: "https://avatar.iran.liara.run/public/60",
  dominantArchetypeId: "flow",
}

const mockedGroupMembers: UserType[] = [
  {
    id: "1",
    name: "John Doe",
    avatarUri: "https://avatar.iran.liara.run/public/40",
    dominantArchetypeId: "rise",
    alreadyAppreciated: true,
    isAdmin: true,
  },
  {
    id: "2",
    name: "Jane Smith",
    avatarUri: "https://avatar.iran.liara.run/public/16",
    dominantArchetypeId: "flow",
    alreadyAppreciated: false,
  },
  {
    id: "3",
    name: "Alice Johnson",
    avatarUri: "https://avatar.iran.liara.run/public/33",
    dominantArchetypeId: "buddy",
    alreadyAppreciated: false,
  },
  {
    id: "4",
    name: "Bob Brown",
    avatarUri: "https://avatar.iran.liara.run/public/32",
    dominantArchetypeId: "buddy",
    alreadyAppreciated: true,
  },
  {
    id: "5",
    name: "Charlie Davis",
    avatarUri: "https://avatar.iran.liara.run/public/39",
    dominantArchetypeId: "buddy",
    alreadyAppreciated: false,
    isAdmin: true,
  },
  {
    id: "13",
    name: "No avataro alvaro",
    avatarUri: "",
    dominantArchetypeId: "buddy",
    alreadyAppreciated: true,
  },
  {
    id: "6",
    name: "David Wilson",
    avatarUri: "https://avatar.iran.liara.run/public/21",
    dominantArchetypeId: "guru",
    alreadyAppreciated: false,
  },
  {
    id: "7",
    name: "Emma Thompson",
    avatarUri: "https://avatar.iran.liara.run/public/3",
    dominantArchetypeId: "rise",
    alreadyAppreciated: false,
    isAdmin: true,
  },
  {
    id: "8",
    name: "Frank Miller",
    avatarUri: "https://avatar.iran.liara.run/public/48",
    alreadyAppreciated: false,
  },
  {
    id: "9",
    name: "Grace Lee",
    avatarUri: "https://avatar.iran.liara.run/public/36",
    alreadyAppreciated: true,
  },
  {
    id: "10",
    name: "Hannah White",
    avatarUri: "https://avatar.iran.liara.run/public/12",
    alreadyAppreciated: false,
  },
  { id: "14", name: "Blah bala", alreadyAppreciated: false },
  {
    id: "11",
    name: "Ian Harris",
    avatarUri: "https://avatar.iran.liara.run/public/27",
    alreadyAppreciated: false,
  },
  {
    id: "12",
    name: "Jack Clark",
    avatarUri: "https://avatar.iran.liara.run/public/23",
    dominantArchetypeId: "flow",
    alreadyAppreciated: true,
  },
  { id: "15", name: "Lorem ipsum", alreadyAppreciated: false },
  {
    id: "16",
    name: "Tony Williams",
    avatarUri: "https://avatar.iran.liara.run/public/16",
    dominantArchetypeId: "rise",
    alreadyAppreciated: false,
  },
  {
    id: "17",
    name: "Stephen Clark",
    avatarUri: "https://avatar.iran.liara.run/public/17",
    dominantArchetypeId: "flow",
    alreadyAppreciated: true,
  },
  {
    id: "18",
    name: "Johny Bravo",
    avatarUri: "https://avatar.iran.liara.run/public/23",
    alreadyAppreciated: false,
    isAdmin: true,
  },
]

const mockAttributeComments: Record<string, AttributeComment[]> = {
  flow: [
    {
      id: "comment-1",
      author: {
        name: "Alice Johnson",
        isAnonymous: false,
        avatarUri: "https://avatar.iran.liara.run/public/33",
      },
      message: "Great job on the project! Your attention to detail really shows.",
      timestamp: "2024-10-20T10:30:00Z",
    },
    {
      id: "comment-2",
      author: { name: "", isAnonymous: true },
      message:
        "You handled that difficult situation really well. Thanks for staying calm under pressure.",
      timestamp: "2024-10-19T14:15:00Z",
    },
    {
      id: "comment-3",
      author: {
        name: "Bob Wilson",
        isAnonymous: false,
        avatarUri: "https://avatar.iran.liara.run/public/21",
      },
      message: "Your presentation was excellent and very engaging!",
      timestamp: "2024-10-18T16:45:00Z",
    },
  ],
  buddy: [
    {
      id: "comment-4",
      author: { name: "", isAnonymous: true },
      message: "Always there to help others. Really appreciate your team spirit!",
      timestamp: "2024-10-20T09:20:00Z",
    },
    {
      id: "comment-5",
      author: {
        name: "Sarah Chen",
        isAnonymous: false,
        avatarUri: "https://avatar.iran.liara.run/public/36",
      },
      message: "Thanks for being so supportive during the tough deadline last week.",
      timestamp: "2024-10-17T13:30:00Z",
    },
  ],
  rise: [
    {
      id: "comment-6",
      author: {
        name: "Mike Thompson",
        isAnonymous: false,
        avatarUri: "https://avatar.iran.liara.run/public/48",
      },
      message: "Your leadership in the new initiative has been inspiring to watch.",
      timestamp: "2024-10-21T08:15:00Z",
    },
  ],
  guru: [
    {
      id: "comment-7",
      author: { name: "", isAnonymous: true },
      message: "Your expertise really helped solve that complex problem. Thank you!",
      timestamp: "2024-10-19T11:45:00Z",
    },
    {
      id: "comment-8",
      author: {
        name: "Lisa Davis",
        isAnonymous: false,
        avatarUri: "https://avatar.iran.liara.run/public/12",
      },
      message: "The training session you led was incredibly valuable. Learned so much!",
      timestamp: "2024-10-16T15:20:00Z",
    },
  ],
}

const baseAttributes: Record<string, ArchetypeAttribute[]> = {
  weekly: [
    { id: "flow", label: "Flow", score: 46 },
    { id: "buddy", label: "Buddy", score: 38 },
    { id: "rise", label: "Rise", score: 31 },
    { id: "guru", label: "Guru", score: 27 },
  ],
  monthly: [
    { id: "flow", label: "Flow", score: 58 },
    { id: "buddy", label: "Buddy", score: 44 },
    { id: "rise", label: "Rise", score: 52 },
    { id: "guru", label: "Guru", score: 41 },
  ],
  yearly: [
    { id: "flow", label: "Flow", score: 72 },
    { id: "buddy", label: "Buddy", score: 65 },
    { id: "rise", label: "Rise", score: 84 },
    { id: "guru", label: "Guru", score: 78 },
  ],
  overall: [
    { id: "flow", label: "Flow", score: 88 },
    { id: "buddy", label: "Buddy", score: 79 },
    { id: "rise", label: "Rise", score: 92 },
    { id: "guru", label: "Guru", score: 86 },
  ],
}

const archetypeTraitDefinitions: Record<ArchetypeKey, Omit<AttributeTraitType, "score">[]> = {
  guru: [
    { id: "calm", label: "Calm" },
    { id: "reasonable", label: "Reasonable" },
    { id: "patient", label: "Patient" },
    { id: "authentic", label: "Authentic" },
    { id: "balanced", label: "Balanced" },
  ],
  buddy: [
    { id: "sociable", label: "Sociable" },
    { id: "empathetic", label: "Empathetic" },
    { id: "helpful", label: "Helpful" },
    { id: "fun", label: "Fun" },
    { id: "loyal", label: "Loyal" },
  ],
  rise: [
    { id: "brave", label: "Brave" },
    { id: "motivating", label: "Motivating" },
    { id: "charismatic", label: "Charismatic" },
    { id: "energetic", label: "Energetic" },
    { id: "proactive", label: "Proactive" },
  ],
  flow: [
    { id: "creative", label: "Creative" },
    { id: "spontaneous", label: "Spontaneous" },
    { id: "intuitive", label: "Intuitive" },
    { id: "flexible", label: "Flexible" },
    { id: "optimistic", label: "Optimistic" },
  ],
}

const archetypeTraitDefinitionsPL: Record<ArchetypeKey, Omit<AttributeTraitType, "score">[]> = {
  guru: [
    { id: "calm", label: "spokojny" },
    { id: "reasonable", label: "rozsądny" },
    { id: "patient", label: "cierpliwy" },
    { id: "authentic", label: "autentyczny" },
    { id: "balanced", label: "zrównoważony" },
  ],
  buddy: [
    { id: "sociable", label: "towarzyski" },
    { id: "empathetic", label: "empatyczny" },
    { id: "helpful", label: "pomocny" },
    { id: "fun", label: "zabawny" },
    { id: "loyal", label: "lojalny" },
  ],
  rise: [
    { id: "brave", label: "odważny" },
    { id: "motivating", label: "motywujący" },
    { id: "charismatic", label: "charyzmatyczny" },
    { id: "energetic", label: "energiczny" },
    { id: "proactive", label: "proaktywny" },
  ],
  flow: [
    { id: "creative", label: "kreatywny" },
    { id: "spontaneous", label: "spontaniczny" },
    { id: "intuitive", label: "intuicyjny" },
    { id: "flexible", label: "elastyczny" },
    { id: "optimistic", label: "optymistyczny" },
  ],
}

const traitWeightMap: Record<ArchetypeKey, number[]> = {
  guru: [1.12, 1.07, 1, 0.98, 0.95],
  buddy: [1.08, 1.05, 1, 0.97, 0.94],
  rise: [1.1, 1.05, 1.02, 0.98, 0.95],
  flow: [1.09, 1.02, 1, 0.97, 0.94],
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

const attributesTimeline: Record<string, ArchetypeAttribute[][]> = Object.fromEntries(
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

function handleAttributeDetails(config: InternalAxiosRequestConfig): AxiosResponse {
  const authCheck = assertAuthHeader(config)
  if (!authCheck.valid) {
    return createResponse(config, 401, { error: authCheck.message })
  }

  const view = ((config.params?.view as AttributesViewType) ?? "overall") as AttributesViewType
  const archetypeId = config.params?.archetypeId as ArchetypeKey | undefined
  const rawOffset = parseInt(String(config.params?.offset ?? "0"), 10)
  const lang = (config.params?.lang as string) ?? "en"
  if (!archetypeId) {
    return createResponse(config, 400, { error: "Missing archetypeId" })
  }

  const timeline = ensureTimeline(view)
  const maxIndex = Math.max(0, timeline.length - 1)
  const offset = Number.isFinite(rawOffset) ? Math.min(Math.max(rawOffset, 0), maxIndex) : 0
  const attributes = timeline[offset] ?? []
  const attribute = attributes.find((item) => item.id === archetypeId)

  if (!attribute) {
    return createResponse(config, 404, { error: "Attribute not found" })
  }

  const traits = buildTraitDetails({
    archetypeId,
    totalScore: attribute.score,
    offset,
    view,
    lang,
  })

  const payload: AttributeDetails = {
    archetypeId,
    label: attribute.label,
    totalScore: attribute.score,
    view,
    offset,
    traits,
  }

  return createResponse(config, 200, {
    data: payload,
  })
}

function handleAttributeComments(config: InternalAxiosRequestConfig): AxiosResponse {
  const authCheck = assertAuthHeader(config)
  if (!authCheck.valid) {
    return createResponse(config, 401, { error: authCheck.message })
  }

  const archetypeId = config.params?.archetypeId as ArchetypeKey | undefined
  if (!archetypeId) {
    return createResponse(config, 400, { error: "Missing archetypeId" })
  }

  const comments = mockAttributeComments[archetypeId] || []

  // Sort comments by timestamp, newest first
  const sortedComments = [...comments].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  )

  const payload: AttributeCommentsData = {
    comments: sortedComments,
  }

  return createResponse(config, 200, {
    data: payload,
  })
}

function handleGroupMembers(config: InternalAxiosRequestConfig): AxiosResponse {
  const authCheck = assertAuthHeader(config)
  if (!authCheck.valid) {
    return createResponse(config, 401, { error: authCheck.message })
  }

  return createResponse(config, 200, {
    data: mockedGroupMembers,
  })
}

function applyOffset(view: string, offset: number): ArchetypeAttribute[] {
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

function ensureTimeline(view: string): ArchetypeAttribute[][] {
  if (!attributesTimeline[view]) {
    const length = TIMELINE_LENGTH_BY_VIEW[view] ?? DEFAULT_TIMELINE_LENGTH
    attributesTimeline[view] = createTimelineForView(view, length)
  }

  return attributesTimeline[view]
}

function createTimelineForView(view: string, length: number): ArchetypeAttribute[][] {
  const normalizedLength = Math.max(1, Math.floor(length))
  return Array.from({ length: normalizedLength }, (_, index) => {
    if (index === 0) {
      const base = baseAttributes[view] ?? baseAttributes.overall
      return base.map((attribute) => ({ ...attribute }))
    }

    return applyOffset(view, index)
  })
}

function buildTraitDetails(params: {
  archetypeId: ArchetypeKey
  totalScore: number
  offset: number
  view: AttributesViewType
  lang?: string
}): AttributeTraitType[] {
  const { archetypeId, totalScore, offset, view, lang = "en" } = params
  const traitDefinitions =
    lang === "pl"
      ? (archetypeTraitDefinitionsPL[archetypeId] ?? [])
      : (archetypeTraitDefinitions[archetypeId] ?? [])
  if (traitDefinitions.length === 0) return []

  const weights = traitWeightMap[archetypeId] ?? []
  const count = traitDefinitions.length
  const baseScore = totalScore / count
  const midpoint = (count - 1) / 2
  const viewModifierMap: Record<AttributesViewType, number> = {
    overall: 1,
    weekly: 0.85,
    monthly: 0.95,
    yearly: 1.05,
  }

  const viewModifier = viewModifierMap[view] ?? 1

  return traitDefinitions.map((trait, index) => {
    const weight = weights[index] ?? 1
    const positionVariance = (index - midpoint) * 1.6
    const offsetVariance = offset * (index % 2 === 0 ? -1.2 : 1.2)
    const rawScore = baseScore * weight * viewModifier + positionVariance + offsetVariance
    return {
      ...trait,
      score: Math.max(2, Math.round(rawScore)),
    }
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
  "GET /attributes/details": handleAttributeDetails,
  "GET /attributes/comments": handleAttributeComments,
  "GET /groups/members": handleGroupMembers,
  // Returns a flattened list of all traits (without scores) for appreciate flow selection
  "GET /traits": (config) => {
    const authCheck = assertAuthHeader(config)
    if (!authCheck.valid) {
      return createResponse(config, 401, { error: authCheck.message })
    }

    const lang = (config.params?.lang as string) ?? "en"
    const source = lang === "pl" ? archetypeTraitDefinitionsPL : archetypeTraitDefinitions
    const traits = Object.entries(source).flatMap(([archetypeId, list]) =>
      list.map((trait) => ({ ...trait, archetypeId })),
    )
    return createResponse(config, 200, { data: traits })
  },
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
