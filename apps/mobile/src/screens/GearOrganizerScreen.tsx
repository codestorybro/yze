import { useState } from "react"
import { ActivityIndicator, TextStyle, View, ViewStyle } from "react-native"
import { router } from "expo-router"

import { BrandHeader } from "@/components/BrandHeader"
import { Button } from "@/components/Button"
import { OrganizerHero } from "@/components/OrganizerHero"
import { QuickAction } from "@/components/QuickAction"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { getHello } from "@/services/api"
import type { GeneralApiProblem } from "@/services/api/apiProblem"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

type RequestState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; message: string }
  | { status: "error"; message: string }

const problemMessages: Record<GeneralApiProblem["kind"], string> = {
  "bad-data": "The API returned an unexpected response.",
  "cannot-connect": "Could not connect to the API. Check its URL and whether it is running.",
  "forbidden": "The API refused this request.",
  "not-found": "The hello endpoint was not found.",
  "rejected": "The API rejected this request.",
  "server": "The API reported a server error.",
  "timeout": "The API request timed out.",
  "unauthorized": "The API requires authorization.",
  "unknown": "An unexpected API error occurred.",
}

export function GearOrganizerScreen() {
  const {
    theme: { colors },
    themed,
  } = useAppTheme()
  const [request, setRequest] = useState<RequestState>({ status: "idle" })
  const connectionBadge = {
    idle: { color: colors.textDim, label: "Not tested" },
    loading: { color: colors.tint, label: "Testing" },
    success: { color: colors.success, label: "Connected" },
    error: { color: colors.error, label: "Unavailable" },
  }[request.status]

  const testConnection = async () => {
    setRequest({ status: "loading" })

    try {
      const result = await getHello()

      if (result.kind === "ok") {
        setRequest({ status: "success", message: result.data.message })
        return
      }

      setRequest({ status: "error", message: problemMessages[result.kind] })
    } catch (error) {
      setRequest({
        status: "error",
        message: error instanceof Error ? error.message : "Could not configure the API client.",
      })
    }
  }

  const openPlaces = () => router.push("/places")
  const openSettings = () => router.push("/settings")

  return (
    <Screen
      preset="scroll"
      ScrollViewProps={{ showsVerticalScrollIndicator: false }}
      contentContainerStyle={themed($screenContent)}
    >
      <View style={themed($page)}>
        <BrandHeader />

        <View style={themed($heroCopy)}>
          <Text preset="eyebrow" style={themed($eyebrow)} text="Everything has a place" />
          <Text preset="display" text="Get Yze." />
          <Text
            style={themed($lead)}
            text="Get your gear organized. Build a visual home for every cable, camera, adapter, and tool."
          />
        </View>

        <OrganizerHero />

        <View style={themed($quickActionSection)}>
          <Text preset="section" text="Quick actions" />
          <View accessibilityLabel="Quick actions" style={themed($quickActions)}>
            <QuickAction
              emphasized
              accessibilityHint="Opens your Places"
              fallback="□"
              icon={{ ios: "archivebox", android: "inventory_2", web: "inventory_2" }}
              label="Places"
              onPress={openPlaces}
            />
            <QuickAction
              accessibilityHint="Opens appearance settings"
              fallback="⚙"
              icon={{ ios: "gearshape", android: "settings", web: "settings" }}
              label="Appearance"
              onPress={openSettings}
            />
          </View>
        </View>

        <View style={themed($nextStepCard)}>
          <View style={themed($cardLabelRow)}>
            <View style={themed($cardSignal)} />
            <Text preset="eyebrow" style={themed($cardEyebrow)} text="Your first space" />
          </View>
          <Text preset="section" text="Build your visual map" />
          <Text
            style={themed($cardDescription)}
            text="Start with a room, shelf, case, or backpack. Places give every future item useful context."
          />
          <Button preset="primary" onPress={openPlaces} text="Open Places" />
        </View>

        <View style={themed($connectionSection)}>
          <View style={themed($connectionHeader)}>
            <View style={themed($connectionHeading)}>
              <Text preset="eyebrow" style={themed($mutedEyebrow)} text="Development status" />
              <Text preset="section" text="API connection" />
            </View>
            <View style={themed($statusBadge)}>
              <View style={[themed($statusDot), { backgroundColor: connectionBadge.color }]} />
              <Text
                preset="caption"
                style={themed($statusBadgeText)}
                text={connectionBadge.label}
              />
            </View>
          </View>

          {request.status === "idle" && (
            <Text style={themed($statusText)} text="The API connection has not been tested yet." />
          )}

          {request.status === "loading" && (
            <View style={themed($loadingRow)} accessibilityLiveRegion="polite">
              <ActivityIndicator color={colors.tint} />
              <Text text="Connecting…" />
            </View>
          )}

          {request.status === "success" && (
            <Text
              accessibilityLiveRegion="polite"
              style={themed($successText)}
              text={request.message}
            />
          )}

          {request.status === "error" && (
            <Text
              accessibilityLiveRegion="assertive"
              style={themed($errorText)}
              text={request.message}
            />
          )}

          <Button
            preset="secondary"
            disabled={request.status === "loading"}
            onPress={testConnection}
            text={request.status === "error" ? "Retry API connection" : "Test API connection"}
          />
        </View>

        <Text preset="caption" style={themed($footer)} text="Yze — Gear, organized." />
      </View>
    </Screen>
  )
}

