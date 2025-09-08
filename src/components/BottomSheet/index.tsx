import { StyleSheet, TouchableOpacity, ViewStyle } from "react-native"
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
}

export function BottomSheet({ isOpen, toggleSheet, duration = 500, children }: Props) {
  const {
    themed,
    theme: { colors },
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
        style={[themed($sheetStyle), sheetStylez, { paddingBottom: bottom }]}
      >
        {children}
      </Animated.View>
    </>
  )
}

const $sheetStyle: ThemedStyle<ViewStyle> = ({ colors }) => ({
  alignItems: "center",
  backgroundColor: colors.tabBarBackground,
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,
  bottom: 0,
  justifyContent: "center",
  padding: 16,
  position: "absolute",
  width: "100%",
  zIndex: 2,
})

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
})
