import { ComponentType, useCallback, useEffect, useMemo, useState } from "react"
import {
  Pressable,
  PressableProps,
  PressableStateCallbackType,
  StyleProp,
  TextStyle,
  ViewStyle,
} from "react-native"
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated"

import { useAppTheme } from "@/theme/context"
import { $styles } from "@/theme/styles"
import type { ThemedStyle, ThemedStyleArray } from "@/theme/types"

import { Text, TextProps } from "./Text"

type Presets = "default" | "error" | "reverse" | "navigation" | "floating"

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export interface ButtonAccessoryProps {
  style: StyleProp<any>
  pressableState: PressableStateCallbackType
  disabled?: boolean
}

export interface ButtonProps extends PressableProps {
  /**
   * Text which is looked up via i18n.
   */
  tx?: TextProps["tx"]
  /**
   * The text to display if not using `tx` or nested components.
   */
  text?: TextProps["text"]
  /**
   * Optional options to pass to i18n. Useful for interpolation
   * as well as explicitly setting locale or translation fallbacks.
   */
  txOptions?: TextProps["txOptions"]
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>
  /**
   * An optional style override for the "pressed" state.
   */
  pressedStyle?: StyleProp<ViewStyle>
  /**
   * An optional style override for the button text.
   */
  textStyle?: StyleProp<TextStyle>
  /**
   * An optional style override for the button text when in the "pressed" state.
   */
  pressedTextStyle?: StyleProp<TextStyle>
  /**
   * An optional style override for the button text when in the "disabled" state.
   */
  disabledTextStyle?: StyleProp<TextStyle>
  /**
   * One of the different types of button presets.
   */
  preset?: Presets
  /**
   * An optional component to render on the right side of the text.
   * Example: `RightAccessory={(props) => <View {...props} />}`
   */
  RightAccessory?: ComponentType<ButtonAccessoryProps>
  /**
   * An optional component to render on the left side of the text.
   * Example: `LeftAccessory={(props) => <View {...props} />}`
   */
  LeftAccessory?: ComponentType<ButtonAccessoryProps>
  /**
   * Children components.
   */
  children?: React.ReactNode
  /**
   * disabled prop, accessed directly for declarative styling reasons.
   * https://reactnative.dev/docs/pressable#disabled
   */
  disabled?: boolean
  /**
   * An optional style override for the disabled state
   */
  disabledStyle?: StyleProp<ViewStyle>
  /**
   * Disable the press scale animation when set to true.
   */
  disableAnimation?: boolean
}

/**
 * A component that allows users to take actions and make choices.
 * Wraps the Text component with a Pressable component.
 * @see [Documentation and Examples]{@link https://docs.infinite.red/ignite-cli/boilerplate/app/components/Button/}
 * @param {ButtonProps} props - The props for the `Button` component.
 * @returns {JSX.Element} The rendered `Button` component.
 * @example
 * <Button
 *   tx="common:confirm"
 *   style={styles.button}
 *   textStyle={styles.buttonText}
 *   onPress={handleButtonPress}
 * />
 */
