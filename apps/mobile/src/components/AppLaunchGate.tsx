import type { PropsWithChildren } from "react"
import { useCallback, useEffect, useRef, useState } from "react"
import type {
  ImageSourcePropType,
  ImageStyle,
  LayoutChangeEvent,
  LayoutRectangle,
  ViewStyle,
} from "react-native"
import { View } from "react-native"
import * as SplashScreen from "expo-splash-screen"
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated"
import { scheduleOnRN } from "react-native-worklets"

import { useAppTheme } from "@/theme/context"
import { timing } from "@/theme/timing"

interface AppLaunchGateProps extends PropsWithChildren {
  ready: boolean
  /** Deterministic override for tests and component previews. */
  reducedMotion?: boolean
}

interface RevealGeometry {
  diameter: number
  left: number
  top: number
}

const splashImages: Record<"light" | "dark", ImageSourcePropType> = {
  light: require("../../assets/images/brand/yze-splash-light.png"),
  dark: require("../../assets/images/brand/yze-splash-dark.png"),
}

const NATIVE_HANDOFF_OPTIONS = { duration: 0, fade: false } as const
const LOGO_SIZE = 240
const LOGO_DOT_SIZE = 8
const LOGO_DOT_Y_OFFSET = -14
const REVEAL_OVERLAP = 80
const ARTWORK_LOAD_TIMEOUT = 1_000

export function getRevealGeometry(
  layout: Pick<LayoutRectangle, "height" | "width">,
  progress: number,
): RevealGeometry {
  "worklet"

  const originX = layout.width / 2
  const originY = layout.height / 2 + LOGO_DOT_Y_OFFSET
  const radius = Math.max(
    Math.hypot(originX, originY),
    Math.hypot(layout.width - originX, originY),
    Math.hypot(originX, layout.height - originY),
    Math.hypot(layout.width - originX, layout.height - originY),
  )
  const diameter = (radius + 2) * 2 * progress

  return {
    diameter,
    left: originX - diameter / 2,
    top: originY - diameter / 2,
  }
}

/**
 * Performs a seamless native-to-JS handoff, folds the Yze mark into its signal point, then reveals
 * the already-mounted application through a circle growing from that point.
 */
