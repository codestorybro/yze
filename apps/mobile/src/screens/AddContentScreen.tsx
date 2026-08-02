import { useEffect, useState } from "react"
import type { ViewStyle } from "react-native"
import { View } from "react-native"
import { Href, router } from "expo-router"

import { FeatureHeader } from "@/components/organizer/FeatureHeader"
import { QuickAction } from "@/components/QuickAction"
import { Screen } from "@/components/Screen"
import { getPlace } from "@/services/api"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

interface AddContentScreenProps {
  placeId: string
  placeName: string
}

export function AddContentScreen({ placeId, placeName }: AddContentScreenProps) {
  const { themed } = useAppTheme()
  const [resolvedName, setResolvedName] = useState(placeName)
  const destinationName = resolvedName || "This Place"
  const context = `parentPlaceId=${placeId}&parentPlaceName=${encodeURIComponent(destinationName)}`

  useEffect(() => {
    if (placeName || !placeId) return
    let active = true
    void getPlace(placeId).then((result) => {
      if (active && result.kind === "ok") setResolvedName(result.data.name)
    })
    return () => {
      active = false
    }
  }, [placeId, placeName])

  return (
    <Screen
      preset="scroll"
      safeAreaEdges={["bottom"]}
      ScrollViewProps={{ showsVerticalScrollIndicator: false }}
      contentContainerStyle={themed($screen)}
    >
      <View style={themed($page)}>
        <FeatureHeader
          eyebrow="Add content"
          reserveNavigationSpace={false}
          title={destinationName}
          subtitle="Choose what you are placing here. The current destination is already selected."
        />
        <View style={themed($choices)}>
          <QuickAction
            accessibilityHint="Creates a nested Place"
            emphasized
            fallback="P"
            icon={{ ios: "archivebox", android: "inventory_2", web: "inventory_2" }}
            label="Add Place"
            onPress={() => router.replace(`/places/place-form?${context}` as Href)}
          />
          <QuickAction
            accessibilityHint="Creates an Item in this Place"
            fallback="I"
            icon={{ ios: "cable.connector", android: "devices_other", web: "devices_other" }}
            label="Add Item"
            onPress={() =>
              router.replace(
                `/places/item-form?placeId=${placeId}&placeName=${encodeURIComponent(destinationName)}` as Href,
              )
            }
          />
          <QuickAction
            accessibilityHint="Moves an existing Place into this Place"
            fallback="E"
            icon={{ ios: "arrow.down.to.line", android: "move_down", web: "move_down" }}
            label="Use existing Place"
            onPress={() =>
              router.replace(
                `/places/place-picker?mode=attach&destinationPlaceId=${placeId}&destinationPlaceName=${encodeURIComponent(destinationName)}` as Href,
              )
            }
          />
        </View>
      </View>
    </Screen>
  )
}

const $screen: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.lg,
})
const $page: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  width: "100%",
  maxWidth: 680,
  alignSelf: "center",
  gap: spacing.xxl,
})
const $choices: ThemedStyle<ViewStyle> = ({ colors, radii, spacing }) => ({
  flexDirection: "row",
  gap: spacing.lg,
  padding: spacing.lg,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: radii.lg,
  backgroundColor: colors.surface,
})
