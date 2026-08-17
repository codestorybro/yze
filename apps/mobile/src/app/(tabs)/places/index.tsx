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
            accessibilityLabel: "Add Place or Item",
            fallback: "+",
            icon: { ios: "plus", android: "add", web: "add" },
            onPress: () => router.push("/places/add?root=true" as Href),
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
