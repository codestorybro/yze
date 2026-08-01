import type { TextStyle, ViewStyle } from "react-native"
import { View } from "react-native"

import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

interface FutureFeatureScreenProps {
  description: string
  title: string
}

export function FutureFeatureScreen({ description, title }: FutureFeatureScreenProps) {
  const { themed } = useAppTheme()

  return (
    <Screen preset="fixed" safeAreaEdges={["top"]} contentContainerStyle={themed($screenContent)}>
      <View style={themed($message)}>
        <Text preset="heading" text={title} />
        <Text style={themed($description)} text={description} />
      </View>
    </Screen>
  )
}

const $screenContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  justifyContent: "center",
  padding: spacing.lg,
})

const $message: ThemedStyle<ViewStyle> = ({ spacing }) => ({ gap: spacing.sm })

const $description: ThemedStyle<TextStyle> = ({ colors }) => ({ color: colors.textDim })
