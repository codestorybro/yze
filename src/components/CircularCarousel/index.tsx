import { useEffect, useRef, useState } from "react"
import { ImageProps, StyleSheet, View } from "react-native"
import Animated, { useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { CircularCarouselImage } from "./CircularCarouselImage"
import { CircularCarouselListItem, ListItemWidth } from "./CircularCarouselListItem"

type CircularCarouselProps = {
  data: ImageProps["source"][]
}

const CircularCarousel: React.FC<CircularCarouselProps> = ({ data }) => {
  const { bottom } = useSafeAreaInsets()
  const contentOffset = useSharedValue(0)

  const [selectedIndex, setSelectedIndex] = useState(0)
  const debounceTimeout = useRef<number | null>(null)

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      contentOffset.value = event.contentOffset.x
    },
  })

  const handleScrollEnd = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x
    const index = Math.round(offsetX / ListItemWidth)

    if (debounceTimeout.current) clearTimeout(debounceTimeout.current)
    debounceTimeout.current = setTimeout(() => {
      setSelectedIndex(index)
    }, 500)
  }

  useEffect(() => {
    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current)
    }
  }, [])

  return (
    <View>
      <CircularCarouselImage source={data[selectedIndex]} />

      <Animated.FlatList
        data={data}
        keyExtractor={(_, index) => index.toString()}
        scrollEventThrottle={16}
        onScroll={scrollHandler}
        pagingEnabled
        snapToInterval={ListItemWidth}
        onMomentumScrollEnd={handleScrollEnd}
        style={[styles.flatListWrapper, { bottom }]}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.contentWrapper, { paddingHorizontal: 1.5 * ListItemWidth }]}
        horizontal
        renderItem={({ item, index }) => {
          return (
            <CircularCarouselListItem contentOffset={contentOffset} imageSrc={item} index={index} />
          )
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  contentWrapper: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
  flatListWrapper: {
    height: "100%",
  },
})

export { CircularCarousel }
