import { ImageProps, StyleSheet } from "react-native"
import Animated, { useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { CircularCarouselListItem, ListItemWidth } from "./list-item"

type CircularCarouselProps = {
  data: ImageProps["source"][]
}

const CircularCarousel: React.FC<CircularCarouselProps> = ({ data }) => {
  const contentOffset = useSharedValue(0)
  const { bottom } = useSafeAreaInsets()

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      contentOffset.value = event.contentOffset.x
    },
  })

  return (
    <Animated.FlatList
      data={data}
      keyExtractor={(_, index) => index.toString()}
      scrollEventThrottle={16}
      onScroll={scrollHandler}
      pagingEnabled
      snapToInterval={ListItemWidth}
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
