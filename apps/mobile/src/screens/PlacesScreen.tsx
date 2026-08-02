import { useCallback } from "react"
import type { ViewStyle } from "react-native"
import { RefreshControl, View } from "react-native"
import { Href, router } from "expo-router"

import { contextualToolbarContentClearance } from "@/components/navigation/ContextualToolbar.types"
import { ContentState } from "@/components/organizer/ContentState"
import { FeatureHeader } from "@/components/organizer/FeatureHeader"
import { ListScreen } from "@/components/organizer/ListScreen"
import { PlaceCard } from "@/components/organizer/PlaceCard"
import { useFocusedApiResource } from "@/hooks/useFocusedApiResource"
import { getRootPlaces } from "@/services/api"
import type { PlaceSummary } from "@/services/api/types"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

export function PlacesScreen() {
  const {
    theme: { colors },
    themed,
  } = useAppTheme()
  const load = useCallback(() => getRootPlaces(), [])
  const resource = useFocusedApiResource(load)
  const places = resource.data ?? []
  const confirmedEmpty = !resource.loading && !resource.error && places.length === 0

  return (
    <ListScreen
      data={places}
      numColumns={2}
      keyExtractor={(place) => place.id}
      columnWrapperStyle={themed($columns)}
      contentContainerStyle={themed($content)}
      ListHeaderComponent={
        <View style={themed($header)}>
          <FeatureHeader
            eyebrow={confirmedEmpty ? "Your visual map" : "Visual map"}
            onBrandPress={() => router.navigate("/" as Href)}
            showBrand
            title={confirmedEmpty ? "Start with one real place" : "Places"}
            subtitle={
              confirmedEmpty
                ? "Add a room, drawer, case, shelf, or backpack. You decide whether the map stays flat or grows into a hierarchy."
                : "Rooms, shelves, cases, and backpacks become a map you can move through."
            }
          />
          {resource.error && places.length > 0 ? (
            <ContentState
              title="Refresh failed"
              description={resource.error}
              actionLabel="Try again"
              onAction={resource.retry}
            />
          ) : null}
        </View>
      }
      ListEmptyComponent={
        resource.loading ? (
          <ContentState loading title="Opening your map" description="Loading your Places…" />
        ) : resource.error ? (
          <ContentState
            title="Your map is unavailable"
            description={resource.error}
            actionLabel="Try again"
            onAction={resource.retry}
          />
        ) : null
      }
      refreshControl={
        <RefreshControl
          refreshing={resource.refreshing}
          onRefresh={resource.refresh}
          tintColor={colors.tint}
          colors={[colors.tint]}
        />
      }
      renderItem={({ item, index }) => (
        <PlaceCard index={index} place={item} onPress={() => openPlace(item)} />
      )}
      showsVerticalScrollIndicator={false}
    />
  )
}

function openPlace(place: PlaceSummary) {
  router.push(`/places/${place.id}` as Href)
}

const $content: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  paddingBottom: contextualToolbarContentClearance,
  gap: spacing.md,
})
const $columns: ThemedStyle<ViewStyle> = ({ spacing }) => ({ gap: spacing.md })
const $header: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.lg,
  marginBottom: spacing.sm,
})
