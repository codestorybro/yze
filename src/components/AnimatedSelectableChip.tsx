import React, { useEffect, useState, useCallback } from "react"
import { Pressable, StyleSheet, ViewStyle, TextStyle, PressableProps } from "react-native"
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated"
import { Text } from "./Text"
import { useAppTheme } from "@/theme/context"

export interface AnimatedSelectableChipProps {
  label: string
  selected: boolean
  onToggle: () => void
  accentColor?: string
  disabled?: boolean
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export function AnimatedSelectableChip({
  label,
  selected,
  onToggle,
  accentColor,
  disabled = false,
}: AnimatedSelectableChipProps) {
  const {
    theme: { colors, spacing },
  } = useAppTheme()
  const [isPressed, setIsPressed] = useState(false)
  const scale = useSharedValue(1)
  const bg = useSharedValue(selected ? (accentColor ?? colors.primary) : colors.cardBackground)

  useEffect(() => {
    bg.value = withSpring(selected ? (accentColor ?? colors.primary) : colors.cardBackground, {
      damping: 80,
      stiffness: 500,
    })
    if (!isPressed) {
      scale.value = withSpring(1, { damping: 80, stiffness: 800 })
    }
  }, [
    selected,
    accentColor,
    bg,
    colors.primary,
    colors.cardBackground,
    colors.text,
    colors.justWhite,
    isPressed,
    scale,
  ])

  const handlePressIn = useCallback<NonNullable<PressableProps["onPressIn"]>>(
    (e) => {
      setIsPressed(true)
      scale.value = withSpring(1.06, { damping: 100, stiffness: 1000 })
    },
    [scale],
  )

  const handlePressOut = useCallback<NonNullable<PressableProps["onPressOut"]>>(
    (e) => {
      setIsPressed(false)
      scale.value = withSpring(1, { damping: 100, stiffness: 1000 })
    },
    [scale],
  )

  const animatedStyle = useAnimatedStyle<ViewStyle>(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: bg.value as string,
  }))

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onToggle}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[
        styles.container,
        {
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.xs,
          borderRadius: spacing.lg,
          opacity: disabled ? 0.5 : 1,
          shadowColor: colors.shadow,
        },
        animatedStyle,
      ]}
    >
      <Text
        text={label}
        weight="medium"
        numberOfLines={1}
        style={[
          styles.label,
          {
            color: colors.text,
          } as TextStyle,
        ]}
      />
    </AnimatedPressable>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    fontSize: 14,
  },
})
