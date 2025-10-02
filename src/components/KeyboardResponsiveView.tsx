import { ReactNode, useEffect } from "react"
import { Keyboard, KeyboardEvent, Platform, StyleProp, ViewProps, ViewStyle } from "react-native"
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  WithTimingConfig,
} from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"

const AnimatedView = Animated.View

const DEFAULT_ANIMATION: WithTimingConfig = {
  duration: Platform.select({ ios: 220, android: 180, default: 200 }),
}

export interface KeyboardResponsiveViewProps extends Omit<ViewProps, "style"> {
  children: ReactNode
  /**
   * Custom style applied to the animated container.
   */
  style?: StyleProp<ViewStyle>
  /**
   * Whether the component should react to keyboard changes.
   * Defaults to `true`.
   */
  enabled?: boolean
  /**
   * Extra offset subtracted from the keyboard height. Useful when there is
   * already padding/margin applied to the wrapped content.
   */
  keyboardOffset?: number
  /**
   * Additional distance added on top of the calculated keyboard height shift.
   * Useful when the focused input still touches or is obscured by the keyboard.
   */
  extraShift?: number
  /**
   * Optional animation config passed to `withTiming`.
   */
  animationConfig?: WithTimingConfig
}

/**
 * Lifts its children when the software keyboard is visible without
 * affecting the rest of the layout tree. Works across iOS and Android and
 * avoids the black bar artefact caused by `KeyboardAvoidingView` on Android.
 */
export function KeyboardResponsiveView(props: KeyboardResponsiveViewProps) {
  const {
    children,
    style,
    enabled = true,
    keyboardOffset = 0,
    extraShift = 0,
    animationConfig = DEFAULT_ANIMATION,
    ...rest
  } = props

  const { bottom: safeBottom } = useSafeAreaInsets()

  const translateY = useSharedValue(0)

  useEffect(() => {
    if (!enabled) {
      translateY.value = withTiming(0, animationConfig)
      return
    }

    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow"
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide"

    const handleShow = (event: KeyboardEvent) => {
      const keyboardHeight = event.endCoordinates?.height ?? 0
      const adjustedHeight = Math.max(0, keyboardHeight - safeBottom)
      const shiftAmount = Math.max(0, adjustedHeight - keyboardOffset + extraShift)

      translateY.value = withTiming(-shiftAmount, animationConfig)
    }

    const handleHide = (event: KeyboardEvent) => {
      translateY.value = withTiming(0, animationConfig)
    }

    const showSubscription = Keyboard.addListener(showEvent, handleShow)
    const hideSubscription = Keyboard.addListener(hideEvent, handleHide)

    return () => {
      showSubscription.remove()
      hideSubscription.remove()
    }
  }, [animationConfig, enabled, extraShift, keyboardOffset, safeBottom, translateY])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }))

  return (
    <AnimatedView style={[style, animatedStyle]} {...rest}>
      {children}
    </AnimatedView>
  )
}
