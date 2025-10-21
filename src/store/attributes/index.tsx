import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"

import { useUser } from "@/store/auth"
import { ArchetypeAttribute } from "@/types/attributeType"
import { AttributesViewType } from "@/types/attributesViewType"
import { getAttributeDetails, getAttributes, getAttributeComments } from "@/api/attributes"
import type { AttributeDetails } from "@/types/attributeDetails"
import type { ArchetypeKey } from "@/types/archetype"
import type { AttributeCommentsData } from "@/types/attributeComment"

type RefreshAttributesParams = {
  view?: AttributesViewType
  offset?: number
}

type AttributeDetailsParams = {
  archetypeId: ArchetypeKey
  view?: AttributesViewType
  offset?: number
  force?: boolean
  lang?: string
}

type AttributeCommentsParams = {
  archetypeId: ArchetypeKey
  view?: AttributesViewType
  offset?: number
  force?: boolean
  lang?: string
}

export type AttributesContextType = {
  attributes: ArchetypeAttribute[]
  timeline: ArchetypeAttribute[][]
  currentView: AttributesViewType
  currentOffset: number
  maxOffset: number
  isLoading: boolean
  isInitialLoading: boolean
  isRefetching: boolean
  refreshAttributes: (params?: RefreshAttributesParams) => Promise<void>
  attributeDetails: Record<string, AttributeDetails>
  attributeDetailsLoading: Record<string, boolean>
  fetchAttributeDetails: (params: AttributeDetailsParams) => Promise<AttributeDetails | null>
  attributeComments: Record<string, AttributeCommentsData>
  attributeCommentsLoading: Record<string, boolean>
  fetchAttributeComments: (params: AttributeCommentsParams) => Promise<AttributeCommentsData | null>
}

const AttributesContext = createContext<AttributesContextType | null>(null)

export function createAttributeDetailsKey(
  view: AttributesViewType,
  offset: number,
  archetypeId: ArchetypeKey,
) {
  return `${view}:${offset}:${archetypeId}`
}

