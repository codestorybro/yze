import type { TextStyle, ViewStyle } from "react-native"
import { View } from "react-native"

import { BrandHeader } from "@/components/BrandHeader"
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
    <Screen preset="fixed" contentContainerStyle={themed($screenContent)}>
      <BrandHeader />
      <View style={themed($message)}>
        <Text preset="title" text={title} />
        <Text style={themed($description)} text={description} />
      </View>
    </Screen>
  )
}

const $screenContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  width: "100%",
  maxWidth: 720,
  alignSelf: "center",
  padding: spacing.lg,
})

const $message: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  maxWidth: 520,
  justifyContent: "center",
  gap: spacing.sm,
})

const $description: ThemedStyle<TextStyle> = ({ colors }) => ({ color: colors.textDim })
