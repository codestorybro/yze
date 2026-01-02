import { View, Image, ViewStyle, ImageStyle, Pressable, StyleSheet } from "react-native"
import { useAppTheme } from "@/theme/context"
import { SvgIcon } from "./SvgIcon"
import { SvgIconPaths } from "./SvgIcon/svgsPaths"

type AvatarProps = {
  uri?: string
  size?: number
  onPress?: () => void
  style?: ViewStyle
}

export function Avatar({ uri, size = 48, onPress, style }: AvatarProps) {
  const {
    theme: { colors },
  } = useAppTheme()

  const containerStyle: ViewStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: colors.separator,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  }

  const imageStyle: ImageStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  }

  const content = uri ? (
    <Image source={{ uri }} style={imageStyle} />
  ) : (
    <SvgIcon pathData={SvgIconPaths.user} size={size * 0.6} color={colors.textDim} />
  )

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [containerStyle, style, pressed && styles.pressed]}
      >
        {content}
      </Pressable>
    )
  }

  return <View style={[containerStyle, style]}>{content}</View>
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.7,
  },
})