export function Button(props: ButtonProps) {
  const {
    tx,
    text,
    txOptions,
    style: $viewStyleOverride,
    pressedStyle: $pressedViewStyleOverride,
    textStyle: $textStyleOverride,
    pressedTextStyle: $pressedTextStyleOverride,
    disabledTextStyle: $disabledTextStyleOverride,
    children,
    RightAccessory,
    LeftAccessory,
    disabled,
    disabledStyle: $disabledViewStyleOverride,
    disableAnimation = false,
    onPressIn,
    onPressOut,
    onHoverIn,
    onHoverOut,
    onFocus,
    onBlur,
    ...rest
  } = props

  const preset: Presets = props.preset ?? "default"
  const { themed } = useAppTheme()
  const [isPressed, setIsPressed] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const scale = useSharedValue(1)
  const animationDisabled = disableAnimation || !!disabled
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  useEffect(() => {
    if (animationDisabled) {
      scale.value = 1
    }
  }, [animationDisabled, scale])

  useEffect(() => {
    if (disabled) {
      setIsPressed(false)
      setIsHovered(false)
      setIsFocused(false)
    }
  }, [disabled])

  const handlePressIn = useCallback<NonNullable<PressableProps["onPressIn"]>>(
    (event) => {
      if (!animationDisabled) {
        scale.value = withSpring(1.06, { damping: 100, stiffness: 1000 })
      }
      setIsPressed(true)
      onPressIn?.(event)
    },
    [animationDisabled, onPressIn, scale],
  )

  const handlePressOut = useCallback<NonNullable<PressableProps["onPressOut"]>>(
    (event) => {
      if (!animationDisabled) {
        scale.value = withSpring(1, { damping: 100, stiffness: 1000 })
      }
      setIsPressed(false)
      onPressOut?.(event)
    },
    [animationDisabled, onPressOut, scale],
  )

  const handleHoverIn = useCallback<NonNullable<PressableProps["onHoverIn"]>>(
    (event) => {
      setIsHovered(true)
      onHoverIn?.(event)
    },
    [onHoverIn],
  )

  const handleHoverOut = useCallback<NonNullable<PressableProps["onHoverOut"]>>(
    (event) => {
      setIsHovered(false)
      onHoverOut?.(event)
    },
    [onHoverOut],
  )

  const handleFocus = useCallback<NonNullable<PressableProps["onFocus"]>>(
    (event) => {
      setIsFocused(true)
      onFocus?.(event)
    },
    [onFocus],
  )

  const handleBlur = useCallback<NonNullable<PressableProps["onBlur"]>>(
    (event) => {
      setIsFocused(false)
      onBlur?.(event)
    },
    [onBlur],
  )

  const pressableState = useMemo<PressableStateCallbackType>(
    () => ({ pressed: isPressed, hovered: isHovered, focused: isFocused }),
    [isFocused, isHovered, isPressed],
  )

  const baseViewStyle = useMemo(() => $viewStyle(pressableState), [pressableState])
  const baseViewStyleArray = useMemo(
    () => (Array.isArray(baseViewStyle) ? baseViewStyle : [baseViewStyle]),
    [baseViewStyle],
  )
  const finalViewStyle = animationDisabled
    ? baseViewStyleArray
    : [...baseViewStyleArray, animatedStyle]
  const textStateStyle = useMemo(() => $textStyle(pressableState), [pressableState])
  /**
   * @param {PressableStateCallbackType} root0 - The root object containing the pressed state.
   * @param {boolean} root0.pressed - The pressed state.
   * @returns {StyleProp<ViewStyle>} The view style based on the pressed state.
   */
  function $viewStyle({ pressed }: PressableStateCallbackType): StyleProp<ViewStyle> {
    return [
      themed($viewPresets[preset]),
      $viewStyleOverride,
      !!pressed && themed([$pressedViewPresets[preset], $pressedViewStyleOverride]),
      !!disabled && themed([$disabledViewPresets[preset], $disabledViewStyleOverride]),
    ]
  }
  /**
   * @param {PressableStateCallbackType} root0 - The root object containing the pressed state.
   * @param {boolean} root0.pressed - The pressed state.
   * @returns {StyleProp<TextStyle>} The text style based on the pressed state.
   */
  function $textStyle({ pressed }: PressableStateCallbackType): StyleProp<TextStyle> {
    return [
      themed($textPresets[preset]),
      $textStyleOverride,
      !!pressed && themed([$pressedTextPresets[preset], $pressedTextStyleOverride]),
      !!disabled && themed([$disabledTextPresets[preset], $disabledTextStyleOverride]),
    ]
  }

  return (
    <AnimatedPressable
      style={finalViewStyle}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      {...rest}
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onHoverIn={handleHoverIn}
      onHoverOut={handleHoverOut}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {!!LeftAccessory && (
        <LeftAccessory
          style={$leftAccessoryStyle}
          pressableState={pressableState}
          disabled={disabled}
        />
      )}

      <Text tx={tx} text={text} txOptions={txOptions} style={textStateStyle}>
        {children}
      </Text>

      {!!RightAccessory && (
        <RightAccessory
          style={$rightAccessoryStyle}
          pressableState={pressableState}
          disabled={disabled}
        />
      )}
    </AnimatedPressable>
  )
}

