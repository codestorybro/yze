import { useState } from "react"
import { Dimensions, Image, StyleSheet, View, ViewStyle } from "react-native"
import Animated, {
  clamp,
  FadeIn,
  FadeOut,
  interpolate,
  interpolateColor,
  runOnJS,
  SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"

import { Button } from "../Button"

const images = [
  "https://cdn.dribbble.com/userupload/14898482/file/original-f7b3bf9c7ca3216d8f7fa0805d358559.png?resize=1024x726&vertical=center",
  "https://cdn.dribbble.com/userupload/13015917/file/original-dbb4d3dd67826761c6cdec9f95b776ff.png?resize=1024x737&vertical=center",
  "https://cdn.dribbble.com/userupload/24539298/file/original-361bb11b2b0b62357cb0b3a4a9b0648a.png?resize=1024x717&vertical=center",
  "https://cdn.dribbble.com/userupload/18055252/file/original-8bfde6321070cdcb41c65cafe9079d3d.png?resize=1024x737&vertical=center",
  "https://cdn.dribbble.com/userupload/23030238/file/original-203c6b256ee8583431f18192020f6665.png?resize=752x564&vertical=center",
]

const { width } = Dimensions.get("window")
const _itemSize = width * 0.24
const _spacing = 12
const _itemTotalSize = _itemSize + _spacing

function CarouselItem({
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

export function CircularSlider({ onConfirm }: { onConfirm: () => void }) {
  const { bottom } = useSafeAreaInsets()
  const { themed } = useAppTheme()
  const scrollX = useSharedValue(0)
  const [activeIndex, setActiveIndex] = useState(0)
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollX.value = clamp(e.contentOffset.x / _itemTotalSize, 0, images.length - 1)
    const newActiveIndex = Math.round(scrollX.value)

    if (activeIndex !== newActiveIndex) {
      runOnJS(setActiveIndex)(newActiveIndex)
    }
  })

  return (
    <Animated.View style={themed($container)}>
      <View style={StyleSheet.absoluteFillObject}>
        <Animated.Image
          entering={FadeIn.duration(500)}
          exiting={FadeOut.duration(500)}
          key={`image-${activeIndex}`}
          source={{ uri: images[activeIndex] }}
          style={styles.flexContainer}
        />
      </View>
      <Animated.FlatList
        style={[styles.flatListContainer, { height: _itemSize * 2.5 }]}
        contentContainerStyle={{
          gap: _spacing,
          paddingHorizontal: (width - _itemSize) / 2,
        }}
        data={images}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item, index }) => (
          <CarouselItem imageUri={item} index={index} scrollX={scrollX} />
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
        // Scrolling
        onScroll={onScroll}
        scrollEventThrottle={16} // 1000 / 60FPS ~ 16ms
        snapToInterval={_itemTotalSize}
        decelerationRate="fast"
      />
      <Button tx="common:confirm" style={[themed($button), { bottom }]} onPress={onConfirm} />
    </Animated.View>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ colors }) => ({
  justifyContent: "flex-end",
  backgroundColor: colors.palette.justBlack,
  flex: 1,
})

const $button: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  position: "absolute",
  left: 0,
  right: 0,
  marginHorizontal: spacing.xxxl,
})

const styles = StyleSheet.create({
  flatListContainer: {
    flexGrow: 0,
  },
  flexContainer: {
    flex: 1,
  },
})
