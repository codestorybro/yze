import React from "react"
import { View, StyleProp, ViewStyle, StyleSheet } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useAppTheme } from "@/theme/context"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useGroup } from "@/store/group"

type Props = {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
  heightMultiplier?: number
}

export function GradientSeparator({ children, style, heightMultiplier = 2.3 }: Props) {
  const {
    theme: { colors },
  } = useAppTheme()
  const { top } = useSafeAreaInsets()
  const { isSearchBarFocused } = useGroup()

  return (
    <View style={style}>
      <LinearGradient
        pointerEvents="none"
        colors={[
          colors.mainBackground,
          colors.mainBackground,
          colors.mainBackground,
          colors.transparent,
        ]}
        style={[
          styles.fade,
          { top: isSearchBarFocused ? -top : 0, height: top * heightMultiplier },
        ]}
      />
      {!isSearchBarFocused && children}
    </View>
  )
}

const styles = StyleSheet.create({
  fade: {
    position: "absolute",
    left: 0,
    right: 0,
  },
})
