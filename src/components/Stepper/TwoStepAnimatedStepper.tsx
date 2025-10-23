import React from "react"
import { View, ViewStyle, TextStyle, LayoutChangeEvent } from "react-native"
import Animated, { useSharedValue, withTiming, useAnimatedStyle } from "react-native-reanimated"
import { useAppTheme } from "@/theme/context"
import { Text } from "@/components/Text"
import { ThemedStyle } from "@/theme/types"
import Svg, { Circle } from "react-native-svg"
import { useAnimatedProps } from "react-native-reanimated"

interface TwoStepAnimatedStepperProps {
  step: 1 | 2
}

export const TwoStepAnimatedStepper: React.FC<TwoStepAnimatedStepperProps> = ({ step }) => {
  const {
    themed,
    theme: { colors },
  } = useAppTheme()
  const progress = useSharedValue(step === 1 ? 0 : 1)
  const lineWidthMeasured = useSharedValue(0)
  const CIRCLE_SIZE = 34
  const CIRCLE_RADIUS = CIRCLE_SIZE / 2
  const ringCircumference = 2 * Math.PI * (CIRCLE_RADIUS - 1)
  const LINE_PHASE_RATIO = 0.7

  React.useEffect(() => {
    progress.value = withTiming(step === 1 ? 0 : 1, { duration: 400 })
  }, [step])

  const onLineWrapperLayout = (e: LayoutChangeEvent) => {
    const { width } = e.nativeEvent.layout
    lineWidthMeasured.value = width
  }

  const lineAnimatedStyle = useAnimatedStyle(() => {
    const raw = progress.value / LINE_PHASE_RATIO
    const clamped = Math.min(raw, 1)
    return {
      width: lineWidthMeasured.value * clamped,
    }
  })

  const animatedCircleProps = useAnimatedProps(() => {
    const ringProgress = Math.max((progress.value - LINE_PHASE_RATIO) / (1 - LINE_PHASE_RATIO), 0)
    const dashOffset = ringCircumference * (1 - ringProgress)
    return {
      strokeDashoffset: dashOffset,
    }
  })

  return (
    <View style={themed($wrapper)}>
      <View style={themed($stepsWrapper)}>
        <Animated.View style={[themed($circle), { borderColor: colors.primary }]}>
          <Text preset="formLabel" style={themed($circleLabel)} text="1" />
        </Animated.View>
        <View style={themed($lineWrapper)} onLayout={onLineWrapperLayout}>
          <View style={themed($lineBase)} />
          <Animated.View style={[themed($lineProgress), lineAnimatedStyle]} />
        </View>
        <Animated.View style={themed($circle)}>
          <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE} style={themed($ringAbsolute)}>
            <AnimatedCircle
              cx={CIRCLE_RADIUS}
              cy={CIRCLE_RADIUS}
              r={CIRCLE_RADIUS - 1}
              stroke={colors.primary}
              strokeWidth={2}
              fill="none"
              strokeDasharray={ringCircumference}
              animatedProps={animatedCircleProps}
            />
          </Svg>
          <View style={themed($circleContent)}>
            <Text preset="formLabel" style={themed($circleLabel)} text="2" />
          </View>
        </Animated.View>
      </View>
    </View>
  )
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle)

const $wrapper: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  width: "100%",
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.xs,
})

const $stepsWrapper: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  alignItems: "center",
})

const $circle: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 34,
  height: 34,
  borderRadius: 17,
  borderWidth: 2,
  borderColor: colors.border,
  alignItems: "center",
  justifyContent: "center",
})

const $circleLabel: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
})

const $lineWrapper: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  height: 10,
  justifyContent: "center",
})

const $lineBase: ThemedStyle<ViewStyle> = ({ colors }) => ({
  position: "absolute",
  height: 2,
  left: 0,
  right: 0,
  backgroundColor: colors.border,
  overflow: "hidden",
})

const $lineProgress: ThemedStyle<ViewStyle> = ({ colors }) => ({
  position: "absolute",
  height: 2,
  left: 0,
  backgroundColor: colors.primary,
})

const $ringAbsolute: ThemedStyle<ViewStyle> = () => ({
  position: "absolute",
  top: 0,
  left: 0,
  transform: [{ translateX: -2 }, { translateY: -2 }, { rotate: "-180deg" }],
})

const $circleContent: ThemedStyle<ViewStyle> = () => ({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  alignItems: "center",
  justifyContent: "center",
})
