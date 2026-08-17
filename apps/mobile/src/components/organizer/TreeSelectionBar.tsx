import type { TextStyle, ViewStyle } from "react-native"
import { View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { Button } from "@/components/Button"
import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

interface TreeSelectionBarProps {
  actionLabel: string
  busy?: boolean
  error?: string | null
  eyebrow: string
  onPress: () => void
  title: string
}

/** Keeps the selected tree destination and its confirmation action visible while browsing deeply. */
export function TreeSelectionBar({
  actionLabel,
  busy = false,
  error,
  eyebrow,
  onPress,
  title,
}: TreeSelectionBarProps) {
  const {
    theme: { spacing },
    themed,
  } = useAppTheme()
  const insets = useSafeAreaInsets()

  return (
    <View pointerEvents="box-none" style={[themed($host), { bottom: insets.bottom + spacing.sm }]}>
      <View style={themed($bar)}>
        <View style={themed($row)}>
          <View style={$copy}>
            <Text preset="eyebrow" style={themed($muted)} text={eyebrow} />
            <Text numberOfLines={1} preset="section" text={title} />
          </View>
          <Button
            preset="primary"
            disabled={busy}
            onPress={onPress}
            text={busy ? "Working…" : actionLabel}
          />
        </View>
        {error ? (
          <Text
            accessibilityLiveRegion="assertive"
            preset="caption"
            style={themed($error)}
            text={error}
          />
        ) : null}
      </View>
    </View>
  )
}

const $host: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  position: "absolute",
  zIndex: 120,
  right: 0,
  left: 0,
  alignItems: "center",
  paddingHorizontal: spacing.lg,
})
const $bar: ThemedStyle<ViewStyle> = ({ colors, radii, spacing }) => ({
  width: "100%",
  maxWidth: 720,
  gap: spacing.xs,
  padding: spacing.sm,
  borderWidth: 1,
  borderColor: colors.controlBorder,
  borderRadius: radii.lg,
  backgroundColor: colors.surfaceRaised,
  shadowColor: colors.overlay50,
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.16,
  shadowRadius: 18,
  elevation: 7,
})
const $row: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.sm,
})
const $copy: ViewStyle = { flex: 1 }
const $muted: ThemedStyle<TextStyle> = ({ colors }) => ({ color: colors.textDim })
const $error: ThemedStyle<TextStyle> = ({ colors }) => ({ color: colors.error })
