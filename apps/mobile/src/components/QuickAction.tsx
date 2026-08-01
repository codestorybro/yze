import { Pressable, PressableProps, TextStyle, View, ViewStyle } from "react-native"
import { SymbolView, type SymbolViewProps } from "expo-symbols"

import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

interface QuickActionProps {
  accessibilityHint: string
  emphasized?: boolean
  fallback: string
  icon: SymbolViewProps["name"]
  label: string
  onPress: NonNullable<PressableProps["onPress"]>
}

/** A compact, platform-symbol-based command used below the primary product hero. */
export function QuickAction({
  accessibilityHint,
  emphasized = false,
  fallback,
  icon,
  label,
  onPress,
}: QuickActionProps) {
  const {
    theme: { colors },
    themed,
  } = useAppTheme()

  return (
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityLabel={label}
      accessibilityRole="button"
      hitSlop={4}
      onPress={onPress}
      style={({ pressed }) => [themed($action), pressed && $pressed]}
    >
      <View style={themed(emphasized ? $emphasizedIconFrame : $iconFrame)}>
        <SymbolView
          fallback={
            <Text
              preset="section"
              style={themed(emphasized ? $emphasizedFallback : $fallback)}
              text={fallback}
            />
          }
          name={icon}
          size={23}
          tintColor={emphasized ? colors.onSignal : colors.text}
          type="monochrome"
        />
      </View>
      <Text numberOfLines={2} preset="label" style={$label} text={label} />
    </Pressable>
  )
}

const $action: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  minHeight: 90,
  alignItems: "center",
  gap: spacing.xs,
})

const $iconFrame: ThemedStyle<ViewStyle> = ({ colors, radii }) => ({
  width: 56,
  height: 56,
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 1,
  borderColor: colors.controlBorder,
  borderRadius: radii.pill,
  backgroundColor: colors.surfaceRaised,
})

const $emphasizedIconFrame: ThemedStyle<ViewStyle> = ({ colors, radii }) => ({
  width: 56,
  height: 56,
  alignItems: "center",
  justifyContent: "center",
  borderRadius: radii.pill,
  backgroundColor: colors.signal,
})

const $fallback: ThemedStyle<TextStyle> = ({ colors }) => ({ color: colors.text })

const $emphasizedFallback: ThemedStyle<TextStyle> = ({ colors }) => ({ color: colors.onSignal })

const $label: TextStyle = {
  maxWidth: 88,
  textAlign: "center",
}

const $pressed: ViewStyle = {
  opacity: 0.72,
  transform: [{ scale: 0.98 }],
}
