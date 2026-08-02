import { router, Stack } from "expo-router"

import type { FloatingBackButtonProps } from "./FloatingBackButton.types"

/** Native UIBarButtonItem; iOS 26 supplies Liquid Glass and older iOS supplies UIKit material. */
export function FloatingBackButton({
  accessibilityLabel = "Back",
  onPress = () => router.back(),
}: FloatingBackButtonProps) {
  return (
    <Stack.Toolbar placement="left">
      <Stack.Toolbar.Button
        accessibilityLabel={accessibilityLabel}
        icon="chevron.backward"
        onPress={onPress}
        separateBackground
      />
    </Stack.Toolbar>
  )
}
