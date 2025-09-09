import { ScrollView, StyleSheet, TouchableOpacity, ViewStyle } from "react-native"
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"

type Props = {
  isOpen: SharedValue<boolean>
  toggleSheet: () => void
  duration?: number
  children: React.ReactNode
  scrollable?: boolean
}

export function BottomSheet({ isOpen, toggleSheet, duration = 500, children, scrollable }: Props) {
  const {
    themed,
    theme: { colors, spacing },
  } = useAppTheme()
  const { bottom } = useSafeAreaInsets()
  const height = useSharedValue(0)
  const progress = useDerivedValue(() => withTiming(isOpen.value ? 0 : 1, { duration }))

  const sheetStylez = useAnimatedStyle(() => ({
    transform: [{ translateY: progress.value * 2 * height.value }],
  }))

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
    zIndex: isOpen.value ? 1 : withDelay(duration, withTiming(-1, { duration: 0 })),
  }))

  return (
    <>
      <Animated.View
        style={[
          backdropStyle,
          StyleSheet.absoluteFillObject,
          { backgroundColor: colors.palette.modalBackdrop },
        ]}
      >
        <TouchableOpacity style={styles.flex} onPress={toggleSheet} />
      </Animated.View>
      <Animated.View
        onLayout={(e) => {
          height.value = e.nativeEvent.layout.height
        }}
        style={[
          themed($sheetStyle),
          sheetStylez,
          !scrollable && { paddingBottom: bottom, paddingTop: spacing.md },
        ]}
      >
        {scrollable ? (
          <ScrollView
            style={[styles.flex, { paddingTop: spacing.md }]}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: bottom }}
          >
            {children}
          </ScrollView>
        ) : (
          children
        )}
      </Animated.View>
    </>
  )
}

const $sheetStyle: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.tabBarBackground,
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,
  bottom: 0,
  paddingHorizontal: spacing.lg,
  position: "absolute",
  width: "100%",
  zIndex: 2,
  maxHeight: "80%",
})

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
})
