import { useState } from "react"
import { Dimensions, StyleSheet, View, ViewStyle } from "react-native"
import Animated, {
  clamp,
  FadeIn,
  FadeInDown,
  FadeOut,
  runOnJS,
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"
import { GroupType } from "@/types/groupType"

import { Button } from "../Button"
import { CarouselItem } from "./CarouselItem"

const { width } = Dimensions.get("window")

// constants
export const _itemSize = width * 0.24
const _spacing = 12
const _itemTotalSize = _itemSize + _spacing

type Props = {
  onConfirm: () => void
  items: GroupType[]
}

export function CircularSlider({ onConfirm, items }: Props) {
  const { bottom } = useSafeAreaInsets()
  const { themed } = useAppTheme()
  const scrollX = useSharedValue(0)
  const [activeIndex, setActiveIndex] = useState(0)
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollX.value = clamp(e.contentOffset.x / _itemTotalSize, 0, items.length - 1)
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
          source={{ uri: items[activeIndex].imageUri }}
          style={styles.flexContainer}
        />
      </View>
      <Animated.FlatList
        entering={FadeInDown.duration(700)}
        style={[styles.flatListContainer, { height: _itemSize * 2.5 }]}
        contentContainerStyle={{
          gap: _spacing,
          paddingHorizontal: (width - _itemSize) / 2,
        }}
        data={items}
        keyExtractor={({ id }) => id}
        renderItem={({ item, index }) => (
          <CarouselItem imageUri={item.imageUri} index={index} scrollX={scrollX} />
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
  marginHorizontal: spacing.lg,
})

const styles = StyleSheet.create({
  flatListContainer: {
    flexGrow: 0,
  },
  flexContainer: {
    flex: 1,
  },
})
