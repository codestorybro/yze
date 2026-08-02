import type { TextStyle, ViewStyle } from "react-native"
import { Pressable, View } from "react-native"
import { SymbolView } from "expo-symbols"

import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

import type { ContextualToolbarProps } from "./ContextualToolbar.types"

/** Web has no native Stack toolbar, so it receives the same semantic actions in a compact dock. */
export function ContextualToolbar({ actions }: ContextualToolbarProps) {
  const {
    theme: { colors },
    themed,
  } = useAppTheme()

  if (actions.length === 0) return null

  return (
    <View pointerEvents="box-none" style={themed($host)}>
      <View style={themed($toolbar)}>
        {actions.map((action) => (
          <Pressable
            accessibilityLabel={action.accessibilityLabel}
            accessibilityRole="button"
            accessibilityState={{ disabled: action.disabled }}
            disabled={action.disabled}
            key={action.accessibilityLabel}
            onPress={action.onPress}
            style={({ pressed }) => [themed($button), pressed && $pressed]}
          >
            <SymbolView
              fallback={
                <Text
                  preset="label"
                  style={themed(action.destructive ? $destructive : $fallback)}
                  text={action.fallback}
                />
              }
              name={action.icon}
              size={24}
              tintColor={action.destructive ? colors.error : colors.text}
              type="monochrome"
            />
          </Pressable>
        ))}
      </View>
    </View>
  )
}

export type { ContextualToolbarAction } from "./ContextualToolbar.types"

const $host: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  position: "absolute",
  zIndex: 100,
  right: 0,
  bottom: spacing.lg,
  left: 0,
  alignItems: "center",
})
const $toolbar: ThemedStyle<ViewStyle> = ({ colors, radii, spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.sm,
  padding: spacing.xs,
  borderWidth: 1,
  borderColor: colors.controlBorder,
  borderRadius: radii.pill,
  backgroundColor: colors.surfaceRaised,
  shadowColor: colors.overlay50,
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.16,
  shadowRadius: 18,
})
const $button: ThemedStyle<ViewStyle> = ({ radii }) => ({
  width: 48,
  height: 44,
  alignItems: "center",
  justifyContent: "center",
  borderRadius: radii.pill,
})
const $fallback: ThemedStyle<TextStyle> = ({ colors }) => ({ color: colors.text })
const $destructive: ThemedStyle<TextStyle> = ({ colors }) => ({ color: colors.error })
const $pressed: ViewStyle = { opacity: 0.6, transform: [{ scale: 0.96 }] }
