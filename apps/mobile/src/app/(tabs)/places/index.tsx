import { Href, router } from "expo-router"

import { ContextualToolbar } from "@/components/navigation/ContextualToolbar"
import { FloatingBackButton } from "@/components/navigation/FloatingBackButton"
import { PlacesScreen } from "@/screens/PlacesScreen"

export default function Places() {
  return (
    <>
      <FloatingBackButton
        accessibilityLabel="Back to Home"
        onPress={() => router.dismissTo("/" as Href)}
      />
      <PlacesScreen />
      <ContextualToolbar
        actions={[
          {
            accessibilityLabel: "Add Place",
            fallback: "+",
            icon: { ios: "plus", android: "add", web: "add" },
            onPress: () => router.push("/places/place-form" as Href),
          },
          {
            accessibilityLabel: "Choose a Place to edit",
            fallback: "E",
            icon: { ios: "pencil", android: "edit", web: "edit" },
            onPress: () => router.push("/places/place-picker?mode=manage" as Href),
          },
        ]}
      />
    </>
  )
}