export function AttributesProvider({ children }: PropsWithChildren) {
  const { user } = useUser()
  const queryClient = useQueryClient()
  const [currentView, setCurrentView] = useState<AttributesViewType>("overall")
  const [currentOffset, setCurrentOffset] = useState(0)
  const [attributeDetailsMap, setAttributeDetailsMap] = useState<Record<string, AttributeDetails>>(
    {},
  )
  const [attributeDetailsLoading, setAttributeDetailsLoading] = useState<Record<string, boolean>>(
    {},
  )
  const [attributeCommentsMap, setAttributeCommentsMap] = useState<
    Record<string, AttributeCommentsData>
  >({})
  const [attributeCommentsLoading, setAttributeCommentsLoading] = useState<Record<string, boolean>>(
    {},
  )

  const queryKey = useMemo(() => ["attributes", currentView], [currentView])

  const fetchAttributesData = useCallback(
    async (view: AttributesViewType) => {
      if (!user) return []

      const safeView = view ?? "overall"
      const result = await getAttributes({ view: safeView })
      return Array.isArray(result) ? result : []
    },
    [user],
  )

  const {
    data: timelineData,
    isLoading: isInitialLoading,
    isRefetching,
  } = useQuery<ArchetypeAttribute[][]>({
    queryKey,
    queryFn: async ({ queryKey: [, viewKey] }) => {
      const safeView = (viewKey as AttributesViewType) ?? "overall"
      return fetchAttributesData(safeView)
    },
    enabled: !!user,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnReconnect: "always",
    refetchOnWindowFocus: "always",
  })

  useEffect(() => {
    if (!user) {
      queryClient.removeQueries({ queryKey: ["attributes"] })
      setCurrentView("overall")
      setCurrentOffset(0)
      setAttributeDetailsMap({})
      setAttributeDetailsLoading({})
      setAttributeCommentsMap({})
      setAttributeCommentsLoading({})
    }
  }, [queryClient, user])

  useEffect(() => {
    if (!timelineData || timelineData.length === 0) {
      setCurrentOffset(0)
      return
    }

    setCurrentOffset((previous) => {
      const maxIndex = timelineData.length - 1
      const clamped = Math.min(Math.max(previous, 0), maxIndex)
      return clamped === previous ? previous : clamped
    })
  }, [timelineData])

  const timeline = timelineData ?? []
  const maxOffset = timeline.length > 0 ? timeline.length - 1 : 0
  const attributes: ArchetypeAttribute[] = timeline[currentOffset] ?? []
  const refreshAttributes = useCallback(
    async (params?: RefreshAttributesParams) => {
      if (!user) {
        queryClient.removeQueries({ queryKey: ["attributes"] })
        setCurrentView("overall")
        setCurrentOffset(0)
        return
      }

      const nextView = params?.view ?? currentView
      const viewChanged = nextView !== currentView
      const requestedOffset =
        params?.offset != null ? Math.max(0, Math.floor(params.offset)) : currentOffset
      const boundedOffset = viewChanged ? requestedOffset : Math.min(requestedOffset, maxOffset)
      const shouldForceFetch = !params || (params.view == null && params.offset == null)
      const shouldFetchFromBackend = viewChanged || shouldForceFetch

      if (viewChanged) {
        setCurrentView(nextView)
      }

      setCurrentOffset((previous) => {
        const normalized = viewChanged ? requestedOffset : boundedOffset
        return normalized === previous ? previous : normalized
      })

      if (shouldFetchFromBackend) {
        try {
          await queryClient.fetchQuery({
            queryKey: ["attributes", nextView],
            queryFn: () => fetchAttributesData(nextView),
            staleTime: 0,
          })
        } catch (error) {
          console.error("Failed to refresh attributes", error)
        }
      }
    },
    [currentOffset, currentView, fetchAttributesData, maxOffset, queryClient, user],
  )

  const isLoading = isInitialLoading || isRefetching

  const fetchAttributeDetails = useCallback(
    async (params: AttributeDetailsParams): Promise<AttributeDetails | null> => {
      if (!user) {
        setAttributeDetailsMap({})
        setAttributeDetailsLoading({})
        setAttributeCommentsMap({})
        setAttributeCommentsLoading({})
        return null
      }

      const targetView = params.view ?? currentView
      const targetOffset = params.offset ?? currentOffset
      const key = createAttributeDetailsKey(targetView, targetOffset, params.archetypeId)

      if (!params.force && attributeDetailsMap[key]) {
        return attributeDetailsMap[key]
      }

      if (attributeDetailsLoading[key]) {
        return null
      }

      setAttributeDetailsLoading((prev) => ({ ...prev, [key]: true }))

      try {
        const details = await getAttributeDetails({
          view: targetView,
          offset: targetOffset,
          archetypeId: params.archetypeId,
          lang: params.lang,
        })

        setAttributeDetailsMap((prev) => ({ ...prev, [key]: details }))
        return details
      } catch (error) {
        console.error("Failed to fetch attribute details", error)
        return null
      } finally {
        setAttributeDetailsLoading((prev) => {
          const next = { ...prev }
          delete next[key]
          return next
        })
      }
    },
    [
      attributeDetailsLoading,
      attributeDetailsMap,
      currentOffset,
      currentView,
      user,
      getAttributeDetails,
    ],
  )

  const fetchAttributeComments = useCallback(
    async (params: AttributeCommentsParams): Promise<AttributeCommentsData | null> => {
      if (!user) {
        setAttributeCommentsMap({})
        setAttributeCommentsLoading({})
        return null
      }

      const targetView = params.view ?? currentView
      const targetOffset = params.offset ?? currentOffset
      const key = createAttributeDetailsKey(targetView, targetOffset, params.archetypeId)

      if (!params.force && attributeCommentsMap[key]) {
        return attributeCommentsMap[key]
      }

      if (attributeCommentsLoading[key]) {
        return null
      }

      setAttributeCommentsLoading((prev) => ({ ...prev, [key]: true }))

      try {
        const comments = await getAttributeComments({
          view: targetView,
          offset: targetOffset,
          archetypeId: params.archetypeId,
          lang: params.lang,
        })

        setAttributeCommentsMap((prev) => ({ ...prev, [key]: comments }))
        return comments
      } catch (error) {
        console.error("Failed to fetch attribute comments", error)
        return null
      } finally {
        setAttributeCommentsLoading((prev) => {
          const next = { ...prev }
          delete next[key]
          return next
        })
      }
    },
    [attributeCommentsLoading, attributeCommentsMap, currentOffset, currentView, user],
  )

  const value = useMemo(
    () => ({
      attributes,
      timeline: timeline,
      currentView,
      currentOffset,
      maxOffset,
      isLoading,
      isInitialLoading,
      isRefetching,
      refreshAttributes,
      attributeDetails: attributeDetailsMap,
      attributeDetailsLoading,
      fetchAttributeDetails,
      attributeComments: attributeCommentsMap,
      attributeCommentsLoading,
      fetchAttributeComments,
    }),
    [
      attributes,
      attributeDetailsLoading,
      attributeDetailsMap,
      attributeCommentsLoading,
      attributeCommentsMap,
      currentOffset,
      currentView,
      isInitialLoading,
      isLoading,
      isRefetching,
      maxOffset,
      fetchAttributeDetails,
      fetchAttributeComments,
      refreshAttributes,
      timeline,
    ],
  )

  return <AttributesContext.Provider value={value}>{children}</AttributesContext.Provider>
}

export function useAttributes() {
  const ctx = useContext(AttributesContext)
  if (!ctx) throw new Error("useAttributes must be used within <AttributesProvider />")
  return ctx
}
