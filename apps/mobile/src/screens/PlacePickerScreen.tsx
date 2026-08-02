import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { TextStyle, ViewStyle } from "react-native"
import { ActivityIndicator, Pressable, View } from "react-native"
import { Href, router } from "expo-router"
import { SymbolView } from "expo-symbols"

import { Button } from "@/components/Button"
import { useToast } from "@/components/feedback/ToastProvider"
import { SheetList } from "@/components/navigation/SheetContent"
import { FeatureHeader } from "@/components/organizer/FeatureHeader"
import { Text } from "@/components/Text"
import { getChildPlaces, getPlace, getRootPlaces, movePlace } from "@/services/api"
import { apiFailureMessage } from "@/services/api/problemMessage"
import type { PlaceDetails, PlaceSummary } from "@/services/api/types"
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
  const [path, setPath] = useState<PlaceSummary[]>([])
  const [places, setPlaces] = useState<PlaceSummary[]>([])
  const [destination, setDestination] = useState<PlaceDetails | null>(null)
  const [selected, setSelected] = useState<PlaceSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loadErrorScope, setLoadErrorScope] = useState<"initial" | "level" | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const requestSequence = useRef(0)

  const fetchLevel = useCallback(
    (parentId: string | null) => (parentId ? getChildPlaces(parentId) : getRootPlaces()),
    [],
  )

  const loadInitial = useCallback(async () => {
    const sequence = ++requestSequence.current
    setLoading(true)
    setLoadError(null)
    setLoadErrorScope(null)

    const [placesResult, destinationResult] = await Promise.all([
      fetchLevel(null),
      mode === "attach" && destinationPlaceId ? getPlace(destinationPlaceId) : null,
    ])
    if (sequence !== requestSequence.current) return

    if (placesResult.kind !== "ok") {
      setLoadError(apiFailureMessage(placesResult))
      setLoadErrorScope("initial")
    } else if (destinationResult && destinationResult.kind !== "ok") {
      setLoadError(apiFailureMessage(destinationResult))
      setLoadErrorScope("initial")
    } else {
      setPlaces(placesResult.data)
      setDestination(destinationResult?.kind === "ok" ? destinationResult.data : null)
    }
    setLoading(false)
  }, [destinationPlaceId, fetchLevel, mode])

  useEffect(() => {
    void Promise.resolve().then(loadInitial)
    return () => {
      requestSequence.current += 1
    }
  }, [loadInitial])

  const unavailableIds = useMemo(() => {
    if (!destination) return new Set<string>()
    return new Set([
      destination.id,
      ...destination.ancestry.map((place) => place.id),
      ...destination.children.map((place) => place.id),
    ])
  }, [destination])

  const transitionTo = async (nextPath: PlaceSummary[]) => {
    if (loading) return
    const sequence = ++requestSequence.current
    setLoading(true)
    setLoadError(null)
    setLoadErrorScope(null)
    const result = await fetchLevel(nextPath.at(-1)?.id ?? null)
    if (sequence !== requestSequence.current) return

    if (result.kind === "ok") {
      setPath(nextPath)
      setPlaces(result.data)
      setSelected(null)
    } else {
      setLoadError(apiFailureMessage(result))
      setLoadErrorScope("level")
    }
    setLoading(false)
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
    const result = await movePlace(selected.id, destinationPlaceId)
    setSubmitting(false)

    if (result.kind === "ok") {
      showToast(`Place moved into ${destination?.name ?? destinationPlaceName ?? "this Place"}`)
      void notifySuccess()
      router.back()
      return
    }
    setMessage(apiFailureMessage(result))
  }

  const location =
    path.length === 0 ? "All root Places" : path.map((place) => place.name).join(" / ")

  return (
    <SheetList
      data={loading ? [] : places}
      keyExtractor={(place) => place.id}
      contentContainerStyle={themed($screen)}
      ListHeaderComponent={
        <View style={themed($page)}>
          <FeatureHeader
            eyebrow={mode === "manage" ? "Manage" : "Add existing"}
            reserveNavigationSpace={false}
            title={mode === "manage" ? "Choose a Place" : "Use an existing Place"}
            subtitle={
              mode === "manage"
                ? "Browse your map and select the Place you want to manage."
                : `Choose a Place to move into ${destination?.name ?? destinationPlaceName ?? "this Place"}.`
            }
          />
          <View style={themed($path)}>
            <Text preset="caption" style={themed($muted)} text="Browsing" />
            <Text preset="label" numberOfLines={2} text={location} />
          </View>
          {path.length > 0 ? (
            <Button
              preset="ghost"
              disabled={loading}
              onPress={() => void transitionTo(path.slice(0, -1))}
              text="Up one level"
            />
          ) : null}
          {loading ? (
            <View style={themed($loading)}>
              <ActivityIndicator color={colors.tint} />
              <Text text="Loading Places…" />
            </View>
          ) : null}
        </View>
      }
      ListEmptyComponent={
        loading ? null : (
          <View style={themed($empty)}>
            <Text style={themed($muted)} text="There are no Places at this level." />
          </View>
        )
      }
      ListFooterComponent={
        <View style={themed($footer)}>
          {selected ? (
            <View style={themed($confirmation)}>
              <View style={$flex}>
                <Text preset="eyebrow" style={themed($muted)} text="Selected Place" />
                <Text preset="section" text={selected.name} />
              </View>
              <Button
                preset="primary"
                disabled={submitting}
                onPress={() => void confirm()}
                text={submitting ? "Moving…" : mode === "manage" ? "Manage Place" : "Move here"}
              />
            </View>
          ) : null}
          {loadError ? (
            <View style={themed($message)}>
              <Text accessibilityLiveRegion="assertive" style={themed($error)} text={loadError} />
              <Button
                preset="ghost"
                onPress={() =>
                  void (loadErrorScope === "initial" ? loadInitial() : transitionTo(path))
                }
                text="Try again"
              />
            </View>
          ) : null}
          {message ? (
            <Text accessibilityLiveRegion="assertive" style={themed($error)} text={message} />
          ) : null}
        </View>
      }
      renderItem={({ item: place }) => {
        const selectionUnavailable = mode === "attach" && unavailableIds.has(place.id)
        const isSelected = selected?.id === place.id
        return (
          <View style={[themed($row), isSelected && themed($selectedRow)]}>
            <Pressable
              accessibilityLabel={`Select ${place.name}`}
              accessibilityRole="radio"
              accessibilityState={{ checked: isSelected, disabled: selectionUnavailable }}
              disabled={selectionUnavailable || loading}
              onPress={() => setSelected(place)}
              style={themed($rowMain)}
            >
              <SymbolView
                name={{ ios: "archivebox", android: "inventory_2", web: "inventory_2" }}
                size={24}
                tintColor={isSelected ? colors.tint : colors.textDim}
              />
              <View style={$flex}>
                <Text preset="label" text={place.name} />
                <Text
                  preset="caption"
                  style={themed($muted)}
                  text={
                    selectionUnavailable
                      ? "Already here or would create a cycle"
                      : `${place.childPlaceCount} nested Places`
                  }
                />
              </View>
            </Pressable>
            {place.childPlaceCount > 0 ? (
              <Pressable
                accessibilityLabel={`Browse inside ${place.name}`}
                accessibilityRole="button"
                disabled={loading}
                hitSlop={8}
                onPress={() => void transitionTo([...path, place])}
                style={themed($browse)}
              >
                <SymbolView
                  name={{ ios: "chevron.right", android: "chevron_right", web: "chevron_right" }}
                  size={20}
                  tintColor={colors.text}
                />
              </Pressable>
            ) : null}
          </View>
        )
      }}
      showsVerticalScrollIndicator={false}
    />
  )
}

