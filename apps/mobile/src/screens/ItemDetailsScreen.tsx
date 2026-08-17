import { useCallback } from "react"
import type { TextStyle, ViewStyle } from "react-native"
import { Linking, View } from "react-native"
import { Href, router } from "expo-router"

import { Button } from "@/components/Button"
import { contextualToolbarContentClearance } from "@/components/navigation/ContextualToolbar.types"
import { ContentState } from "@/components/organizer/ContentState"
import { FeatureHeader } from "@/components/organizer/FeatureHeader"
import { ItemIcon } from "@/components/organizer/ItemIcon"
import { RemotePhoto } from "@/components/organizer/RemotePhoto"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { useFocusedApiResource } from "@/hooks/useFocusedApiResource"
import { getItem, getPlace } from "@/services/api"
import type { ApiResult, Item, PlaceDetails } from "@/services/api/types"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

interface ItemDetailsScreenProps {
  itemId: string
}

interface ItemContext {
  item: Item
  place: PlaceDetails
}

export function ItemDetailsScreen({ itemId }: ItemDetailsScreenProps) {
  const { themed } = useAppTheme()
  const load = useCallback(async (): Promise<ApiResult<ItemContext>> => {
    const itemResult = await getItem(itemId)
    if (itemResult.kind !== "ok") return itemResult
    const placeResult = await getPlace(itemResult.data.placeId)
    if (placeResult.kind !== "ok") return placeResult
    return { kind: "ok", data: { item: itemResult.data, place: placeResult.data } }
  }, [itemId])
  const resource = useFocusedApiResource(load)
  const context = resource.data

  if (!context) {
    return (
      <Screen preset="fixed" contentContainerStyle={themed($state)}>
        <ContentState
          loading={resource.loading}
          title={resource.loading ? "Finding your Item" : "This Item is unavailable"}
          description={resource.error ?? "Loading its current Place and details…"}
          actionLabel={resource.loading ? undefined : "Try again"}
          onAction={resource.loading ? undefined : resource.retry}
        />
      </Screen>
    )
  }

  const { item, place } = context
  const identification = compact([
    pair("Brand", item.brand),
    pair("Model", item.model),
    pair("Serial number", item.serialNumber),
    pair("Category", item.category),
    pair("Production date", item.productionDate),
  ])
  const ownership = compact([
    pair("Purchase date", item.purchaseDate),
    pair(
      "Purchase price",
      item.purchasePrice === null
        ? null
        : `${item.purchasePrice.toLocaleString()}${item.purchaseCurrency ? ` ${item.purchaseCurrency}` : ""}`,
    ),
    pair("Warranty until", item.warrantyUntil),
    pair("Quantity", item.quantity.toString()),
  ])

  return (
    <Screen
      preset="scroll"
      ScrollViewProps={{ showsVerticalScrollIndicator: false }}
      contentContainerStyle={themed($screen)}
    >
      <View style={themed($page)}>
        <FeatureHeader
          eyebrow="Item"
          reserveNavigationSpace={false}
          title={item.name}
          subtitle={
            [item.brand, item.model].filter(Boolean).join(" · ") || "A physical object in your map."
          }
        />

        <RemotePhoto
          accessibilityLabel={`Photo of ${item.name}`}
          fallback={
            <View style={themed($heroFallback)}>
              <ItemIcon iconKey={item.iconKey} size={54} />
            </View>
          }
          style={themed($hero)}
          url={item.photoUrl}
        />

        <View style={themed($placeCard)}>
          <View style={$flex}>
            <Text
              preset="eyebrow"
              style={themed($muted)}
              text={place.isRoot ? "Organizer root" : "Current Place"}
            />
            <Text preset="section" text={place.name} />
          </View>
          <Button
            preset="ghost"
            onPress={() => router.push((place.isRoot ? "/places" : `/places/${place.id}`) as Href)}
            text={place.isRoot ? "Open map" : "Open"}
          />
        </View>

        {identification.length > 0 ? (
          <MetadataSection title="Identification" rows={identification} />
        ) : null}
        {ownership.length > 0 ? <MetadataSection title="Ownership" rows={ownership} /> : null}

        {item.tags.length > 0 || item.notes ? (
          <View style={themed($section)}>
            <Text preset="section" text="Notes and organization" />
            {item.tags.length > 0 ? (
              <View style={themed($tags)}>
                {item.tags.map((tag) => (
                  <View key={tag} style={themed($tag)}>
                    <Text preset="caption" text={tag} />
                  </View>
                ))}
              </View>
            ) : null}
            {item.notes ? <Text text={item.notes} /> : null}
          </View>
        ) : null}

        {item.productUrl ? (
          <Button
            preset="secondary"
            onPress={() => void Linking.openURL(item.productUrl!)}
            text="Open product page"
          />
        ) : null}
      </View>
    </Screen>
  )
}

function MetadataSection({ rows, title }: { rows: [string, string][]; title: string }) {
  const { themed } = useAppTheme()
  return (
    <View style={themed($section)}>
      <Text preset="section" text={title} />
      <View style={themed($metadata)}>
        {rows.map(([label, value]) => (
          <View key={label} style={themed($metadataRow)}>
            <Text preset="label" style={themed($muted)} text={label} />
            <Text style={$metadataValue} text={value} />
          </View>
        ))}
      </View>
    </View>
  )
}

function pair(label: string, value?: string | null): [string, string] | null {
  return value ? [label, value] : null
}

function compact(values: ([string, string] | null)[]): [string, string][] {
  return values.filter((value): value is [string, string] => value !== null)
}

const $screen: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  paddingHorizontal: spacing.lg,
  paddingBottom: contextualToolbarContentClearance,
})
const $page: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  width: "100%",
  maxWidth: 720,
  gap: spacing.xl,
})
const $hero: ThemedStyle<ViewStyle> = ({ colors, radii }) => ({
  width: "100%",
  aspectRatio: 1.35,
  overflow: "hidden",
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: radii.xl,
})
const $heroFallback: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.tintSubtle,
})
const $placeCard: ThemedStyle<ViewStyle> = ({ colors, radii, spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.md,
  padding: spacing.md,
  borderRadius: radii.md,
  backgroundColor: colors.surface,
})
const $section: ThemedStyle<ViewStyle> = ({ spacing }) => ({ gap: spacing.md })
const $metadata: ThemedStyle<ViewStyle> = ({ colors, radii }) => ({
  overflow: "hidden",
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: radii.md,
  backgroundColor: colors.surface,
})
const $metadataRow: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  minHeight: 52,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: spacing.md,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  borderBottomWidth: 1,
  borderBottomColor: colors.separator,
})
const $metadataValue: TextStyle = { flex: 1, textAlign: "right" }
const $tags: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  flexWrap: "wrap",
  gap: spacing.xs,
})
const $tag: ThemedStyle<ViewStyle> = ({ colors, radii, spacing }) => ({
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xxs,
  borderRadius: radii.pill,
  backgroundColor: colors.surfaceMuted,
})
const $state: ThemedStyle<ViewStyle> = () => ({ flex: 1 })
const $muted: ThemedStyle<TextStyle> = ({ colors }) => ({ color: colors.textDim })
const $flex: ViewStyle = { flex: 1 }
