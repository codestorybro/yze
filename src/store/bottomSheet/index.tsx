import React, {
  createContext,
  useCallback,
  useMemo,
  useRef,
  useState,
  ReactNode,
  useContext,
} from "react"
import { ViewStyle, StyleSheet, View } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import BottomSheet, { BottomSheetScrollView, BottomSheetBackdrop } from "@gorhom/bottom-sheet"
import { ThemedStyle } from "@/theme/types"
import { useAppTheme } from "@/theme/context"
import { LinearGradient } from "expo-linear-gradient"

type BottomSheetContextType = {
  openSheet: (content: ReactNode) => void
  closeSheet: () => void
}

const BottomSheetContext = createContext<BottomSheetContextType | undefined>(undefined)

export function BottomSheetProvider({ children }: { children: ReactNode }) {
  const sheetRef = useRef<BottomSheet>(null)
  const [content, setContent] = useState<ReactNode>(null)
  const {
    themed,
    theme: { colors, spacing },
  } = useAppTheme()

  const snapPoints = useMemo(() => ["75%"], [])

  const openSheet = useCallback((content: ReactNode) => {
    setContent(content)
    sheetRef.current?.snapToIndex(0)
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
          <View style={{ flex: 1 }}>
            <BottomSheetScrollView
              contentContainerStyle={themed($contentContainerStyle)}
              showsVerticalScrollIndicator={false}
            >
              {content}
            </BottomSheetScrollView>

            <LinearGradient
              pointerEvents="none"
              colors={[colors.tabBarBackground, `${colors.tabBarBackground}00`]}
              style={[styles.fade, { top: 0, height: spacing.xxl }]}
            />

            <LinearGradient
              pointerEvents="none"
              colors={[`${colors.tabBarBackground}00`, colors.tabBarBackground]}
              style={[styles.fade, { bottom: 0, height: spacing.xxl }]}
            />
          </View>
        </BottomSheet>
      </GestureHandlerRootView>
    </BottomSheetContext.Provider>
  )
}

const $contentContainerStyle: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.tabBarBackground,
  padding: spacing.md,
})

const $indicatorStyle: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.text,
})

const styles = StyleSheet.create({
  fade: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 10,
  },
})

export const useBottomSheet = () => {
  const ctx = useContext(BottomSheetContext)
  if (!ctx) throw new Error("useBottomSheet must be used within BottomSheetProvider")
  return ctx
}
