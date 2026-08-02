import { ReactNode, useState } from "react"
import type { ImageStyle, StyleProp, ViewStyle } from "react-native"
import { ActivityIndicator, Image, View } from "react-native"
import { SymbolView } from "expo-symbols"

import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

interface RemotePhotoProps {
  accessibilityLabel: string
  fallback: ReactNode
  imageStyle?: StyleProp<ImageStyle>
  style?: StyleProp<ViewStyle>
  url?: string | null
}

export function RemotePhoto({
  accessibilityLabel,
  fallback,
  imageStyle,
  style,
  url,
}: RemotePhotoProps) {
  const {
    theme: { colors },
    themed,
  } = useAppTheme()
  const [failedUrl, setFailedUrl] = useState<string | null>(null)
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null)
  const failed = Boolean(url && failedUrl === url)
  const loading = Boolean(url && !failed && loadedUrl !== url)

  return (
    <View style={style}>
      <View
        accessibilityElementsHidden={Boolean(url && !failed)}
        importantForAccessibility={url && !failed ? "no-hide-descendants" : "auto"}
        style={$fill}
      >
        {fallback}
      </View>
      {url && !failed ? (
        <Image
          accessibilityLabel={accessibilityLabel}
          onError={() => setFailedUrl(url)}
          onLoad={() => setLoadedUrl(url)}
          resizeMode="cover"
          source={{ uri: url }}
          style={[$image, imageStyle]}
        />
      ) : null}
      {loading ? (
        <View accessible accessibilityLabel="Loading photo" style={$status}>
          <ActivityIndicator color={colors.tint} />
        </View>
      ) : null}
      {failed ? (
        <View accessible accessibilityLabel="Photo unavailable" style={themed($failureBadge)}>
          <SymbolView
            name={{ ios: "exclamationmark", android: "priority_high", web: "priority_high" }}
            size={14}
            tintColor={colors.error}
          />
        </View>
      ) : null}
    </View>
  )
}

const $fill: ViewStyle = { width: "100%", height: "100%" }
const $image: ImageStyle = {
  position: "absolute",
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
}
const $status: ViewStyle = {
  position: "absolute",
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  alignItems: "center",
  justifyContent: "center",
}
const $failureBadge: ThemedStyle<ViewStyle> = ({ colors, radii }) => ({
  position: "absolute",
  top: 6,
  right: 6,
  width: 24,
  height: 24,
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: radii.pill,
  backgroundColor: colors.surfaceRaised,
})