export function AppLaunchGate({ children, ready, reducedMotion }: AppLaunchGateProps) {
  const {
    theme: { colors },
    themeContext,
  } = useAppTheme()
  const systemReducedMotion = useReducedMotion()
  const shouldReduceMotion = reducedMotion ?? systemReducedMotion
  const [layout, setLayout] = useState<LayoutRectangle>()
  const [logoReady, setLogoReady] = useState(false)
  const [animationComplete, setAnimationComplete] = useState(false)
  const didStart = useRef(false)
  const didFinish = useRef(false)
  const artworkTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const animationWatchdog = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const foldProgress = useSharedValue(0)
  const revealProgress = useSharedValue(0)

  const finishAnimation = useCallback(() => {
    if (animationWatchdog.current) {
      clearTimeout(animationWatchdog.current)
      animationWatchdog.current = undefined
    }
    if (didFinish.current) return

    didFinish.current = true
    foldProgress.set(1)
    revealProgress.set(1)
    setAnimationComplete(true)
  }, [foldProgress, revealProgress])

  const markLogoReady = useCallback(() => {
    if (artworkTimeout.current) {
      clearTimeout(artworkTimeout.current)
      artworkTimeout.current = undefined
    }
    setLogoReady(true)
  }, [])

  useEffect(() => {
    SplashScreen.setOptions(NATIVE_HANDOFF_OPTIONS)
  }, [])

  useEffect(() => {
    if (!ready || !layout || logoReady || artworkTimeout.current) return undefined

    artworkTimeout.current = setTimeout(() => {
      artworkTimeout.current = undefined
      setLogoReady(true)
    }, ARTWORK_LOAD_TIMEOUT)

    return undefined
  }, [layout, logoReady, ready])

  useEffect(
    () => () => {
      if (artworkTimeout.current) clearTimeout(artworkTimeout.current)
      if (animationWatchdog.current) clearTimeout(animationWatchdog.current)
    },
    [],
  )

  useEffect(() => {
    if (!ready || !layout || !logoReady || animationComplete || didStart.current) return undefined

    didStart.current = true
    SplashScreen.hide()

    if (shouldReduceMotion) {
      foldProgress.set(1)
      revealProgress.set(1)
      animationWatchdog.current = setTimeout(finishAnimation, 0)
      return undefined
    }

    animationWatchdog.current = setTimeout(
      finishAnimation,
      timing.launchHold + timing.launchFold + timing.launchReveal + 1_000,
    )
    foldProgress.set(
      withDelay(
        timing.launchHold,
        withTiming(1, {
          duration: timing.launchFold,
          easing: Easing.bezier(0.22, 1, 0.36, 1),
        }),
      ),
    )
    revealProgress.set(
      withDelay(
        timing.launchHold + timing.launchFold - REVEAL_OVERLAP,
        withTiming(
          1,
          {
            duration: timing.launchReveal,
            easing: Easing.bezier(0.76, 0, 0.24, 1),
          },
          (finished) => {
            if (finished) scheduleOnRN(finishAnimation)
          },
        ),
      ),
    )

    return undefined
  }, [
    animationComplete,
    finishAnimation,
    foldProgress,
    layout,
    logoReady,
    ready,
    revealProgress,
    shouldReduceMotion,
  ])

  const $appReveal = useAnimatedStyle(() => {
    if (!layout) return { height: 0, opacity: 0, width: 0 }

    if (shouldReduceMotion || revealProgress.value >= 1) {
      return {
        borderRadius: 0,
        height: layout.height,
        left: 0,
        opacity: 1,
        overflow: "visible",
        top: 0,
        width: layout.width,
      }
    }

    const geometry = getRevealGeometry(layout, revealProgress.value)

    return {
      borderRadius: geometry.diameter / 2,
      height: geometry.diameter,
      left: geometry.left,
      opacity: 1,
      overflow: "hidden",
      top: geometry.top,
      width: geometry.diameter,
    }
  }, [layout, shouldReduceMotion])

  const $appContentPosition = useAnimatedStyle(() => {
    if (!layout) return { height: 0, width: 0 }
    if (shouldReduceMotion || revealProgress.value >= 1) {
      return { height: layout.height, left: 0, top: 0, width: layout.width }
    }

    const geometry = getRevealGeometry(layout, revealProgress.value)

    return {
      height: layout.height,
      left: -geometry.left,
      top: -geometry.top,
      width: layout.width,
    }
  }, [layout, shouldReduceMotion])

  const $foldingLogo = useAnimatedStyle(() => {
    const progress = foldProgress.value

    return {
      opacity: interpolate(progress, [0, 0.78, 1], [1, 1, 0], Extrapolation.CLAMP),
      transform: [
        { perspective: 900 },
        { rotateX: `${interpolate(progress, [0, 1], [0, 76])}deg` },
        { scaleX: interpolate(progress, [0, 0.58, 1], [1, 0.92, 0.08]) },
        { scaleY: interpolate(progress, [0, 0.58, 1], [1, 0.98, 0.14]) },
      ],
    }
  })

  const $signalDot = useAnimatedStyle(() => ({
    opacity: interpolate(revealProgress.value, [0, 0.16], [1, 0], Extrapolation.CLAMP),
    transform: [
      {
        scale: interpolate(foldProgress.value, [0, 0.72, 1], [1, 1.08, 1.24], Extrapolation.CLAMP),
      },
    ],
  }))

  const onLayout = (event: LayoutChangeEvent) => {
    const nextLayout = event.nativeEvent.layout

    setLayout((currentLayout) =>
      currentLayout?.height === nextLayout.height && currentLayout.width === nextLayout.width
        ? currentLayout
        : nextLayout,
    )
  }

  const $reducedMotionReveal = layout
    ? {
        borderRadius: 0,
        height: layout.height,
        left: 0,
        opacity: 1,
        overflow: "visible" as const,
        top: 0,
        width: layout.width,
      }
    : undefined
  const $reducedMotionContent = layout
    ? { height: layout.height, left: 0, top: 0, width: layout.width }
    : undefined

  return (
    <View
      collapsable={false}
      onLayout={onLayout}
      style={[$container, { backgroundColor: colors.background }]}
      testID="app-launch-root"
    >
      {ready && layout ? (
        <Animated.View
          accessibilityElementsHidden={!animationComplete}
          importantForAccessibility={animationComplete ? "auto" : "no-hide-descendants"}
          pointerEvents={animationComplete ? "auto" : "none"}
          style={[$revealWindow, shouldReduceMotion ? $reducedMotionReveal : $appReveal]}
          testID="app-launch-content"
        >
          <Animated.View
            style={[
              $appContentFrame,
              shouldReduceMotion ? $reducedMotionContent : $appContentPosition,
            ]}
          >
            {children}
          </Animated.View>
        </Animated.View>
      ) : null}

      {!animationComplete ? (
        <View
          accessible={false}
          pointerEvents="none"
          style={[
            $launchArtwork,
            shouldReduceMotion ? { backgroundColor: colors.background } : undefined,
          ]}
          testID="app-launch-artwork"
        >
          <Animated.Image
            accessibilityIgnoresInvertColors
            fadeDuration={0}
            onError={markLogoReady}
            onLoad={markLogoReady}
            resizeMode="contain"
            source={splashImages[themeContext]}
            style={[$logo, $foldingLogo]}
            testID="app-launch-logo"
          />
          <Animated.View
            style={[$dot, { backgroundColor: colors.signal }, $signalDot]}
            testID="app-launch-signal"
          />
        </View>
      ) : null}
    </View>
  )
}

const $container: ViewStyle = {
  flex: 1,
  overflow: "hidden",
}

const $revealWindow: ViewStyle = {
  position: "absolute",
  zIndex: 1,
}

const $appContentFrame: ViewStyle = {
  position: "absolute",
}

const $launchArtwork: ViewStyle = {
  position: "absolute",
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  alignItems: "center",
  justifyContent: "center",
  zIndex: 2,
}

const $logo: ImageStyle = {
  height: LOGO_SIZE,
  transformOrigin: [LOGO_SIZE / 2, LOGO_SIZE / 2 + LOGO_DOT_Y_OFFSET, 0],
  width: LOGO_SIZE,
}

const $dot: ViewStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  width: LOGO_DOT_SIZE,
  height: LOGO_DOT_SIZE,
  marginTop: LOGO_DOT_Y_OFFSET - LOGO_DOT_SIZE / 2,
  marginLeft: -LOGO_DOT_SIZE / 2,
  borderRadius: LOGO_DOT_SIZE / 2,
}
