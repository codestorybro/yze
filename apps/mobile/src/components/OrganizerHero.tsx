import { Image, ImageSourcePropType, ImageStyle, View, ViewStyle } from "react-native"

import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

const heroImages: Record<"light" | "dark", ImageSourcePropType> = {
  light: require("../../assets/images/brand/yze-organizer-hero-light.jpg"),
  dark: require("../../assets/images/brand/yze-organizer-hero-dark.jpg"),
}

/**
 * The dominant visual on the Yze home screen.
 *
 * The image itself changes with the semantic theme so the subject keeps natural contrast without
 * adding platform checks or artificial glass effects to the content layer.
 */
export function OrganizerHero() {
  const { themed, themeContext } = useAppTheme()

  return (
    <View style={themed($container)}>
      <Image
        accessibilityIgnoresInvertColors
        accessibilityLabel="Technical gear arranged inside a modular organizer"
        resizeMode="cover"
        source={heroImages[themeContext]}
        style={$image}
      />
    </View>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ colors, radii }) => ({
  aspectRatio: 1.5,
  width: "100%",
  overflow: "hidden",
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: radii.xl,
  backgroundColor: colors.surfaceMuted,
})

const $image: ImageStyle = {
  width: "100%",
  height: "100%",
}
