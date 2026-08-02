import { router, Stack } from "expo-router"

/** Native UIBarButtonItem; iOS 26 supplies Liquid Glass and older iOS supplies UIKit material. */
export function FloatingBackButton() {
  return (
    <Stack.Toolbar placement="left">
      <Stack.Toolbar.Button
        accessibilityLabel="Back"
        icon="chevron.backward"
        onPress={() => router.back()}
        separateBackground
      />
    </Stack.Toolbar>
  )
}
