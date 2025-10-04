import { View, ViewStyle, StyleSheet } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"

import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"

import { Screen, ScreenProps } from "./Screen"

export function LoggedScreenWrapper({
  contentContainerStyle,
  children,
  preset = "scroll",
  ...props
}: ScreenProps) {
  const {
    themed,
    theme: { spacing, colors },
  } = useAppTheme()
  const { top, bottom } = useSafeAreaInsets()

  return (
    <View style={{ flex: 1 }}>
      <Screen
        preset={preset}
        contentContainerStyle={[
          themed($container),
          preset !== "fixed" && { paddingBottom: spacing.lg },
          preset !== "fixed" && { paddingTop: top, paddingBottom: bottom + spacing.xxxxl },
          contentContainerStyle,
        ]}
        {...props}
      >
        {children}
      </Screen>

      <LinearGradient
        pointerEvents="none"
        colors={[colors.mainBackground, colors.transparent]}
        style={[styles.fade, { top: 0, height: spacing.xxxl - spacing.xxs }]}
      />

      <LinearGradient
        pointerEvents="none"
        colors={[colors.transparent, colors.mainBackground]}
        style={[styles.fade, { bottom: 0, height: spacing.xxxxl * 1.3 }]}
      />
    </View>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginHorizontal: spacing.lg,
})

const styles = StyleSheet.create({
  fade: {
    position: "absolute",
    left: 0,
    right: 0,
  },
})
