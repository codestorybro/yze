import React from "react"
import { View, StyleProp, ViewStyle } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useAppTheme } from "@/theme/context"

type Props = {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
  separatorHeight?: number
  fromTop?: boolean
}

export function GradientSeparator({
  children,
  style,
  separatorHeight = 26,
  fromTop = false,
}: Props) {
  const {
    theme: { colors },
    themeContext,
  } = useAppTheme()

  return (
    <View style={[{ position: "relative" }, style]}>
      {fromTop && (
        <LinearGradient
          colors={
            themeContext === "dark"
              ? [colors.transparent, colors.justBlack]
              : [colors.transparent, "rgba(0,0,0,0.15)"]
          }
          style={{
            position: "absolute",
            top: -separatorHeight,
            left: 0,
            right: 0,
            height: separatorHeight,
          }}
        />
      )}

      {children}

      {!fromTop && (
        <LinearGradient
          colors={
            themeContext === "dark"
              ? [colors.justBlack, colors.transparent]
              : ["rgba(0,0,0,0.15)", colors.transparent]
          }
          style={{
            position: "absolute",
            bottom: -separatorHeight,
            left: 0,
            right: 0,
            height: separatorHeight,
          }}
          pointerEvents="none"
        />
      )}
    </View>
  )
}
