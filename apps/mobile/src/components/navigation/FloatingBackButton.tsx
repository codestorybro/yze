import type { ViewStyle } from "react-native"
import { Pressable } from "react-native"
import { router, Stack } from "expo-router"
import { SymbolView } from "expo-symbols"

import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

/** Android fallback for the fixed native-header Back control. */
export function FloatingBackButton() {
  const {
    theme: { colors },
    themed,
  } = useAppTheme()

  return (
    <Stack.Toolbar asChild placement="left">
      <Pressable
        accessibilityLabel="Back"
        accessibilityRole="button"
        hitSlop={8}
        onPress={() => router.back()}
        style={({ pressed }) => [themed($button), pressed && $pressed]}
      >
        <SymbolView
          name={{ ios: "chevron.backward", android: "arrow_back", web: "arrow_back" }}
          size={22}
          tintColor={colors.text}
          type="monochrome"
        />
      </Pressable>
    </Stack.Toolbar>
  )
}

const $button: ThemedStyle<ViewStyle> = ({ colors, radii }) => ({
  width: 44,
  height: 44,
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: radii.pill,
  backgroundColor: colors.surfaceRaised,
  elevation: 3,
})
const $pressed: ViewStyle = { opacity: 0.68, transform: [{ scale: 0.96 }] }
