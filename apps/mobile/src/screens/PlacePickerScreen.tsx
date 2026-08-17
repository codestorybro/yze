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
import { canDropTreeEntity, type OrganizerTreeRow } from "@/features/organizer/organizerTree"
import { getOrganizerTree, movePlace } from "@/services/api"
import { apiFailureMessage } from "@/services/api/problemMessage"
import type { OrganizerTree } from "@/services/api/types"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { notifySuccess } from "@/utils/safeHaptics"

interface PlacePickerScreenProps {
  destinationPlaceId?: string
  destinationPlaceName?: string
  mode: "attach" | "manage"
}

export function PlacePickerScreen({
  destinationPlaceId,
  destinationPlaceName,
  mode,
}: PlacePickerScreenProps) {
  const {
    theme: { colors },
    themed,
  } = useAppTheme()
  const { showToast } = useToast()
  const [tree, setTree] = useState<OrganizerTree | null>(null)
  const [selected, setSelected] = useState<OrganizerTreeRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

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

  const confirm = async () => {
    if (!selected || submitting) return
    if (mode === "manage") {
      router.replace(`/places/place-form?placeId=${selected.id}` as Href)
      return
    }
    if (!destinationPlaceId) {
      setMessage("The destination Place is unavailable.")
      return
    }

    setSubmitting(true)
    setMessage(null)
    const result = await movePlace(
      selected.id,
      destinationPlaceId === tree?.root.id ? null : destinationPlaceId,
    )
    setSubmitting(false)

    if (result.kind === "ok") {
      const destination =
        destinationPlaceId === tree?.root.id
          ? tree.root.name
          : (tree?.places.find((place) => place.id === destinationPlaceId)?.name ??
            destinationPlaceName ??
            "this Place")
      showToast(`Place moved into ${destination}`)
      void notifySuccess()
      router.back()
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

  const destination =
    destinationPlaceId === tree.root.id
      ? tree.root.name
      : (tree.places.find((place) => place.id === destinationPlaceId)?.name ?? destinationPlaceName)

  const selectionAllowed = (row: OrganizerTreeRow) => {
    if (row.kind !== "place") return false
    if (mode === "manage") return true
    return Boolean(
      destinationPlaceId &&
      canDropTreeEntity(tree, { kind: "place", id: row.id }, destinationPlaceId),
    )
  }

  return (
    <OrganizerTreeView
      tree={tree}
      surface="sheet"
      draggingDisabled
      selectedId={selected?.id}
      selectionAllowed={selectionAllowed}
      contentContainerStyle={themed($screen)}
      floatingFooter={
        selected ? (
          <TreeSelectionBar
            actionLabel={mode === "manage" ? "Edit Place" : "Move here"}
            busy={submitting}
            error={message}
            eyebrow="Selected Place"
            onPress={() => void confirm()}
            title={selected.name}
          />
        ) : undefined
      }
      ListHeaderComponent={
        <View style={themed($header)}>
          <FeatureHeader
            eyebrow={mode === "manage" ? "Manage" : "Add existing"}
            reserveNavigationSpace={false}
            title={mode === "manage" ? "Choose a Place" : "Use an existing Place"}
            subtitle={
              mode === "manage"
                ? "The whole hierarchy stays visible. Select the Place you want to edit."
                : `Select a valid branch to move into ${destination ?? "this destination"}.`
            }
          />
          {message && !selected ? (
            <Text accessibilityLiveRegion="assertive" style={themed($error)} text={message} />
          ) : null}
        </View>
      }
      onSelect={setSelected}
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
const $loading: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  justifyContent: "center",
  gap: spacing.md,
  paddingHorizontal: spacing.lg,
})
const $error: ThemedStyle<TextStyle> = ({ colors }) => ({ color: colors.error })