const $baseViewStyle: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  minHeight: 56,
  borderRadius: spacing.xl,
  justifyContent: "center",
  alignItems: "center",
  paddingVertical: spacing.sm,
  paddingHorizontal: spacing.sm,
  overflow: "hidden",
})

const $baseTextStyle: ThemedStyle<TextStyle> = ({ typography, colors }) => ({
  fontSize: 16,
  lineHeight: 20,
  fontFamily: typography.primary.medium,
  textAlign: "center",
  flexShrink: 1,
  color: colors.textReversed,
  flexGrow: 0,
  zIndex: 2,
})

const $rightAccessoryStyle: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginStart: spacing.xs,
  zIndex: 1,
})
const $leftAccessoryStyle: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginEnd: spacing.xs,
  zIndex: 1,
})

const $viewPresets: Record<Presets, ThemedStyleArray<ViewStyle>> = {
  default: [
    $styles.row,
    $baseViewStyle,
    ({ colors }) => ({
      backgroundColor: colors.primary,
    }),
  ],
  error: [$styles.row, $baseViewStyle, ({ colors }) => ({ backgroundColor: colors.error })],
  reverse: [
    $styles.row,
    $baseViewStyle,
    ({ colors }) => ({
      backgroundColor: colors.transparent,
      borderColor: colors.primary,
      borderWidth: 1,
    }),
  ],
  navigation: [
    $styles.row,
    $baseViewStyle,
    ({ colors }) => ({
      backgroundColor: colors.transparent,
    }),
  ],
  floating: [
    $styles.row,
    $baseViewStyle,
    ({ colors }) => ({
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      boxShadow: `0px 0px 12px ${colors.shadow}`,
    }),
  ],
}

const $textPresets: Record<Presets, ThemedStyleArray<TextStyle>> = {
  default: [$baseTextStyle],
  error: [$baseTextStyle],
  reverse: [$baseTextStyle, ({ colors }) => ({ color: colors.primary })],
  navigation: [$baseTextStyle, ({ colors }) => ({ color: colors.primary })],
  floating: [$baseTextStyle, ({ colors }) => ({ color: colors.text })],
}

const $pressedViewPresets: Record<Presets, ThemedStyle<ViewStyle>> = {
  default: ({ colors }) => ({ backgroundColor: colors.primaryPressed }),
  error: ({ colors }) => ({ backgroundColor: colors.errorPressed }),
  reverse: ({ colors }) => ({ backgroundColor: colors.transparentPressed }),
  navigation: ({}) => ({}),
  floating: ({ colors }) => ({ backgroundColor: colors.floatingButtonPressed }),
}

const $pressedTextPresets: Record<Presets, ThemedStyle<TextStyle>> = {
  default: () => ({ opacity: 0.9 }),
  error: () => ({ opacity: 0.9 }),
  reverse: () => ({ opacity: 0.9 }),
  navigation: ({ colors }) => ({ opacity: 0.9, color: colors.primary }),
  floating: () => ({ opacity: 0.9 }),
}

const $disabledViewPresets: Record<Presets, ThemedStyle<ViewStyle>> = {
  default: ({ colors }) => ({ backgroundColor: colors.disabled }),
  error: ({ colors }) => ({ backgroundColor: colors.disabled }),
  reverse: ({ colors }) => ({
    borderColor: colors.disabled,
    backgroundColor: colors.transparentPressed,
  }),
  navigation: ({ colors }) => ({ backgroundColor: colors.transparent }),
  floating: ({ colors }) => ({ backgroundColor: colors.disabled }),
}

const $disabledTextPresets: Record<Presets, ThemedStyle<TextStyle>> = {
  default: ({ colors }) => ({ color: colors.textDim }),
  error: ({ colors }) => ({ color: colors.textDim }),
  reverse: ({ colors }) => ({ color: colors.textDim }),
  navigation: ({ colors }) => ({ color: colors.disabled }),
  floating: ({ colors }) => ({ color: colors.textDim }),
}
