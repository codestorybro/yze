import { useEffect, useState } from "react"
import { Image, ImageProps, StyleSheet, View } from "react-native"
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated"

import { useAppTheme } from "@/theme/context"

interface SkeletonImageProps extends ImageProps {
  size: number
  animated?: boolean
}

export const SkeletonImage: React.FC<SkeletonImageProps> = ({
  size,
  animated = false,
  style,
  source,
  ...props
}) => {
  const { themeContext } = useAppTheme()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const shimmer = useSharedValue(0)

  const ImageComponent: any = animated ? Animated.Image : Image

  // For local images (require), set loading to false immediately
  useEffect(() => {
    if (source && typeof source === "number") {
      // Local image (require), no loading needed
      setLoading(false)
    } else if (
      source &&
      typeof source === "object" &&
      Array.isArray(source) === false &&
      !(source as any).uri
    ) {
      // Local image object without uri
      setLoading(false)
    }
  }, [source])

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, {
        duration: 900,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    )
  }, [shimmer])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmer.value, [0, 1], [0.5, 1]),
  }))

  const skeletonColor = themeContext === "dark" ? "#3A3D4A" : "#E0E0E0"

  return (
    <View style={[styles.container, { height: size, width: size }]}>
      {loading && !error && (
        <Animated.View
          style={[
            styles.skeleton,
            {
              height: size,
              width: size,
              borderRadius: size / 2,
              backgroundColor: skeletonColor,
            },
            animatedStyle,
          ]}
        />
      )}
      <ImageComponent
        {...props}
        source={source}
        style={[{ maxHeight: size, maxWidth: size }, style]}
        onLoadEnd={() => setLoading(false)}
        onError={() => {
          setError(true)
          setLoading(false)
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  skeleton: {
    position: "absolute",
    top: 0,
    left: 0,
  },
})
