import { useEffect, useState } from "react"
import type { TextStyle, ViewStyle } from "react-native"
import { View } from "react-native"
import { Href, router } from "expo-router"

import { SheetScrollView } from "@/components/navigation/SheetContent"
import { FeatureHeader } from "@/components/organizer/FeatureHeader"
import { QuickAction } from "@/components/QuickAction"
import { Text } from "@/components/Text"
import { getOrganizerTree, getPlace } from "@/services/api"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

interface AddContentScreenProps {
  placeId?: string
  placeName?: string
  root?: boolean
}

export function AddContentScreen({ placeId, placeName, root = false }: AddContentScreenProps) {
  const { themed } = useAppTheme()
  const [resolvedId, setResolvedId] = useState(placeId ?? "")
  const [resolvedName, setResolvedName] = useState(placeName ?? (root ? "All gear" : ""))
  const [loadError, setLoadError] = useState<string | null>(null)
  const destinationName = resolvedName || (root ? "All gear" : "This Place")
  const context = `parentPlaceId=${resolvedId}&parentPlaceName=${encodeURIComponent(destinationName)}`

  useEffect(() => {
    if (root) {
      let active = true
      void getOrganizerTree().then((result) => {
        if (!active) return
        if (result.kind === "ok") {
          setResolvedId(result.data.root.id)
          setResolvedName(result.data.root.name)
        } else {
          setLoadError("The organizer root could not be loaded. Try reopening this sheet.")
        }
      })
      return () => {
        active = false
      }
    }

    if (placeName || !placeId) return
    let active = true
    void getPlace(placeId).then((result) => {
      if (active && result.kind === "ok") setResolvedName(result.data.name)
    })
    return () => {
      active = false
    }
  }, [placeId, placeName, root])

  return (
    <SheetScrollView showsVerticalScrollIndicator={false} contentContainerStyle={themed($screen)}>
      <View style={themed($page)}>
        <FeatureHeader
          eyebrow="Add content"
          reserveNavigationSpace={false}
          title={destinationName}
          subtitle="Choose what belongs here. The current destination is already selected."
        />
        <View style={themed($choices)}>
          <QuickAction
            accessibilityHint="Creates a nested Place"
            emphasized
            fallback="P"
            icon={{ ios: "archivebox", android: "inventory_2", web: "inventory_2" }}
            label="Add Place"
            onPress={() =>
              router.replace((root ? "/places/place-form" : `/places/place-form?${context}`) as Href)
            }
          />
          <QuickAction
            accessibilityHint="Creates an Item in this Place"
            disabled={!resolvedId}
            fallback="I"
            icon={{ ios: "cable.connector", android: "devices_other", web: "devices_other" }}
            label="Add Item"
            onPress={() =>
              router.replace(
                `/places/item-form?placeId=${resolvedId}&placeName=${encodeURIComponent(destinationName)}` as Href,
              )
            }
          />
          <QuickAction
            accessibilityHint="Moves an existing Place into this Place"
            disabled={!resolvedId}
            fallback="E"
            icon={{ ios: "arrow.down.to.line", android: "move_down", web: "move_down" }}
            label="Use existing Place"
            onPress={() =>
              router.replace(
                `/places/place-picker?mode=attach&destinationPlaceId=${resolvedId}&destinationPlaceName=${encodeURIComponent(destinationName)}` as Href,
              )
            }
          />
        </View>
        {loadError ? (
          <Text accessibilityLiveRegion="assertive" style={themed($error)} text={loadError} />
        ) : null}
      </View>
    </SheetScrollView>
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
const $error: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.error,
})
