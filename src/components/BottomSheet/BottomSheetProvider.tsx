import { createContext, useState, ReactNode } from "react"
import { View, ViewStyle } from "react-native"
import { useSharedValue } from "react-native-reanimated"

import { BottomSheet, Text } from "@/components"
import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"

type BottomSheetContextType = {
  openSheet: (content: ContentType) => void
  closeSheet: () => void
}

export const BottomSheetContext = createContext<BottomSheetContextType | undefined>(undefined)

type StructuredContent = {
  title?: string | ReactNode
  description?: string | ReactNode
  actionSection?: ReactNode
}

type ContentType =
  | ({ type?: "structured"; scrollable?: boolean } & StructuredContent)
  | { type: "custom"; scrollable?: boolean; content: ReactNode }

export function BottomSheetProvider({ children }: { children: ReactNode }) {
  const isOpen = useSharedValue(false)
  const [content, setContent] = useState<ContentType | null>(null)
  const { themed } = useAppTheme()

  const toggleSheet = () => {
    isOpen.value = !isOpen.value
  }

  const openSheet = (content: ContentType) => {
    setContent(content)
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
      <BottomSheet isOpen={isOpen} toggleSheet={toggleSheet} scrollable={content?.scrollable}>
        {content?.type === "custom" ? (
          content.content
        ) : (
          <>
            {content?.title ? <Text preset="subheading">{content.title}</Text> : null}
            {content?.description ? <Text>{content.description}</Text> : null}
            {content?.actionSection ? (
              <View style={themed($actionSectionStyles)}>{content.actionSection}</View>
            ) : null}
          </>
        )}
      </BottomSheet>
    </BottomSheetContext.Provider>
  )
}

const $actionSectionStyles: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  gap: spacing.xs,
  justifyContent: "space-between",
  marginTop: spacing.lg,
})
