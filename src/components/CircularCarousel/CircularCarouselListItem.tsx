import { Dimensions, ImageProps, Image, ViewStyle, ImageStyle, Pressable } from "react-native"
import Animated, { interpolate, useAnimatedStyle } from "react-native-reanimated"

import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"

type CircularCarouselListItemProps = {
  imageSrc: ImageProps["source"]
  index: number
  contentOffset: Animated.SharedValue<number>
}

const { width: windowWidth } = Dimensions.get("window")

export const ListItemWidth = windowWidth / 4

const CircularCarouselListItem: React.FC<CircularCarouselListItemProps> = ({
  imageSrc,
  index,
  contentOffset,
}) => {
  const { themed } = useAppTheme()

  const rStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 2) * ListItemWidth,
      (index - 1) * ListItemWidth,
      index * ListItemWidth,
      (index + 1) * ListItemWidth,
      (index + 2) * ListItemWidth,
    ]

    const translateYOutputRange = [0, -ListItemWidth / 3, -ListItemWidth / 2, -ListItemWidth / 3, 0]
    const opacityOutputRange = [0.7, 0.9, 1, 0.9, 0.7]
    const scaleOutputRange = [0.7, 0.8, 1, 0.8, 0.7]

    const translateY = interpolate(contentOffset.value, inputRange, translateYOutputRange, {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })

    const opacity = interpolate(contentOffset.value, inputRange, opacityOutputRange, {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })

    const scale = interpolate(contentOffset.value, inputRange, scaleOutputRange, {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })

    return {
      opacity,
      transform: [{ translateY }, { scale }],
    }
  })

  return (
    <Pressable>
      <Animated.View style={[themed($wrapper), { width: ListItemWidth }, rStyle]}>
        <Image
          source={imageSrc}
          style={[themed($image), { height: ListItemWidth, width: ListItemWidth }]}
        />
      </Animated.View>
    </Pressable>
  )
}

const $wrapper: ThemedStyle<ViewStyle> = () => ({
  aspectRatio: 1,
})

const $image: ThemedStyle<ImageStyle> = ({ colors }) => ({
  margin: 3,
  borderRadius: 50,
  borderWidth: 2,
  borderColor: colors.tabBarBackground,
})

export { CircularCarouselListItem }
