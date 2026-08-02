import { Href, router } from "expo-router"

import { ContextualToolbar } from "@/components/navigation/ContextualToolbar"
import { PlacesScreen } from "@/screens/PlacesScreen"

export default function Places() {
  return (
    <>
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
            accessibilityLabel: "Manage Places",
            fallback: "M",
            icon: { ios: "slider.horizontal.3", android: "tune", web: "tune" },
            onPress: () => router.push("/places/place-picker?mode=manage" as Href),
          },
        ]}
      />
    </>
  )
}
