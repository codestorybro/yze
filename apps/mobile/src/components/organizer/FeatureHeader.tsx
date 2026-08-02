import type { TextStyle, ViewStyle } from "react-native"
import { Platform, Pressable, View } from "react-native"

import { BrandMark } from "@/components/BrandMark"
import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

interface FeatureHeaderProps {
  actionLabel?: string
  eyebrow?: string
  onBrandPress?: () => void
  onAction?: () => void
  reserveNavigationSpace?: boolean
  showBrand?: boolean
  subtitle?: string
  title: string
}

export function FeatureHeader({
  actionLabel,
  eyebrow,
  onBrandPress,
  onAction,
  reserveNavigationSpace = true,
  showBrand = false,
  subtitle,
  title,
}: FeatureHeaderProps) {
  const { themed } = useAppTheme()
  const showsUtilityRow = showBrand || reserveNavigationSpace || Boolean(actionLabel && onAction)

  return (
    <View style={themed($container)}>
      {showsUtilityRow ? (
        <View style={[themed($utilityRow), $developmentActionClearance]}>
          {showBrand ? (
            <BrandMark onPress={onBrandPress} />
          ) : reserveNavigationSpace ? (
            <View style={$leadingClearance} />
          ) : null}
          {actionLabel && onAction ? (
            <Pressable
              accessibilityRole="button"
              hitSlop={8}
              onPress={onAction}
              style={({ pressed }) => [themed($action), pressed && $pressed]}
            >
              <Text preset="label" style={themed($actionText)} text={actionLabel} />
            </Pressable>
          ) : null}
        </View>
      ) : null}
      <View style={themed($copy)}>
        {eyebrow ? <Text preset="eyebrow" style={themed($eyebrow)} text={eyebrow} /> : null}
        <Text preset="title" text={title} />
        {subtitle ? <Text style={themed($subtitle)} text={subtitle} /> : null}
      </View>
    </View>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({ gap: spacing.lg })
const $utilityRow: ThemedStyle<ViewStyle> = () => ({
  minHeight: 44,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
})
const $copy: ThemedStyle<ViewStyle> = ({ spacing }) => ({ gap: spacing.xs })
const $eyebrow: ThemedStyle<TextStyle> = ({ colors }) => ({ color: colors.tint })
const $subtitle: ThemedStyle<TextStyle> = ({ colors }) => ({ color: colors.textDim, maxWidth: 620 })
const $leadingClearance: ViewStyle = { width: 44, height: 44 }
const $action: ThemedStyle<ViewStyle> = ({ radii, spacing }) => ({
  minHeight: 44,
  justifyContent: "center",
  paddingHorizontal: spacing.sm,
  borderRadius: radii.md,
})
const $actionText: ThemedStyle<TextStyle> = ({ colors }) => ({ color: colors.tint })
const $pressed: ViewStyle = { opacity: 0.68 }
const $developmentActionClearance: ViewStyle =
  __DEV__ && Platform.OS !== "web" ? { paddingEnd: 68 } : {}
