import type { PropsWithChildren } from "react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
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

interface RevealCurtainGeometry extends RevealGeometry {
  borderWidth: number
  endScale: number
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
 * Builds one static reveal layer whose seed opening is hidden by the signal dot. The animation can
 * then stay entirely on the compositor by changing only its transform instead of laying out and
 * redrawing an increasingly large border on every frame.
 */
export function getRevealCurtainGeometry(
  layout: Pick<LayoutRectangle, "height" | "width">,
): RevealCurtainGeometry {
  const reveal = getRevealGeometry(layout, 1)
  const diameter = reveal.diameter + LOGO_DOT_SIZE
  const originX = layout.width / 2
  const originY = layout.height / 2 + LOGO_DOT_Y_OFFSET

  return {
    borderWidth: reveal.diameter / 2,
    diameter,
    endScale: reveal.diameter / LOGO_DOT_SIZE,
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
  const revealCurtain = useMemo(
    () => (layout ? getRevealCurtainGeometry(layout) : undefined),
    [layout],
  )

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

  const $revealCurtain = useAnimatedStyle(() => {
    if (!revealCurtain || shouldReduceMotion) return { opacity: 0 }

    return {
      opacity: 1,
      transform: [
        {
          scale: interpolate(
            revealProgress.value,
            [0, 1],
            [1, revealCurtain.endScale],
            Extrapolation.CLAMP,
          ),
        },
      ],
    }
  }, [revealCurtain, shouldReduceMotion])

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

  return (
    <View
      collapsable={false}
      onLayout={onLayout}
      style={[$container, { backgroundColor: colors.background }]}
      testID="app-launch-root"
    >
      {ready && layout ? (
        <View
          accessibilityElementsHidden={!animationComplete}
          importantForAccessibility={animationComplete ? "auto" : "no-hide-descendants"}
          pointerEvents={animationComplete ? "auto" : "none"}
          style={$appContent}
          testID="app-launch-content"
        >
          {children}
        </View>
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
          {!shouldReduceMotion ? (
            <Animated.View
              style={[
                $revealCurtainBase,
                revealCurtain
                  ? {
                      borderColor: colors.background,
                      borderRadius: revealCurtain.diameter / 2,
                      borderWidth: revealCurtain.borderWidth,
                      height: revealCurtain.diameter,
                      left: revealCurtain.left,
                      top: revealCurtain.top,
                      width: revealCurtain.diameter,
                    }
                  : undefined,
                $revealCurtain,
              ]}
              testID="app-launch-reveal"
            />
          ) : null}
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
}

const $appContent: ViewStyle = {
  position: "absolute",
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
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

const $revealCurtainBase: ViewStyle = {
  position: "absolute",
  backgroundColor: "transparent",
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
