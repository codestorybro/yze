import { useCallback, useState } from "react"
import type { TextStyle, ViewStyle } from "react-native"
import { RefreshControl, View } from "react-native"
import { Href, router } from "expo-router"

import { useToast } from "@/components/feedback/ToastProvider"
import { contextualToolbarWithTabsContentClearance } from "@/components/navigation/ContextualToolbar.types"
import { ContentState } from "@/components/organizer/ContentState"
import { FeatureHeader } from "@/components/organizer/FeatureHeader"
import { ListScreen } from "@/components/organizer/ListScreen"
import { OrganizerTreeView } from "@/components/organizer/OrganizerTreeView"
import { Text } from "@/components/Text"
import {
  moveTreeEntity,
  parentIdForTreeEntity,
  type OrganizerTreeEntity,
} from "@/features/organizer/organizerTree"
import { useFocusedApiResource } from "@/hooks/useFocusedApiResource"
import { getOrganizerTree, moveItem, movePlace } from "@/services/api"
import { apiFailureMessage } from "@/services/api/problemMessage"
import type { OrganizerTree } from "@/services/api/types"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { notifySuccess } from "@/utils/safeHaptics"

export function PlacesScreen() {
  const {
    theme: { colors },
    themed,
  } = useAppTheme()
  const { showToast } = useToast()
  const load = useCallback(() => getOrganizerTree(), [])
  const resource = useFocusedApiResource(load)
  const [optimisticTree, setOptimisticTree] = useState<{
    source: OrganizerTree
    value: OrganizerTree
  } | null>(null)
  const [movingId, setMovingId] = useState<string | null>(null)
  const tree =
    optimisticTree?.source === resource.data ? optimisticTree.value : (resource.data ?? null)

  const move = async (entity: OrganizerTreeEntity, destinationId: string) => {
    if (!tree || movingId) return
    const next = moveTreeEntity(tree, entity, destinationId)
    if (next === tree) return

    const source = optimisticTree?.source === resource.data ? optimisticTree.source : resource.data
    if (!source) return
    setOptimisticTree({ source, value: next })
    setMovingId(entity.id)
    const result =
      entity.kind === "place"
        ? await movePlace(entity.id, destinationId === tree.root.id ? null : destinationId)
        : await moveItem(entity.id, destinationId)
    setMovingId(null)

    if (result.kind === "ok") {
      const destination =
        destinationId === tree.root.id
          ? tree.root.name
          : (tree.places.find((place) => place.id === destinationId)?.name ?? "the new Place")
      showToast(`${entity.kind === "place" ? "Place" : "Item"} moved to ${destination}`)
      void notifySuccess()
      void resource.refresh()
      return
    }

    setOptimisticTree(null)
    showToast({ message: apiFailureMessage(result), tone: "error" })
  }

  const requestMove = (entity: OrganizerTreeEntity) => {
    if (!tree || entity.kind === "root") return
    const currentParentId = parentIdForTreeEntity(tree, entity)
    router.push(
      `/places/move?kind=${entity.kind}&entityId=${entity.id}&currentPlaceId=${currentParentId ?? ""}` as Href,
    )
  }

  if (!tree) {
    return (
      <ListScreen
        data={[]}
        contentContainerStyle={themed($loadingContent)}
        ListHeaderComponent={<TreeHeader empty={false} />}
        ListEmptyComponent={
          resource.loading ? (
            <ContentState loading title="Opening your map" description="Loading your gear tree…" />
          ) : (
            <ContentState
              title="Your map is unavailable"
              description={resource.error ?? "The organizer tree could not be loaded."}
              actionLabel="Try again"
              onAction={resource.retry}
            />
          )
        }
        renderItem={() => null}
        scrollEnabled={false}
      />
    )
  }

  const empty = tree.places.length === 0 && tree.items.length === 0

  return (
    <OrganizerTreeView
      tree={tree}
      draggingDisabled={Boolean(movingId)}
      contentContainerStyle={themed($content)}
      ListHeaderComponent={
        <View style={themed($header)}>
          <TreeHeader empty={empty} />
          <View style={themed($dragHint)}>
            <View style={themed($signalDot)} />
            <View style={$flex}>
              <Text preset="label" text="Hold · drag · drop" />
              <Text
                preset="caption"
                style={themed($muted)}
                text="Only valid destinations highlight. The root is permanent and can always receive content."
              />
            </View>
          </View>
          {resource.error ? (
            <ContentState
              title="Refresh failed"
              description={resource.error}
              actionLabel="Try again"
              onAction={resource.retry}
            />
          ) : null}
        </View>
      }
      onMove={(entity, destinationId) => void move(entity, destinationId)}
      onOpenItem={(id) => router.push(`/places/item/${id}` as Href)}
      onOpenPlace={(id) => router.push(`/places/${id}` as Href)}
      onRequestMove={requestMove}
      refreshControl={
        <RefreshControl
          refreshing={resource.refreshing}
          onRefresh={resource.refresh}
          tintColor={colors.tint}
          colors={[colors.tint]}
        />
      }
    />
  )
}

function TreeHeader({ empty }: { empty: boolean }) {
  return (
    <FeatureHeader
      eyebrow="Interactive gear map"
      reserveNavigationSpace={false}
      title={empty ? "Start with something real" : "Your gear tree"}
      subtitle={
        empty
          ? "Add a Place or an Item under the fixed root. Your structure can stay flat or grow naturally."
          : "Expand any branch. Long press an entry and drop it onto a Place to reorganize it."
      }
    />
  )
}

const $flex: ViewStyle = { flex: 1 }
const $content: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  paddingBottom: contextualToolbarWithTabsContentClearance,
})
const $loadingContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  paddingBottom: contextualToolbarWithTabsContentClearance,
  gap: spacing.xl,
})
const $header: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.lg,
  marginBottom: spacing.lg,
})
const $dragHint: ThemedStyle<ViewStyle> = ({ colors, radii, spacing }) => ({
  flexDirection: "row",
  alignItems: "flex-start",
  gap: spacing.sm,
  padding: spacing.md,
  borderRadius: radii.md,
  backgroundColor: colors.surfaceMuted,
})
const $signalDot: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 8,
  height: 8,
  marginTop: 9,
  borderRadius: 4,
  backgroundColor: colors.signal,
})
const $muted: ThemedStyle<TextStyle> = ({ colors }) => ({ color: colors.textDim })
