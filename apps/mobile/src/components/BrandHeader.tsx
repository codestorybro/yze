import { Platform, TextStyle, View, ViewStyle } from "react-native"

import { BrandMark } from "@/components/BrandMark"
import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

interface BrandHeaderProps {
  badge?: string
}

/** The compact Yze identity row shared by top-level product screens. */
export function BrandHeader({ badge }: BrandHeaderProps) {
  const { themed } = useAppTheme()

  return (
    <View style={[themed($container), $webNavigationOffset]}>
      <BrandMark />
      {!!badge && (
        <View style={themed($badge)}>
          <Text preset="caption" style={themed($badgeText)} text={badge} />
        </View>
      )}
    </View>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "space-between",
  gap: spacing.sm,
})

const $badge: ThemedStyle<ViewStyle> = ({ colors, radii, spacing }) => ({
  maxWidth: "100%",
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xxs,
  borderRadius: radii.pill,
  backgroundColor: colors.surfaceMuted,
})

const $badgeText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
  letterSpacing: 0.5,
  textTransform: "uppercase",
})

// Expo Router's NativeTabs web fallback floats at the top; native tabs remain bottom-aligned.
const $webNavigationOffset = Platform.select<ViewStyle>({ web: { marginTop: 56 } })
