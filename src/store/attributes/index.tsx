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
import { AttributeType } from "@/types/attributeType"
import { AttributesViewType } from "@/types/attributesViewType"
import { getAttributes } from "@/api/attributes"
import { NormalizedAttribute, useNormalizeAttributes } from "@/utils/useNormalizeAttributes"

type RefreshAttributesParams = {
  view?: AttributesViewType
  offset?: number
}

export type AttributesContextType = {
  attributes: AttributeType[]
  timeline: AttributeType[][]
  normalizedAttributes: NormalizedAttribute[]
  currentView: AttributesViewType
  currentOffset: number
  maxOffset: number
  isLoading: boolean
  isInitialLoading: boolean
  isRefetching: boolean
  refreshAttributes: (params?: RefreshAttributesParams) => Promise<void>
}

const AttributesContext = createContext<AttributesContextType | null>(null)

export function AttributesProvider({ children }: PropsWithChildren) {
  const { user } = useUser()
  const queryClient = useQueryClient()
  const [currentView, setCurrentView] = useState<AttributesViewType>("overall")
  const [currentOffset, setCurrentOffset] = useState(0)

  const queryKey = useMemo(() => ["attributes", currentView], [currentView])

  const {
    data: timelineData,
    isLoading: isInitialLoading,
    isRefetching,
  } = useQuery<AttributeType[][]>({
    queryKey,
    queryFn: async ({ queryKey: [, viewKey] }) => {
      if (!user) return []
      const safeView = (viewKey as AttributesViewType) ?? "overall"
      const result = await getAttributes({ view: safeView })
      return Array.isArray(result) ? result : []
    },
    enabled: !!user,
    placeholderData: (previousData) => previousData ?? ([] as AttributeType[][]),
    staleTime: 30_000,
  })

  useEffect(() => {
    if (!user) {
      queryClient.removeQueries({ queryKey: ["attributes"] })
      setCurrentView("overall")
      setCurrentOffset(0)
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
  const attributes: AttributeType[] = timeline[currentOffset] ?? []
  const normalizedAttributes = useNormalizeAttributes(attributes)

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
      const desiredOffset =
        params?.offset != null
          ? Math.max(0, Math.floor(params.offset))
          : viewChanged
            ? 0
            : currentOffset
      const boundedOffset = viewChanged ? desiredOffset : Math.min(desiredOffset, maxOffset)

      if (viewChanged) {
        setCurrentView(nextView)
      }

      setCurrentOffset((previous) => {
        const normalized = viewChanged ? desiredOffset : boundedOffset
        return normalized === previous ? previous : normalized
      })

      if (viewChanged) {
        await queryClient.invalidateQueries({
          queryKey: ["attributes", nextView],
          exact: true,
        })
      }
    },
    [currentOffset, currentView, maxOffset, queryClient, user],
  )

  const isLoading = isInitialLoading || isRefetching

  const value = useMemo(
    () => ({
      attributes,
      timeline,
      normalizedAttributes,
      currentView,
      currentOffset,
      maxOffset,
      isLoading,
      isInitialLoading,
      isRefetching,
      refreshAttributes,
    }),
    [
      attributes,
      currentOffset,
      currentView,
      isInitialLoading,
      isLoading,
      isRefetching,
      maxOffset,
      normalizedAttributes,
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
