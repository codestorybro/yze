import { ReactNode, forwardRef, ForwardedRef } from "react"
// eslint-disable-next-line no-restricted-imports
import { StyleProp, Text as RNText, TextProps as RNTextProps, TextStyle } from "react-native"
import { TOptions } from "i18next"

import { isRTL, TxKeyPath } from "@/i18n"
import { translate } from "@/i18n/translate"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle, ThemedStyleArray } from "@/theme/types"
import { typography } from "@/theme/typography"

type Sizes = keyof typeof $sizeStyles
type Weights = keyof typeof typography.primary
type Presets =
  | "default"
  | "bold"
  | "display"
  | "title"
  | "heading"
  | "section"
  | "subheading"
  | "label"
  | "eyebrow"
  | "caption"
  | "formLabel"
  | "formHelper"

export interface TextProps extends RNTextProps {
  /**
   * Text which is looked up via i18n.
   */
  tx?: TxKeyPath
  /**
   * The text to display if not using `tx` or nested components.
   */
  text?: string
  /**
   * Optional options to pass to i18n. Useful for interpolation
   * as well as explicitly setting locale or translation fallbacks.
   */
  txOptions?: TOptions
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<TextStyle>
  /**
   * One of the different types of text presets.
   */
  preset?: Presets
  /**
   * Text weight modifier.
   */
  weight?: Weights
  /**
   * Text size modifier.
   */
  size?: Sizes
  /**
   * Children components.
   */
  children?: ReactNode
}

/**
 * For your text displaying needs.
 * This component is a HOC over the built-in React Native one.
 * @see [Documentation and Examples]{@link https://docs.infinite.red/ignite-cli/boilerplate/app/components/Text/}
 * @param {TextProps} props - The props for the `Text` component.
 * @returns {JSX.Element} The rendered `Text` component.
 */
export const Text = forwardRef(function Text(props: TextProps, ref: ForwardedRef<RNText>) {
  const { weight, size, tx, txOptions, text, children, style: $styleOverride, ...rest } = props
  const { themed } = useAppTheme()

  const i18nText = tx && translate(tx, txOptions)
  const content = i18nText || text || children

  const preset: Presets = props.preset ?? "default"
  const $styles: StyleProp<TextStyle> = [
    $rtlStyle,
    themed($presets[preset]),
    weight && $fontWeightStyles[weight],
    size && $sizeStyles[size],
    $styleOverride,
  ]

  return (
    <RNText {...rest} style={$styles} ref={ref}>
      {content}
    </RNText>
  )
})

const $sizeStyles = {
  xxl: { fontSize: 40, lineHeight: 44 } satisfies TextStyle,
  xl: { fontSize: 30, lineHeight: 36 } satisfies TextStyle,
  lg: { fontSize: 20, lineHeight: 26 } satisfies TextStyle,
  md: { fontSize: 18, lineHeight: 26 } satisfies TextStyle,
  sm: { fontSize: 16, lineHeight: 24 } satisfies TextStyle,
  xs: { fontSize: 14, lineHeight: 20 } satisfies TextStyle,
  xxs: { fontSize: 12, lineHeight: 16 } satisfies TextStyle,
}

const $fontWeightStyles = Object.entries(typography.primary).reduce((acc, [weight, fontFamily]) => {
  return { ...acc, [weight]: { fontFamily } }
}, {}) as Record<Weights, TextStyle>

const $baseStyle: ThemedStyle<TextStyle> = (theme) => ({
  ...$sizeStyles.sm,
  ...$fontWeightStyles.normal,
  color: theme.colors.text,
})

const $presets: Record<Presets, ThemedStyleArray<TextStyle>> = {
  default: [$baseStyle],
  bold: [$baseStyle, { ...$fontWeightStyles.bold }],
  display: [
    $baseStyle,
    {
      ...$sizeStyles.xxl,
      ...$fontWeightStyles.semiBold,
      letterSpacing: -1.5,
    },
  ],
  title: [$baseStyle, { ...$sizeStyles.xl, ...$fontWeightStyles.semiBold, letterSpacing: -0.8 }],
  heading: [$baseStyle, { ...$sizeStyles.xl, ...$fontWeightStyles.semiBold, letterSpacing: -0.8 }],
  section: [$baseStyle, { ...$sizeStyles.lg, ...$fontWeightStyles.semiBold, letterSpacing: -0.2 }],
  subheading: [
    $baseStyle,
    { ...$sizeStyles.lg, ...$fontWeightStyles.semiBold, letterSpacing: -0.2 },
  ],
  label: [$baseStyle, { ...$sizeStyles.xs, ...$fontWeightStyles.medium }],
  eyebrow: [
    $baseStyle,
    {
      ...$sizeStyles.xxs,
      ...$fontWeightStyles.semiBold,
      letterSpacing: 1.2,
      textTransform: "uppercase",
    },
  ],
  caption: [$baseStyle, { ...$sizeStyles.xxs, ...$fontWeightStyles.medium }],
  formLabel: [$baseStyle, { ...$sizeStyles.xs, ...$fontWeightStyles.medium }],
  formHelper: [$baseStyle, { ...$sizeStyles.xs, ...$fontWeightStyles.normal }],
}
const $rtlStyle: TextStyle = isRTL ? { writingDirection: "rtl" } : {}
