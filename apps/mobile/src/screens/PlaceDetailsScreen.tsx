import { useCallback, useMemo } from "react"
import type { TextStyle, ViewStyle } from "react-native"
import { RefreshControl, View } from "react-native"
import { Href, router } from "expo-router"

import { contextualToolbarContentClearance } from "@/components/navigation/ContextualToolbar.types"
import { ContentState } from "@/components/organizer/ContentState"
import { FeatureHeader } from "@/components/organizer/FeatureHeader"
import { ItemCard } from "@/components/organizer/ItemCard"
import { ListScreen } from "@/components/organizer/ListScreen"
import { PlaceCard } from "@/components/organizer/PlaceCard"
import { Text } from "@/components/Text"
import { useFocusedApiResource } from "@/hooks/useFocusedApiResource"
import { getPlace } from "@/services/api"
import type { Item, PlaceSummary } from "@/services/api/types"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

interface PlaceDetailsScreenProps {
  placeId: string
}

type PlaceContent =
  | { key: string; kind: "section"; title: string }
  | { key: string; kind: "place"; place: PlaceSummary }
  | { key: string; kind: "item"; item: Item }

export function PlaceDetailsScreen({ placeId }: PlaceDetailsScreenProps) {
  const {
    theme: { colors },
    themed,
  } = useAppTheme()
  const load = useCallback(() => getPlace(placeId), [placeId])
  const resource = useFocusedApiResource(load)
  const place = resource.data
  const contents = useMemo<PlaceContent[]>(() => {
    if (!place) return []
    const entries: PlaceContent[] = []

    if (place.children.length > 0) {
      entries.push({ key: "section:places", kind: "section", title: "Places inside" })
      entries.push(
        ...place.children.map((child) => ({
          key: `place:${child.id}`,
          kind: "place" as const,
          place: child,
        })),
      )
    }

    if (place.items.length > 0) {
      entries.push({ key: "section:items", kind: "section", title: "Gear in this Place" })
      entries.push(
        ...place.items.map((item) => ({ key: `item:${item.id}`, kind: "item" as const, item })),
      )
    }

    return entries
  }, [place])

  return (
    <ListScreen
      data={contents}
      keyExtractor={(entry) => entry.key}
      scrollEnabled={!place || contents.length > 0}
      contentContainerStyle={themed($content)}
      ListHeaderComponent={
        place ? (
          <View style={themed($header)}>
            <FeatureHeader
              eyebrow={contents.length === 0 ? place.name : "Place"}
              reserveNavigationSpace={false}
              title={contents.length === 0 ? "Ready for something" : place.name}
              subtitle={
                contents.length === 0
                  ? "Add a child Place or put your first Item here."
                  : (place.description ?? "A container in your visual gear map.")
              }
            />
            {place.ancestry.length > 0 ? (
              <Breadcrumb ancestry={place.ancestry} current={place.name} />
            ) : null}
            {resource.error ? (
              <ContentState
                title="Refresh failed"
                description={resource.error}
                actionLabel="Try again"
                onAction={resource.retry}
              />
            ) : null}
          </View>
        ) : null
      }
      ListEmptyComponent={
        place ? null : resource.loading ? (
          <ContentState loading title="Opening Place" description="Loading its direct contents…" />
        ) : (
          <ContentState
            title="This Place is unavailable"
            description={resource.error ?? "The Place could not be found."}
            actionLabel="Try again"
            onAction={resource.retry}
          />
        )
      }
      refreshControl={
        <RefreshControl
          refreshing={resource.refreshing}
          onRefresh={resource.refresh}
          tintColor={colors.tint}
          colors={[colors.tint]}
        />
      }
      renderItem={({ item: entry, index }) => {
        if (entry.kind === "section") {
          return <Text preset="section" style={themed($section)} text={entry.title} />
        }
        if (entry.kind === "place") {
          return (
            <PlaceCard
              index={index}
              place={entry.place}
              onPress={() => router.push(`/places/${entry.place.id}` as Href)}
            />
          )
        }
        if (entry.kind === "item") {
          return (
            <ItemCard
              index={index}
              item={entry.item}
              onPress={() => router.push(`/places/item/${entry.item.id}` as Href)}
            />
          )
        }
        return null
      }}
      bounces={contents.length > 0}
      showsVerticalScrollIndicator={false}
    />
  )
}

function Breadcrumb({
  ancestry,
  current,
}: {
  ancestry: { id: string; name: string }[]
  current: string
}) {
  const { themed } = useAppTheme()
  const visible = ancestry.slice(-2).map((place) => place.name)
  const omitted = ancestry.length > visible.length
  const label = [...(omitted ? ["…"] : []), ...visible, current].join("  /  ")

  return (
    <View
      accessible
      accessibilityLabel={`Location: ${[...ancestry.map((item) => item.name), current].join(", then ")}`}
    >
      <Text preset="caption" numberOfLines={1} style={themed($breadcrumb)} text={label} />
    </View>
  )
}

const $content: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  paddingBottom: contextualToolbarContentClearance,
  gap: spacing.sm,
})
const $header: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.lg,
  marginBottom: spacing.md,
})
const $section: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginTop: spacing.md,
  marginBottom: spacing.xxs,
})
const $breadcrumb: ThemedStyle<TextStyle> = ({ colors }) => ({ color: colors.textDim })
