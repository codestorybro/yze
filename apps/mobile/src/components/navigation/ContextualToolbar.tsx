import { Fragment } from "react"
import type { TextStyle, ViewStyle } from "react-native"
import { Pressable } from "react-native"
import { Stack } from "expo-router"
import { SymbolView } from "expo-symbols"

import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

import type { ContextualToolbarAction, ContextualToolbarProps } from "./ContextualToolbar.types"

/** Native Stack toolbar: Liquid Glass on iOS 26 and a system toolbar elsewhere. */
export function ContextualToolbar({ actions }: ContextualToolbarProps) {
  if (actions.length === 0) return null

  return (
    <Stack.Toolbar placement="bottom">
      {actions.map((action, index) => (
        <Fragment key={action.accessibilityLabel}>
          {index > 0 ? <Stack.Toolbar.Spacer width={18} /> : null}
          <Stack.Toolbar.View>
            <ToolbarButton action={action} />
          </Stack.Toolbar.View>
        </Fragment>
      ))}
    </Stack.Toolbar>
  )
}

function ToolbarButton({ action }: { action: ContextualToolbarAction }) {
  const {
    theme: { colors },
    themed,
  } = useAppTheme()

  return (
    <Pressable
      accessibilityLabel={action.accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled: action.disabled }}
      disabled={action.disabled}
      hitSlop={6}
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
  )
}

export type { ContextualToolbarAction }

const $button: ThemedStyle<ViewStyle> = () => ({
  width: 48,
  height: 44,
  alignItems: "center",
  justifyContent: "center",
})
const $fallback: ThemedStyle<TextStyle> = ({ colors }) => ({ color: colors.text })
const $destructive: ThemedStyle<TextStyle> = ({ colors }) => ({ color: colors.error })
const $pressed: ViewStyle = { opacity: 0.6, transform: [{ scale: 0.96 }] }
