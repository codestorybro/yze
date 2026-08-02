import { useEffect, useState } from "react"
import type { TextStyle, ViewStyle } from "react-native"
import { ActivityIndicator, Alert, View } from "react-native"
import { Href, router } from "expo-router"

import { Button } from "@/components/Button"
import { useToast } from "@/components/feedback/ToastProvider"
import { SheetScrollView } from "@/components/navigation/SheetContent"
import { ContentState } from "@/components/organizer/ContentState"
import { FeatureHeader } from "@/components/organizer/FeatureHeader"
import { FormField } from "@/components/organizer/FormField"
import { Text } from "@/components/Text"
import { createPlace, deletePlace, getPlace, updatePlace } from "@/services/api"
import { apiFailureMessage } from "@/services/api/problemMessage"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { notifySuccess } from "@/utils/safeHaptics"

interface PlaceFormScreenProps {
  parentPlaceId?: string
  parentPlaceName?: string
  placeId?: string
}

export function PlaceFormScreen({ parentPlaceId, parentPlaceName, placeId }: PlaceFormScreenProps) {
  const {
    theme: { colors },
    themed,
  } = useAppTheme()
  const { showToast } = useToast()
  const editing = Boolean(placeId)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [photoUrl, setPhotoUrl] = useState("")
  const [currentParentId, setCurrentParentId] = useState<string | null>(parentPlaceId ?? null)
  const [expanded, setExpanded] = useState(editing)
  const [loading, setLoading] = useState(editing)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!placeId) return
    let active = true

    void getPlace(placeId).then((result) => {
      if (!active) return
      if (result.kind === "ok") {
        setName(result.data.name)
        setDescription(result.data.description ?? "")
        setPhotoUrl(result.data.photoUrl ?? "")
        setCurrentParentId(result.data.parentPlaceId)
      } else {
        setLoadError(apiFailureMessage(result))
      }
      setLoading(false)
    })

    return () => {
      active = false
    }
  }, [placeId, reloadKey])

  const save = async () => {
    const trimmedName = name.trim()
    if (!trimmedName) {
      setErrors({ name: "Give this Place a name." })
      return
    }

    setSubmitting(true)
    setErrors({})
    setMessage(null)
    const request = {
      name: trimmedName,
      description: description.trim() || null,
      photoUrl: photoUrl.trim() || null,
      parentPlaceId: editing ? currentParentId : (parentPlaceId ?? null),
    }
    const result = placeId ? await updatePlace(placeId, request) : await createPlace(request)
    setSubmitting(false)

    if (result.kind === "ok") {
      showToast(editing ? "Place updated" : "Place created")
      void notifySuccess()
      router.back()
      return
    }

    if (result.kind === "validation") {
      setErrors(
        Object.fromEntries(Object.entries(result.errors).map(([key, values]) => [key, values[0]])),
      )
    }
    setMessage(apiFailureMessage(result))
  }

  const confirmDelete = () => {
    if (!placeId) return
    Alert.alert(
      "Delete this Place?",
      "Only an empty Place can be deleted. Its contents will never be removed silently.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => void remove(),
        },
      ],
    )
  }

  const remove = async () => {
    if (!placeId || submitting) return
    setSubmitting(true)
    setMessage(null)
    const result = await deletePlace(placeId)
    setSubmitting(false)
    if (result.kind === "ok") {
      showToast("Place deleted")
      void notifySuccess()
      router.dismissTo((currentParentId ? `/places/${currentParentId}` : "/places") as Href)
    } else {
      setMessage(apiFailureMessage(result))
    }
  }

  if (loading) {
    return (
      <SheetScrollView contentContainerStyle={themed($loading)}>
        <ActivityIndicator color={colors.tint} size="large" />
        <Text text="Loading Place…" />
      </SheetScrollView>
    )
  }

  if (loadError) {
    return (
      <SheetScrollView contentContainerStyle={themed($loadFailure)}>
        <FeatureHeader reserveNavigationSpace={false} title="Edit Place" />
        <ContentState
          title="This Place is unavailable"
          description={loadError}
          actionLabel="Try again"
          onAction={() => {
            setLoading(true)
            setLoadError(null)
            setReloadKey((current) => current + 1)
          }}
        />
      </SheetScrollView>
    )
  }

  return (
    <SheetScrollView
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={themed($screen)}
    >
      <View style={themed($page)}>
        <FeatureHeader
          eyebrow={editing ? "Edit Place" : parentPlaceId ? "Nested Place" : "New root Place"}
          reserveNavigationSpace={false}
          title={editing ? "Refine this Place" : "Create a Place"}
          subtitle={
            parentPlaceName
              ? `It will appear inside ${parentPlaceName}.`
              : "Start broad or be precise. The hierarchy is always your choice."
          }
        />

        <View style={themed($form)}>
          <FormField
            autoCapitalize="sentences"
            autoFocus={!editing}
            error={errors.name}
            label="Name"
            maxLength={120}
            onChangeText={setName}
            placeholder="Camera backpack"
            returnKeyType="done"
            value={name}
          />

          {expanded ? (
            <View style={themed($details)}>
              <Text preset="section" text="Optional details" />
              <FormField
                error={errors.description}
                label="Description"
                maxLength={2000}
                multiline
                onChangeText={setDescription}
                placeholder="What belongs here?"
                value={description}
              />
              <FormField
                autoCapitalize="none"
                autoCorrect={false}
                error={errors.photoUrl}
                helper="Use an HTTPS image URL. Uploads will be added as a separate media feature."
                keyboardType="url"
                label="Remote photo URL"
                onChangeText={setPhotoUrl}
                placeholder="https://…"
                value={photoUrl}
              />
            </View>
          ) : (
            <Button
              preset="ghost"
              onPress={() => setExpanded(true)}
              text="Add photo or description"
            />
          )}

          {message ? (
            <Text accessibilityLiveRegion="assertive" style={themed($error)} text={message} />
          ) : null}
          <Button
            preset="primary"
            disabled={submitting}
            onPress={() => void save()}
            text={submitting ? "Saving…" : editing ? "Save changes" : "Create Place"}
          />
        </View>

        {editing && placeId ? (
          <View style={themed($management)}>
            <Text preset="section" text="Placement" />
            <Button
              preset="secondary"
              disabled={submitting}
              onPress={() =>
                router.push(
                  `/places/move?kind=place&entityId=${placeId}&currentPlaceId=${currentParentId ?? ""}` as Href,
                )
              }
              text="Move this Place"
            />
            <Button
              preset="danger"
              disabled={submitting}
              onPress={confirmDelete}
              text="Delete empty Place"
            />
          </View>
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
  gap: spacing.xl,
})
const $form: ThemedStyle<ViewStyle> = ({ colors, radii, spacing }) => ({
  gap: spacing.lg,
  padding: spacing.lg,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: radii.lg,
  backgroundColor: colors.surface,
})
const $details: ThemedStyle<ViewStyle> = ({ spacing }) => ({ gap: spacing.md })
const $management: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  gap: spacing.md,
  paddingTop: spacing.xl,
  borderTopWidth: 1,
  borderTopColor: colors.separator,
})
const $loading: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  justifyContent: "center",
  gap: spacing.md,
})
const $loadFailure: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  width: "100%",
  maxWidth: 680,
  alignSelf: "center",
  paddingHorizontal: spacing.lg,
})
const $error: ThemedStyle<TextStyle> = ({ colors }) => ({ color: colors.error })
