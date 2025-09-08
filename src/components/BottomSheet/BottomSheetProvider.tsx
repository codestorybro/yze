import { createContext, useContext, useState, ReactNode } from "react"
import { View, ViewStyle } from "react-native"
import { useSharedValue } from "react-native-reanimated"

import { BottomSheet, Text } from "@/components"
import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"

type BottomSheetContextType = {
  openSheet: (content: ContentType) => void
  closeSheet: () => void
}

const BottomSheetContext = createContext<BottomSheetContextType | undefined>(undefined)

type ContentType = {
  title?: string | ReactNode
  description?: string | ReactNode
  actionSection?: ReactNode
}

export function BottomSheetProvider({ children }: { children: ReactNode }) {
  const isOpen = useSharedValue(false)
  const [content, setContent] = useState<ContentType | null>(null)
  const { themed } = useAppTheme()

  const toggleSheet = () => {
    isOpen.value = !isOpen.value
  }

  const openSheet = ({ title, description, actionSection }: ContentType) => {
    setContent({ title, description, actionSection })
    if (!isOpen.value) {
      toggleSheet()
    }
  }

  const closeSheet = () => {
    if (isOpen.value) {
      toggleSheet()
    }
  }

  return (
    <BottomSheetContext.Provider value={{ openSheet, closeSheet }}>
      {children}
      <BottomSheet isOpen={isOpen} toggleSheet={toggleSheet}>
        <Text preset="subheading">{content?.title}</Text>
        <Text>{content?.description}</Text>
        <View style={themed($actionSectionStyles)}>{content?.actionSection}</View>
      </BottomSheet>
    </BottomSheetContext.Provider>
  )
}

export function useBottomSheet() {
  const ctx = useContext(BottomSheetContext)
  if (!ctx) throw new Error("useBottomSheet must be used inside BottomSheetProvider")
  return ctx
}

const $actionSectionStyles: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  gap: spacing.xs,
  justifyContent: "space-between",
  marginTop: spacing.lg,
})
