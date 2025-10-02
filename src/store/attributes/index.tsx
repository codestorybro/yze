import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

import { useUser } from "@/store/auth"
import { AttributeType } from "@/types/attributeType"
import { fetchAttributes } from "@/utils/fetchAttributes"
import { NormalizedAttribute, useNormalizeAttributes } from "@/utils/useNormalizeAttributes"

export type AttributesContextType = {
  attributes: AttributeType[]
  normalizedAttributes: NormalizedAttribute[]
  isLoading: boolean
  refreshAttributes: () => Promise<void>
}

const AttributesContext = createContext<AttributesContextType | null>(null)

export function AttributesProvider({ children }: PropsWithChildren) {
  const { user } = useUser()
  const [attributes, setAttributes] = useState<AttributeType[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const normalizedAttributes = useNormalizeAttributes(attributes)

  const refreshAttributes = useCallback(async () => {
    if (!user) {
      setAttributes([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const data = await fetchAttributes()
      setAttributes(data)
    } catch (error) {
      console.error("Failed to fetch attributes", error)
      setAttributes([])
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    refreshAttributes()
  }, [refreshAttributes])

  const value = useMemo(
    () => ({ attributes, normalizedAttributes, isLoading, refreshAttributes }),
    [attributes, normalizedAttributes, isLoading, refreshAttributes],
  )

  return <AttributesContext.Provider value={value}>{children}</AttributesContext.Provider>
}

export function useAttributes() {
  const ctx = useContext(AttributesContext)
  if (!ctx) throw new Error("useAttributes must be used within <AttributesProvider />")
  return ctx
}
