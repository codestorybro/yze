import { Image, StyleSheet } from "react-native"
import Animated, {
  interpolate,
  interpolateColor,
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated"

import { useAppTheme } from "@/theme/context"

import { _itemSize } from "."

export function CarouselItem({
  imageUri,
  index,
  scrollX,
}: {
  imageUri: string
  index: number
  scrollX: SharedValue<number>
}) {
  const {
    theme: { colors },
  } = useAppTheme()
  const stylez = useAnimatedStyle(() => {
    return {
      borderWidth: 4,
      borderColor: interpolateColor(
        scrollX.value,
        [index - 1, index, index + 1],
        ["transparent", colors.primary, "transparent"],
      ),
      transform: [
        {
          translateY: interpolate(
            scrollX.value,
            [index - 1, index, index + 1],
            [_itemSize / 3, 0, _itemSize / 3],
          ),
        },
      ],
    }
  })

  return (
    <Animated.View
      style={[{ width: _itemSize, height: _itemSize, borderRadius: _itemSize / 2 }, stylez]}
    >
      <Image
        source={{ uri: imageUri }}
        style={[styles.flexContainer, { borderRadius: _itemSize / 2 }]}
      />
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
  },
})
