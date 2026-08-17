import { Fragment } from "react"
import type { TextStyle, ViewStyle } from "react-native"
import { Platform, Pressable, View } from "react-native"
import { Stack } from "expo-router"
import { SymbolView } from "expo-symbols"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

import type { ContextualToolbarAction, ContextualToolbarProps } from "./ContextualToolbar.types"
import { useNativeTabAccessory } from "./useNativeTabAccessory"

/** iOS 26 uses the native tab accessory; older iOS receives a quiet trailing fallback dock. */
export function ContextualToolbar({ actions }: ContextualToolbarProps) {
  const nativeTabs = useNativeTabAccessory(actions)
  const insets = useSafeAreaInsets()
  const {
    theme: { spacing },
  } = useAppTheme()
  if (actions.length === 0) return null

  if (nativeTabs && iosMajorVersion() >= 26) return null

  if (nativeTabs) {
    return (
      <View
        pointerEvents="box-none"
        style={[$floatingHost, { bottom: insets.bottom + spacing.sm }]}
      >
        <ToolbarDock actions={actions} />
      </View>
    )
  }

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

function ToolbarDock({ actions }: { actions: ContextualToolbarAction[] }) {
  const { themed } = useAppTheme()
  return (
    <View style={themed($dock)}>
      {actions.map((action) => (
        <ToolbarButton action={action} key={action.accessibilityLabel} />
      ))}
    </View>
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

function iosMajorVersion() {
  return Number.parseInt(String(Platform.Version).split(".")[0] ?? "0", 10)
}

export type { ContextualToolbarAction }

const $floatingHost: ViewStyle = {
  position: "absolute",
  zIndex: 100,
  right: 24,
  alignItems: "flex-end",
}
const $dock: ThemedStyle<ViewStyle> = ({ colors, radii, spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xs,
  padding: spacing.xs,
  borderWidth: 1,
  borderColor: colors.controlBorder,
  borderRadius: radii.pill,
  backgroundColor: colors.surfaceRaised,
  shadowColor: colors.overlay50,
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.14,
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
