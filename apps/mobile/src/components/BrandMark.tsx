import type { ImageStyle, PressableProps, ViewStyle } from "react-native"
import { Image, Pressable, View } from "react-native"

import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

interface BrandMarkProps {
  onPress?: NonNullable<PressableProps["onPress"]>
}

/** The theme-aware app icon used as Yze's compact visual signature. */
export function BrandMark({ onPress }: BrandMarkProps) {
  const { themeContext, themed } = useAppTheme()
  const image = (
    <Image
      accessibilityLabel="Yze"
      accessibilityRole="image"
      source={
        themeContext === "dark"
          ? require("../../assets/images/app-icon-ios-dark.png")
          : require("../../assets/images/app-icon-ios-light.png")
      }
      style={$image}
    />
  )

  if (!onPress) return <View style={themed($frame)}>{image}</View>

  return (
    <Pressable
      accessibilityHint="Opens Home"
      accessibilityLabel="Yze Home"
      accessibilityRole="button"
      hitSlop={6}
      onPress={onPress}
      style={({ pressed }) => [themed($frame), pressed && $pressed]}
    >
      {image}
    </Pressable>
  )
}

const $frame: ThemedStyle<ViewStyle> = ({ colors, radii }) => ({
  width: 44,
  height: 44,
  overflow: "hidden",
  borderWidth: 1,
  borderColor: colors.controlBorder,
  borderRadius: radii.md,
  backgroundColor: colors.surfaceRaised,
})
const $image: ImageStyle = { width: "100%", height: "100%" }
const $pressed: ViewStyle = { opacity: 0.7, transform: [{ scale: 0.97 }] }
