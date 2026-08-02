import { Href, router, useLocalSearchParams } from "expo-router"

import { ContextualToolbar } from "@/components/navigation/ContextualToolbar"
import { FloatingBackButton } from "@/components/navigation/FloatingBackButton"
import { PlaceDetailsScreen } from "@/screens/PlaceDetailsScreen"

export default function PlaceDetailsRoute() {
  const { placeId } = useLocalSearchParams<{ placeId: string }>()
  const id = first(placeId)

  return (
    <>
      <FloatingBackButton />
      <PlaceDetailsScreen placeId={id} />
      <ContextualToolbar
        actions={[
          {
            accessibilityLabel: "Add to this Place",
            fallback: "+",
            icon: { ios: "plus", android: "add", web: "add" },
            onPress: () => router.push(`/places/add?placeId=${id}` as Href),
          },
          {
            accessibilityLabel: "Edit this Place",
            fallback: "E",
            icon: { ios: "pencil", android: "edit", web: "edit" },
            onPress: () => router.push(`/places/place-form?placeId=${id}` as Href),
          },
        ]}
      />
    </>
  )
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : (value ?? "")
}
