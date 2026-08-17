import { useEffect, useState } from "react"
import type { TextStyle, ViewStyle } from "react-native"
import { ActivityIndicator, View } from "react-native"
import { Href, router } from "expo-router"

import { Button } from "@/components/Button"
import { useToast } from "@/components/feedback/ToastProvider"
import { SheetScrollView } from "@/components/navigation/SheetContent"
import { FeatureHeader } from "@/components/organizer/FeatureHeader"
import { OrganizerTreeView } from "@/components/organizer/OrganizerTreeView"
import { TreeSelectionBar } from "@/components/organizer/TreeSelectionBar"
import { Text } from "@/components/Text"
import {
  canDropTreeEntity,
  parentIdForTreeEntity,
  type OrganizerTreeEntity,
} from "@/features/organizer/organizerTree"
import { getOrganizerTree, moveItem, movePlace } from "@/services/api"
import { apiFailureMessage } from "@/services/api/problemMessage"
import type { OrganizerTree } from "@/services/api/types"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { notifySuccess } from "@/utils/safeHaptics"

interface MoveContentScreenProps {
  currentPlaceId: string
  entityId: string
  kind: "item" | "place"
}

export function MoveContentScreen({ currentPlaceId, entityId, kind }: MoveContentScreenProps) {
  const {
    theme: { colors },
    themed,
  } = useAppTheme()
  const { showToast } = useToast()
  const [tree, setTree] = useState<OrganizerTree | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const entity: OrganizerTreeEntity = { id: entityId, kind }

  useEffect(() => {
    let active = true
    void getOrganizerTree().then((result) => {
      if (!active) return
      if (result.kind === "ok") setTree(result.data)
      else setMessage(apiFailureMessage(result))
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [reloadKey])

  const retry = () => {
    setLoading(true)
    setMessage(null)
    setReloadKey((key) => key + 1)
  }

  const move = async () => {
    if (!tree || !selectedId || submitting) return
    setSubmitting(true)
    setMessage(null)
    const result =
      kind === "item"
        ? await moveItem(entityId, selectedId)
        : await movePlace(entityId, selectedId === tree.root.id ? null : selectedId)
    setSubmitting(false)

    if (result.kind === "ok") {
      const destination =
        selectedId === tree.root.id
          ? tree.root.name
          : (tree.places.find((place) => place.id === selectedId)?.name ?? "the selected Place")
      showToast(`${kind === "item" ? "Item" : "Place"} moved to ${destination}`)
      void notifySuccess()
      router.dismissTo((selectedId === tree.root.id ? "/places" : `/places/${selectedId}`) as Href)
      return
    }
    setMessage(apiFailureMessage(result))
  }

  if (!tree) {
    return (
      <SheetScrollView contentContainerStyle={themed($loading)}>
        {loading ? (
          <>
            <ActivityIndicator color={colors.tint} size="large" />
            <Text text="Loading the full hierarchy…" />
          </>
        ) : (
          <>
            <FeatureHeader
              reserveNavigationSpace={false}
              title="The hierarchy is unavailable"
              subtitle={message ?? "Try loading the organizer tree again."}
            />
            <Button onPress={retry} text="Try again" />
          </>
        )}
      </SheetScrollView>
    )
  }

  const selectedName =
    selectedId === tree.root.id
      ? tree.root.name
      : tree.places.find((place) => place.id === selectedId)?.name
  const actualCurrentPlaceId = parentIdForTreeEntity(tree, entity) ?? currentPlaceId

  return (
    <OrganizerTreeView
      tree={tree}
      surface="sheet"
      draggingDisabled
      selectedId={selectedId}
      selectionAllowed={(row) =>
        (row.kind === "root" || row.kind === "place") && canDropTreeEntity(tree, entity, row.id)
      }
      contentContainerStyle={themed($screen)}
      floatingFooter={
        selectedName ? (
          <TreeSelectionBar
            actionLabel="Move here"
            busy={submitting}
            error={message}
            eyebrow="Destination"
            onPress={() => void move()}
            title={selectedName}
          />
        ) : undefined
      }
      ListHeaderComponent={
        <View style={themed($header)}>
          <FeatureHeader
            eyebrow="Choose destination"
            reserveNavigationSpace={false}
            title={kind === "item" ? "Move Item" : "Move Place"}
            subtitle="The whole hierarchy stays visible. Select the root or any highlighted Place."
          />
          <View style={themed($current)}>
            <Text preset="caption" style={themed($muted)} text="Current container" />
            <Text
              preset="label"
              text={
                actualCurrentPlaceId === tree.root.id
                  ? tree.root.name
                  : (tree.places.find((place) => place.id === actualCurrentPlaceId)?.name ??
                    "Current Place")
              }
            />
          </View>
          {message && !selectedName ? (
            <Text accessibilityLiveRegion="assertive" style={themed($error)} text={message} />
          ) : null}
        </View>
      }
      onSelect={(row) => setSelectedId(row.id)}
    />
  )
}

const $screen: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.lg,
  gap: spacing.xs,
})
const $header: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  width: "100%",
  maxWidth: 760,
  alignSelf: "center",
  gap: spacing.lg,
  marginBottom: spacing.md,
})
const $current: ThemedStyle<ViewStyle> = ({ colors, radii, spacing }) => ({
  gap: spacing.xxs,
  padding: spacing.md,
  borderRadius: radii.md,
  backgroundColor: colors.surfaceMuted,
})
const $loading: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  justifyContent: "center",
  gap: spacing.md,
  paddingHorizontal: spacing.lg,
})
const $muted: ThemedStyle<TextStyle> = ({ colors }) => ({ color: colors.textDim })
const $error: ThemedStyle<TextStyle> = ({ colors }) => ({ color: colors.error })
