import type { TextStyle, ViewStyle } from "react-native"
import { ActivityIndicator, View } from "react-native"

import { Button } from "@/components/Button"
import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

interface ContentStateProps {
  actionLabel?: string
  description: string
  loading?: boolean
  onAction?: () => void
  title: string
}

export function ContentState({
  actionLabel,
  description,
  loading,
  onAction,
  title,
}: ContentStateProps) {
  const {
    theme: { colors },
    themed,
  } = useAppTheme()

  return (
    <View style={themed($container)} accessibilityLiveRegion="polite">
      {loading ? <ActivityIndicator color={colors.tint} size="large" /> : null}
      <View style={themed($copy)}>
        <Text preset="section" style={$center} text={title} />
        <Text style={[themed($description), $center]} text={description} />
      </View>
      {actionLabel && onAction ? (
        <Button preset="primary" onPress={onAction} text={actionLabel} />
      ) : null}
    </View>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  minHeight: 320,
  alignItems: "center",
  justifyContent: "center",
  gap: spacing.lg,
  padding: spacing.lg,
})
const $copy: ThemedStyle<ViewStyle> = ({ spacing }) => ({ gap: spacing.xs, maxWidth: 420 })
const $description: ThemedStyle<TextStyle> = ({ colors }) => ({ color: colors.textDim })
const $center: TextStyle = { textAlign: "center" }
