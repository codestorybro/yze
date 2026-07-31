import { useState } from "react"
import { ActivityIndicator, TextStyle, View, ViewStyle } from "react-native"

import { Button } from "@/components/Button"
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
  const { themed } = useAppTheme()
  const [request, setRequest] = useState<RequestState>({ status: "idle" })

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

  return (
    <Screen
      preset="auto"
      safeAreaEdges={["top", "bottom"]}
      contentContainerStyle={themed($screenContent)}
    >
      <View style={themed($intro)}>
        <Text preset="heading" text="Gear Organizer" />
        <Text
          style={themed($description)}
          text="Your visual map of tech gear and storage places."
        />
      </View>

      <View style={themed($connectionCard)}>
        <Text preset="subheading" text="Backend connection" />

        {request.status === "idle" && (
          <Text style={themed($statusText)} text="The API connection has not been tested yet." />
        )}

        {request.status === "loading" && (
          <View style={themed($loadingRow)} accessibilityLiveRegion="polite">
            <ActivityIndicator />
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
          preset="reversed"
          disabled={request.status === "loading"}
          onPress={testConnection}
          text={request.status === "error" ? "Retry API connection" : "Test API connection"}
        />
      </View>
    </Screen>
  )
}

const $screenContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexGrow: 1,
  justifyContent: "center",
  gap: spacing.xxl,
  padding: spacing.lg,
})

const $intro: ThemedStyle<ViewStyle> = ({ spacing }) => ({ gap: spacing.sm })

const $description: ThemedStyle<TextStyle> = ({ colors }) => ({ color: colors.textDim })

const $connectionCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  gap: spacing.md,
  padding: spacing.lg,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 12,
  backgroundColor: colors.palette.neutral100,
})

const $statusText: ThemedStyle<TextStyle> = ({ colors }) => ({ color: colors.textDim })

const $loadingRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.sm,
})

const $successText: ThemedStyle<TextStyle> = ({ colors }) => ({ color: colors.tint })

const $errorText: ThemedStyle<TextStyle> = ({ colors }) => ({ color: colors.error })
