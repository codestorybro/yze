import { StyleSheet, View, ViewStyle } from "react-native"
import Animated, { interpolate, SharedValue, useAnimatedStyle } from "react-native-reanimated"

import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"
import { UserType } from "@/types/userType"

export function BackdropAvatar({
  user,
  index,
  scrollX,
}: {
  user: UserType
  index: number
  scrollX: SharedValue<number>
}) {
  const { themed } = useAppTheme()
  const stylez = useAnimatedStyle(() => {
    return {
      opacity: interpolate(scrollX.value, [index - 1, index, index + 1], [0, 1, 0]),
    }
  })

  return user.id !== "0" ? (
    <Animated.Image
      source={{ uri: user.avatarUri }}
      style={[StyleSheet.absoluteFillObject, stylez]}
      blurRadius={50}
    />
  ) : (
    <View style={themed($emptyBackgroundWrapper)} />
  )
}

const $emptyBackgroundWrapper: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: "100%",
  height: "100%",
  backgroundColor: colors.background,
})
