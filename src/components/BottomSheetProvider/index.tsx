import React, { createContext, useCallback, useMemo, useRef, useState, ReactNode } from "react"
import { StyleSheet, ViewStyle } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import BottomSheet, { BottomSheetScrollView, BottomSheetBackdrop } from "@gorhom/bottom-sheet"
import { ThemedStyle } from "@/theme/types"
import { useAppTheme } from "@/theme/context"

type BottomSheetContextType = {
  openSheet: (content: ReactNode) => void
  closeSheet: () => void
}

export const BottomSheetContext = createContext<BottomSheetContextType | undefined>(undefined)

export function BottomSheetProvider({ children }: { children: ReactNode }) {
  const sheetRef = useRef<BottomSheet>(null)
  const [content, setContent] = useState<ReactNode>(null)
  const { themed } = useAppTheme()

  const snapPoints = useMemo(() => ["40%", "80%"], [])

  const openSheet = useCallback((content: ReactNode) => {
    setContent(content)
    sheetRef.current?.snapToIndex(1)
  }, [])

  const closeSheet = useCallback(() => {
    sheetRef.current?.close()
    setContent(null)
  }, [])

  const renderBackdrop = useCallback(
    (props: any) => <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />,
    [],
  )

  return (
    <BottomSheetContext.Provider value={{ openSheet, closeSheet }}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        {children}
        <BottomSheet
          ref={sheetRef}
          index={-1}
          snapPoints={snapPoints}
          enableDynamicSizing={false}
          backdropComponent={renderBackdrop}
          onClose={() => setContent(null)}
          enablePanDownToClose
          backgroundStyle={themed($contentContainerStyle)}
          handleIndicatorStyle={themed($indicatorStyle)}
        >
          <BottomSheetScrollView contentContainerStyle={themed($contentContainerStyle)}>
            {content}
          </BottomSheetScrollView>
        </BottomSheet>
      </GestureHandlerRootView>
    </BottomSheetContext.Provider>
  )
}

const $contentContainerStyle: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.background,
  padding: spacing.md,
})

const $indicatorStyle: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.text,
})
