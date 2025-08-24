import { View, StyleSheet, Dimensions, TextStyle } from "react-native"
import Animated, {
  interpolate,
  SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated"

import { Text } from "@/components"
import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"

export type UserType = {
  id: string
  name: string
  avatarUri: string
}

type Props = {
  users: UserType[]
}

// constants
const { width } = Dimensions.get("screen")
const _imageWidth = width * 0.7
const _imageHeight = _imageWidth
const _spacing = 12

function Avatar({
  item,
  index,
  scrollX,
}: {
  item: UserType
  index: number
  scrollX: SharedValue<number>
}) {
  const stylez = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: interpolate(scrollX.value, [index - 1, index, index + 1], [1.4, 1, 1.4]),
        },
        {
          rotate: `${interpolate(scrollX.value, [index - 1, index, index + 1], [15, 0, -15])}deg`,
        },
      ],
    }
  })

  return (
    <View style={[styles.avatarWrapper, { width: _imageWidth, height: _imageHeight }]}>
      <Animated.Image source={{ uri: item.avatarUri }} style={[styles.flexContainer, stylez]} />
    </View>
  )
}

function BackdropAvatar({
  user,
  index,
  scrollX,
}: {
  user: UserType
  index: number
  scrollX: SharedValue<number>
}) {
  const stylez = useAnimatedStyle(() => {
    return {
      opacity: interpolate(scrollX.value, [index - 1, index, index + 1], [0, 1, 0]),
    }
  })

  return (
    <Animated.Image
      source={{ uri: user.avatarUri }}
      style={[StyleSheet.absoluteFillObject, stylez]}
      blurRadius={50}
    />
  )
}

export function HorizontalSlider({ users }: Props) {
  const { themed } = useAppTheme()

  const scrollX = useSharedValue(0)
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollX.value = e.contentOffset.x / (_imageWidth + _spacing)
  })

  return (
    <View style={styles.wrapper}>
      <View style={StyleSheet.absoluteFillObject}>
        {users.map((user, index) => (
          <BackdropAvatar key={`backdrop_${user.id}`} user={user} index={index} scrollX={scrollX} />
        ))}
      </View>
      <Animated.FlatList
        data={users}
        keyExtractor={(item) => item.id}
        horizontal
        style={styles.flatListContainer}
        snapToInterval={_imageWidth + _spacing}
        decelerationRate="fast"
        contentContainerStyle={{ gap: _spacing, paddingHorizontal: (width - _imageWidth) / 2 }}
        renderItem={({ item, index }) => {
          return (
            <View style={styles.wrapper}>
              <Avatar item={item} index={index} scrollX={scrollX} />
              <Text style={themed($text)}>{item.name}</Text>
            </View>
          )
        }}
        onScroll={onScroll}
        scrollEventThrottle={1000 / 60}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  )
}

const $text: ThemedStyle<TextStyle> = ({ colors }) => ({
  backgroundColor: colors.tabBarBackground,
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 8,
  marginTop: 16,
})

const styles = StyleSheet.create({
  avatarWrapper: {
    borderRadius: "100%",
    overflow: "hidden",
  },
  flatListContainer: {
    flexGrow: 0,
  },
  flexContainer: {
    flex: 1,
  },
  wrapper: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
})
