import { useEffect } from "react"
import { StyleSheet, Dimensions } from "react-native"
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated"

type CircularCarouselImageProps = {
  source: any
}

const { width, height } = Dimensions.get("window")

export const CircularCarouselImage: React.FC<CircularCarouselImageProps> = ({ source }) => {
  const opacity = useSharedValue(0)

  useEffect(() => {
    opacity.value = 0
    opacity.value = withTiming(1, { duration: 400 })
  }, [source])

  const rStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }))

  if (!source) return null

  return (
    <Animated.Image
      source={source}
      style={[styles.background, rStyle]}
      resizeMode="cover"
      blurRadius={10}
    />
  )
}

const styles = StyleSheet.create({
  background: {
    height,
    position: "absolute",
    width,
  },
})
