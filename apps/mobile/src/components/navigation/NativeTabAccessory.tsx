import type { TextStyle, ViewStyle } from "react-native"
import { Pressable, View } from "react-native"
import { NativeTabs } from "expo-router/unstable-native-tabs"
import { SymbolView } from "expo-symbols"

import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

import type { ContextualToolbarAction } from "./ContextualToolbar.types"

export function NativeTabAccessory({ actions }: { actions: ContextualToolbarAction[] }) {
  const placement = NativeTabs.BottomAccessory.usePlacement()
  const {
    theme: { colors },
    themed,
  } = useAppTheme()

  return (
    <View style={[themed($accessory), placement === "inline" && themed($inlineAccessory)]}>
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
            size={23}
            tintColor={action.destructive ? colors.error : colors.text}
            type="monochrome"
          />
        </Pressable>
      ))}
    </View>
  )
}

const $accessory: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  minHeight: 56,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: spacing.xs,
  paddingHorizontal: spacing.md,
})
const $inlineAccessory: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  minHeight: 44,
  paddingHorizontal: spacing.xs,
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
const $pressed: ViewStyle = { opacity: 0.62, transform: [{ scale: 0.96 }] }
