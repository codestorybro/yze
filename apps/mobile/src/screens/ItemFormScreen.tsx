import { useEffect, useState } from "react"
import type { TextStyle, ViewStyle } from "react-native"
import { ActivityIndicator, View } from "react-native"
import { router } from "expo-router"

import { Button } from "@/components/Button"
import { useToast } from "@/components/feedback/ToastProvider"
import { ContentState } from "@/components/organizer/ContentState"
import { FeatureHeader } from "@/components/organizer/FeatureHeader"
import { FormField } from "@/components/organizer/FormField"
import { IconPicker } from "@/components/organizer/IconPicker"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import {
  emptyItemDraft,
  itemDraftFromItem,
  itemRequestFromDraft,
  type ItemFormDraft,
  type ItemFormErrors,
  validateItemDraft,
} from "@/features/organizer/itemForm"
import type { ItemIconKey } from "@/features/organizer/itemIconCatalog"
import { createItem, getItem, getPlace, updateItem } from "@/services/api"
import { apiFailureMessage } from "@/services/api/problemMessage"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { notifySuccess } from "@/utils/safeHaptics"

interface ItemFormScreenProps {
  itemId?: string
  placeId?: string
  placeName?: string
}

export function ItemFormScreen({ itemId, placeId, placeName }: ItemFormScreenProps) {
  const {
    theme: { colors },
    themed,
  } = useAppTheme()
  const { showToast } = useToast()
  const editing = Boolean(itemId)
  const [draft, setDraft] = useState<ItemFormDraft>(emptyItemDraft)
  const [destinationId, setDestinationId] = useState(placeId)
  const [destinationName, setDestinationName] = useState(placeName ?? "")
  const [detailsVisible, setDetailsVisible] = useState(editing)
  const [loading, setLoading] = useState(editing)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<ItemFormErrors>({})
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!itemId) return
    let active = true

    void getItem(itemId).then(async (result) => {
      if (!active) return
      if (result.kind === "ok") {
        setDraft(itemDraftFromItem(result.data))
        setDestinationId(result.data.placeId)
        const placeResult = await getPlace(result.data.placeId)
        if (active && placeResult.kind === "ok") setDestinationName(placeResult.data.name)
      } else {
        setLoadError(apiFailureMessage(result))
      }
      if (active) setLoading(false)
    })

    return () => {
      active = false
    }
  }, [itemId, reloadKey])

  const update = <K extends keyof ItemFormDraft>(key: K, value: ItemFormDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: undefined }))
  }

  const save = async () => {
    const localErrors = validateItemDraft(draft, destinationId)
    setErrors(localErrors)
    if (Object.keys(localErrors).length > 0 || !destinationId) return

    setSubmitting(true)
    setMessage(null)
    const request = itemRequestFromDraft(draft)
    const result = itemId
      ? await updateItem(itemId, request)
      : await createItem(destinationId, request)
    setSubmitting(false)

    if (result.kind === "ok") {
      showToast(editing ? "Item updated" : "Item added")
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

  if (loading) {
    return (
      <Screen preset="fixed" safeAreaEdges={["bottom"]} contentContainerStyle={themed($loading)}>
        <ActivityIndicator color={colors.tint} size="large" />
        <Text text="Loading Item…" />
      </Screen>
    )
  }

  if (loadError) {
    return (
      <Screen
        preset="fixed"
        safeAreaEdges={["bottom"]}
        contentContainerStyle={themed($loadFailure)}
      >
        <FeatureHeader reserveNavigationSpace={false} title="Edit Item" />
        <ContentState
          title="This Item is unavailable"
          description={loadError}
          actionLabel="Try again"
          onAction={() => {
            setLoading(true)
            setLoadError(null)
            setReloadKey((current) => current + 1)
          }}
        />
      </Screen>
    )
  }

  return (
    <Screen
      preset="scroll"
      safeAreaEdges={["bottom"]}
      keyboardShouldPersistTaps="handled"
      ScrollViewProps={{ showsVerticalScrollIndicator: false }}
      contentContainerStyle={themed($screen)}
    >
      <View style={themed($page)}>
        <FeatureHeader
          eyebrow={editing ? "Edit Item" : "New Item"}
          reserveNavigationSpace={false}
          title={editing ? "Update your gear" : "Place an object"}
          subtitle="Start with what helps you recognize it. Technical details can wait."
        />

        <View style={themed($destination)}>
          <Text preset="eyebrow" style={themed($muted)} text="Destination" />
          <Text preset="section" text={destinationName || "Selected Place"} />
          {errors.placeId ? (
            <Text preset="formHelper" style={themed($error)} text={errors.placeId} />
          ) : null}
        </View>

        <View style={themed($form)}>
          <FormField
            autoCapitalize="sentences"
            autoFocus={!editing}
            error={errors.name}
            label="Name"
            maxLength={120}
            onChangeText={(value) => update("name", value)}
            placeholder="MacBook charger"
            value={draft.name}
          />
          <IconPicker
            error={errors.iconKey}
            onChange={(value: ItemIconKey) => update("iconKey", value)}
            value={draft.iconKey}
          />
          <FormField
            autoCapitalize="none"
            autoCorrect={false}
            error={errors.photoUrl}
            helper="Optional HTTPS image URL. Local device paths are never stored."
            keyboardType="url"
            label="Remote photo URL"
            onChangeText={(value) => update("photoUrl", value)}
            placeholder="https://…"
            value={draft.photoUrl}
          />

          {detailsVisible ? (
            <View style={themed($details)}>
              <FormSection title="Identification">
                <FormField
                  error={errors.brand}
                  label="Brand"
                  onChangeText={(value) => update("brand", value)}
                  value={draft.brand}
                />
                <FormField
                  error={errors.model}
                  label="Model"
                  onChangeText={(value) => update("model", value)}
                  value={draft.model}
                />
                <FormField
                  error={errors.serialNumber}
                  label="Serial number"
                  onChangeText={(value) => update("serialNumber", value)}
                  value={draft.serialNumber}
                />
                <FormField
                  error={errors.category}
                  label="Category"
                  onChangeText={(value) => update("category", value)}
                  value={draft.category}
                />
                <FormField
                  error={errors.productionDate}
                  helper="YYYY-MM-DD"
                  label="Production date"
                  onChangeText={(value) => update("productionDate", value)}
                  placeholder="2026-08-01"
                  value={draft.productionDate}
                />
              </FormSection>

              <FormSection title="Purchase and warranty">
                <FormField
                  error={errors.purchaseDate}
                  helper="YYYY-MM-DD"
                  label="Purchase date"
                  onChangeText={(value) => update("purchaseDate", value)}
                  placeholder="2026-08-01"
                  value={draft.purchaseDate}
                />
                <View style={themed($row)}>
                  <FormField
                    error={errors.purchasePrice}
                    keyboardType="decimal-pad"
                    label="Price"
                    onChangeText={(value) => update("purchasePrice", value)}
                    style={$flexInput}
                    value={draft.purchasePrice}
                  />
                  <FormField
                    autoCapitalize="characters"
                    error={errors.purchaseCurrency}
                    label="Currency"
                    maxLength={3}
                    onChangeText={(value) => update("purchaseCurrency", value)}
                    placeholder="PLN"
                    style={$currencyInput}
                    value={draft.purchaseCurrency}
                  />
                </View>
                <FormField
                  error={errors.warrantyUntil}
                  helper="YYYY-MM-DD"
                  label="Warranty until"
                  onChangeText={(value) => update("warrantyUntil", value)}
                  placeholder="2028-08-01"
                  value={draft.warrantyUntil}
                />
                <FormField
                  autoCapitalize="none"
                  autoCorrect={false}
                  error={errors.productUrl}
                  keyboardType="url"
                  label="Product URL"
                  onChangeText={(value) => update("productUrl", value)}
                  value={draft.productUrl}
                />
              </FormSection>

              <FormSection title="Notes and organization">
                <FormField
                  error={errors.quantity}
                  keyboardType="number-pad"
                  label="Quantity"
                  onChangeText={(value) => update("quantity", value)}
                  value={draft.quantity}
                />
                <FormField
                  error={errors.tags}
                  helper="Separate tags with commas."
                  label="Tags"
                  onChangeText={(value) => update("tags", value)}
                  placeholder="travel, USB-C"
                  value={draft.tags}
                />
                <FormField
                  error={errors.notes}
                  label="Notes"
                  maxLength={4000}
                  multiline
                  onChangeText={(value) => update("notes", value)}
                  value={draft.notes}
                />
              </FormSection>
            </View>
          ) : (
            <Button preset="ghost" onPress={() => setDetailsVisible(true)} text="Add details" />
          )}

          {message ? (
            <Text accessibilityLiveRegion="assertive" style={themed($error)} text={message} />
          ) : null}
          <Button
            preset="primary"
            disabled={submitting}
            onPress={() => void save()}
            text={submitting ? "Saving…" : editing ? "Save changes" : "Add Item"}
          />
        </View>
      </View>
    </Screen>
  )
}

function FormSection({ children, title }: { children: React.ReactNode; title: string }) {
  const { themed } = useAppTheme()
  return (
    <View style={themed($formSection)}>
      <Text preset="section" text={title} />
      {children}
    </View>
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
const $destination: ThemedStyle<ViewStyle> = ({ colors, radii, spacing }) => ({
  gap: spacing.xxs,
  padding: spacing.md,
  borderRadius: radii.md,
  backgroundColor: colors.tintSubtle,
})
const $form: ThemedStyle<ViewStyle> = ({ colors, radii, spacing }) => ({
  gap: spacing.lg,
  padding: spacing.lg,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: radii.lg,
  backgroundColor: colors.surface,
})
const $details: ThemedStyle<ViewStyle> = ({ spacing }) => ({ gap: spacing.xl })
const $formSection: ThemedStyle<ViewStyle> = ({ spacing }) => ({ gap: spacing.md })
const $row: ThemedStyle<ViewStyle> = ({ spacing }) => ({ flexDirection: "row", gap: spacing.sm })
const $flexInput: TextStyle = { minWidth: 120 }
const $currencyInput: TextStyle = { width: 96 }
const $muted: ThemedStyle<TextStyle> = ({ colors }) => ({ color: colors.textDim })
const $error: ThemedStyle<TextStyle> = ({ colors }) => ({ color: colors.error })
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