const $screen: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.lg,
  gap: spacing.md,
})
const $page: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  width: "100%",
  maxWidth: 680,
  alignSelf: "center",
  gap: spacing.lg,
})
const $path: ThemedStyle<ViewStyle> = ({ colors, radii, spacing }) => ({
  gap: spacing.xxs,
  padding: spacing.md,
  borderRadius: radii.md,
  backgroundColor: colors.surfaceMuted,
})
const $row: ThemedStyle<ViewStyle> = ({ colors, radii, spacing }) => ({
  width: "100%",
  maxWidth: 680,
  alignSelf: "center",
  minHeight: 68,
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xs,
  padding: spacing.sm,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: radii.md,
  backgroundColor: colors.surface,
})
const $selectedRow: ThemedStyle<ViewStyle> = ({ colors }) => ({ borderColor: colors.tint })
const $rowMain: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  minHeight: 44,
  flex: 1,
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.sm,
})
const $browse: ThemedStyle<ViewStyle> = ({ radii }) => ({
  width: 44,
  height: 44,
  alignItems: "center",
  justifyContent: "center",
  borderRadius: radii.pill,
})
const $confirmation: ThemedStyle<ViewStyle> = ({ colors, radii, spacing }) => ({
  gap: spacing.md,
  padding: spacing.lg,
  borderWidth: 1,
  borderColor: colors.tint,
  borderRadius: radii.lg,
  backgroundColor: colors.tintSubtle,
})
const $empty: ThemedStyle<ViewStyle> = () => ({
  width: "100%",
  maxWidth: 680,
  alignSelf: "center",
})
const $footer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  width: "100%",
  maxWidth: 680,
  alignSelf: "center",
  gap: spacing.md,
})
const $message: ThemedStyle<ViewStyle> = ({ spacing }) => ({ gap: spacing.xs })
const $loading: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  minHeight: 160,
  alignItems: "center",
  justifyContent: "center",
  gap: spacing.sm,
})
const $muted: ThemedStyle<TextStyle> = ({ colors }) => ({ color: colors.textDim })
const $error: ThemedStyle<TextStyle> = ({ colors }) => ({ color: colors.error })
const $flex: ViewStyle = { flex: 1 }