const $screenContent: ThemedStyle<ViewStyle> = () => ({
  flexGrow: 1,
  alignItems: "center",
})

const $page: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  width: "100%",
  maxWidth: 768,
  paddingHorizontal: spacing.lg,
  gap: spacing.xl,
})

const $heroCopy: ThemedStyle<ViewStyle> = ({ spacing }) => ({ gap: spacing.xs })

const $eyebrow: ThemedStyle<TextStyle> = ({ colors }) => ({ color: colors.tint })

const $lead: ThemedStyle<TextStyle> = ({ colors }) => ({
  maxWidth: 590,
  color: colors.textDim,
})

const $quickActionSection: ThemedStyle<ViewStyle> = ({ spacing }) => ({ gap: spacing.md })

const $quickActions: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  width: "66%",
  minWidth: 220,
  maxWidth: 260,
  flexDirection: "row",
  gap: spacing.sm,
})

const $nextStepCard: ThemedStyle<ViewStyle> = ({ colors, radii, spacing }) => ({
  gap: spacing.md,
  padding: spacing.lg,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: radii.lg,
  backgroundColor: colors.surface,
})

const $cardLabelRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xs,
})

const $cardSignal: ThemedStyle<ViewStyle> = ({ colors, radii }) => ({
  width: 18,
  height: 4,
  borderRadius: radii.pill,
  backgroundColor: colors.signal,
})

const $cardEyebrow: ThemedStyle<TextStyle> = ({ colors }) => ({ color: colors.textDim })

const $cardDescription: ThemedStyle<TextStyle> = ({ colors }) => ({ color: colors.textDim })

const $connectionSection: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  gap: spacing.md,
  paddingTop: spacing.xl,
  borderTopWidth: 1,
  borderTopColor: colors.separator,
})

const $connectionHeader: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  flexWrap: "wrap",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: spacing.md,
})

const $connectionHeading: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  minWidth: 180,
  flexGrow: 1,
  flexShrink: 1,
  gap: spacing.xxs,
})

const $mutedEyebrow: ThemedStyle<TextStyle> = ({ colors }) => ({ color: colors.textDim })

const $statusBadge: ThemedStyle<ViewStyle> = ({ colors, radii, spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xxs,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xxs,
  borderRadius: radii.pill,
  backgroundColor: colors.surfaceMuted,
})

const $statusDot: ThemedStyle<ViewStyle> = ({ radii }) => ({
  width: 6,
  height: 6,
  borderRadius: radii.pill,
})

const $statusBadgeText: ThemedStyle<TextStyle> = ({ colors }) => ({ color: colors.textDim })

const $statusText: ThemedStyle<TextStyle> = ({ colors }) => ({ color: colors.textDim })

const $loadingRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.sm,
})

const $successText: ThemedStyle<TextStyle> = ({ colors }) => ({ color: colors.success })

const $errorText: ThemedStyle<TextStyle> = ({ colors }) => ({ color: colors.error })

const $footer: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
  textAlign: "center",
})
