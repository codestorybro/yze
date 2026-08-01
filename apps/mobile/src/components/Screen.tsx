import { ReactNode, useRef } from "react"
import {
  KeyboardAvoidingView,
  KeyboardAvoidingViewProps,
  Platform,
  ScrollView,
  ScrollViewProps,
  StyleProp,
  View,
  ViewStyle,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { StatusBar, StatusBarProps, StatusBarStyle } from "expo-status-bar"
import { useScrollToTop } from "expo-router/react-navigation"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { useAppTheme } from "@/theme/context"
import { $styles } from "@/theme/styles"
import { ExtendedEdge, useSafeAreaInsetsStyle } from "@/utils/useSafeAreaInsetsStyle"

import { useScreenChrome } from "./ScreenChromeContext"

interface BaseScreenProps {
  /**
   * Children components.
   */
  children?: ReactNode
  /**
   * Style for the outer content container useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>
  /**
   * Style for the inner content container useful for padding & margin.
   */
  contentContainerStyle?: StyleProp<ViewStyle>
  /**
   * Override the default edges for the safe area. Defaults to top and bottom.
   */
  safeAreaEdges?: ExtendedEdge[]
  /**
   * Fade scrolling content beneath the status area. Defaults to true for scrolling screens.
   */
  topEdgeFade?: boolean
  /**
   * Standard end-of-content breathing room, independent from the native tab-bar inset.
   */
  bottomClearance?: "standard" | "none"
  /**
   * Background color
   */
  backgroundColor?: string
  /**
   * System bar setting. Defaults to dark.
   */
  systemBarStyle?: StatusBarStyle
  /**
   * By how much should we offset the keyboard? Defaults to 0.
   */
  keyboardOffset?: number
  /**
   * Pass any additional props directly to the StatusBar component.
   */
  StatusBarProps?: StatusBarProps
  /**
   * Pass any additional props directly to the KeyboardAvoidingView component.
   */
  KeyboardAvoidingViewProps?: KeyboardAvoidingViewProps
}

interface FixedScreenProps extends BaseScreenProps {
  preset?: "fixed"
}
interface ScrollScreenProps extends BaseScreenProps {
  preset?: "scroll"
  /**
   * Should keyboard persist on screen tap. Defaults to handled.
   * Only applies to scroll preset.
   */
  keyboardShouldPersistTaps?: "handled" | "always" | "never"
  /**
   * Pass any additional props directly to the ScrollView component.
   */
  ScrollViewProps?: ScrollViewProps
}

interface AutoScreenProps extends Omit<ScrollScreenProps, "preset"> {
  preset?: "auto"
}

interface ScrollingScreenImplementationProps extends ScrollScreenProps {
  bottomContentInset: number
  topContentInset: number
}

export type ScreenProps = ScrollScreenProps | FixedScreenProps | AutoScreenProps

const isIos = Platform.OS === "ios"

type ScreenPreset = "fixed" | "scroll" | "auto"

/**
 * @param {ScreenPreset?} preset - The preset to check.
 * @returns {boolean} - Whether the preset is non-scrolling.
 */
function isNonScrolling(preset?: ScreenPreset) {
  return !preset || preset === "fixed"
}

/**
 * @param {ScreenProps} props - The props for the `ScreenWithoutScrolling` component.
 * @returns {JSX.Element} - The rendered `ScreenWithoutScrolling` component.
 */
function ScreenWithoutScrolling(props: ScreenProps) {
  const { style, contentContainerStyle, children, preset } = props
  return (
    <View style={[$outerStyle, style]}>
      <View style={[$innerStyle, preset === "fixed" && $justifyFlexEnd, contentContainerStyle]}>
        {children}
      </View>
    </View>
  )
}

/**
 * @param {ScreenProps} props - The props for the `ScreenWithScrolling` component.
 * @returns {JSX.Element} - The rendered `ScreenWithScrolling` component.
 */
function ScreenWithScrolling(props: ScrollingScreenImplementationProps) {
  const {
    children,
    keyboardShouldPersistTaps = "handled",
    contentContainerStyle,
    ScrollViewProps,
    style,
    topContentInset = 0,
    bottomContentInset = 0,
  } = props
  const {
    automaticallyAdjustContentInsets = true,
    automaticallyAdjustsScrollIndicatorInsets = true,
    contentContainerStyle: scrollContentContainerStyle,
    contentInsetAdjustmentBehavior = "automatic",
    style: scrollStyle,
    ...scrollViewProps
  } = ScrollViewProps ?? {}

  const ref = useRef<ScrollView>(null)

  // Add native behavior of pressing the active tab to scroll to the top of the content
  // More info at: https://reactnavigation.org/docs/use-scroll-to-top/
  useScrollToTop(ref)

  return (
    <ScrollView
      {...scrollViewProps}
      ref={ref}
      automaticallyAdjustContentInsets={automaticallyAdjustContentInsets}
      automaticallyAdjustsScrollIndicatorInsets={automaticallyAdjustsScrollIndicatorInsets}
      contentInsetAdjustmentBehavior={contentInsetAdjustmentBehavior}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      style={[$outerStyle, scrollStyle, style]}
      contentContainerStyle={[$scrollContentContainer, scrollContentContainerStyle]}
    >
      {topContentInset > 0 ? (
        <View style={{ height: topContentInset }} testID="screen-top-content-inset" />
      ) : null}
      <View style={[$innerStyle, $scrollInnerStyle, contentContainerStyle]}>{children}</View>
      {bottomContentInset > 0 ? (
        <View style={{ height: bottomContentInset }} testID="screen-bottom-content-inset" />
      ) : null}
    </ScrollView>
  )
}

export function resolveContainerSafeAreaEdges(
  safeAreaEdges: ExtendedEdge[],
  scrolling: boolean,
  nativeTabs: boolean,
  platform: typeof Platform.OS,
) {
  const nativeTabsOwnBottomInset =
    nativeTabs && (platform === "android" || (platform === "ios" && scrolling))

  return safeAreaEdges.filter((edge) => {
    if (scrolling && edge === "top") return false
    if (nativeTabsOwnBottomInset && edge === "bottom") return false
    return true
  })
}

/**
 * Represents a screen component that provides a consistent layout and behavior for different screen presets.
 * The `Screen` component can be used with different presets such as "fixed", "scroll", or "auto".
 * It handles safe area insets, status bar settings, keyboard avoiding behavior, and scrollability based on the preset.
 * @see [Documentation and Examples]{@link https://docs.infinite.red/ignite-cli/boilerplate/app/components/Screen/}
 * @param {ScreenProps} props - The props for the `Screen` component.
 * @returns {JSX.Element} The rendered `Screen` component.
 */
export function Screen(props: ScreenProps) {
  const {
    theme: { colors, spacing },
    themeContext,
  } = useAppTheme()
  const {
    backgroundColor,
    bottomClearance = "standard",
    KeyboardAvoidingViewProps,
    keyboardOffset = 0,
    safeAreaEdges = $defaultSafeAreaEdges,
    StatusBarProps,
    systemBarStyle,
    topEdgeFade = true,
  } = props
  const insets = useSafeAreaInsets()
  const { nativeTabs } = useScreenChrome()
  const scrolling = !isNonScrolling(props.preset)
  const containerSafeAreaEdges = resolveContainerSafeAreaEdges(
    safeAreaEdges,
    scrolling,
    nativeTabs,
    Platform.OS,
  )
  const shouldRespectTopEdge = safeAreaEdges.includes("top")
  const shouldFadeTopEdge = scrolling && topEdgeFade && shouldRespectTopEdge
  const screenBackground = backgroundColor || colors.background
  const fadeDepth = shouldFadeTopEdge ? spacing.lg : 0
  const topContentInset = scrolling
    ? (isIos ? 0 : shouldRespectTopEdge ? insets.top : 0) + fadeDepth
    : 0
  const bottomContentInset = scrolling && bottomClearance === "standard" ? spacing.xl : 0
  const topFadeHeight = insets.top + spacing.lg
  const topFadeStop = topFadeHeight > 0 ? insets.top / topFadeHeight : 0
  const transparentScreenBackground = toTransparentColor(screenBackground)

  const $containerInsets = useSafeAreaInsetsStyle(containerSafeAreaEdges)

  return (
    <View style={[$containerStyle, { backgroundColor: screenBackground }, $containerInsets]}>
      <StatusBar
        style={systemBarStyle || (themeContext === "dark" ? "light" : "dark")}
        {...StatusBarProps}
      />

      <KeyboardAvoidingView
        behavior={isIos ? "padding" : "height"}
        keyboardVerticalOffset={keyboardOffset}
        {...KeyboardAvoidingViewProps}
        style={[$styles.flex1, KeyboardAvoidingViewProps?.style]}
      >
        {isNonScrolling(props.preset) ? (
          <ScreenWithoutScrolling {...props} />
        ) : (
          <ScreenWithScrolling
            {...(props as ScrollScreenProps)}
            topContentInset={topContentInset}
            bottomContentInset={bottomContentInset}
          />
        )}
      </KeyboardAvoidingView>

      {shouldFadeTopEdge && insets.top > 0 ? (
        <LinearGradient
          accessible={false}
          colors={[screenBackground, screenBackground, transparentScreenBackground]}
          locations={[0, topFadeStop, 1]}
          pointerEvents="none"
          style={[$topEdgeFade, { height: topFadeHeight }]}
          testID="screen-top-edge-fade"
        />
      ) : null}
    </View>
  )
}

const $defaultSafeAreaEdges: ExtendedEdge[] = ["top", "bottom"]

const $containerStyle: ViewStyle = {
  flex: 1,
  height: "100%",
  width: "100%",
}

const $outerStyle: ViewStyle = {
  flex: 1,
  height: "100%",
  width: "100%",
}

const $justifyFlexEnd: ViewStyle = {
  justifyContent: "flex-end",
}

const $innerStyle: ViewStyle = {
  flex: 1,
  justifyContent: "flex-start",
  alignItems: "stretch",
}

const $scrollContentContainer: ViewStyle = {
  flexGrow: 1,
}

const $scrollInnerStyle: ViewStyle = {
  flexGrow: 1,
}

const $topEdgeFade: ViewStyle = {
  position: "absolute",
  top: 0,
  right: 0,
  left: 0,
  zIndex: 1,
}

function toTransparentColor(color: string) {
  const hex = color.match(/^#([\da-f]{6})(?:[\da-f]{2})?$/i)

  return hex ? `#${hex[1]}00` : color
}
