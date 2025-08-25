import { View, StyleSheet, Dimensions, TextStyle, Pressable } from "react-native"
import Animated, {
  interpolate,
  SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated"

import { Text } from "@/components"
import { useVote } from "@/store/vote"
import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"
import { QuestionType } from "@/types/questionType"
import { UserType } from "@/types/userType"

type Props = {
  users: UserType[]
  question: QuestionType
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

export function HorizontalSlider({ users, question }: Props) {
  const { themed } = useAppTheme()
  const { voteForUser, selectedUsers } = useVote()

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
      <Text style={themed($text)}>{question.text}</Text>
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
            <Pressable onPress={() => voteForUser(item)} style={styles.wrapper}>
              <Avatar item={item} index={index} scrollX={scrollX} />
              <Text style={themed($text)}>{item.name}</Text>
            </Pressable>
          )
        }}
        onScroll={onScroll}
        scrollEventThrottle={1000 / 60}
        showsHorizontalScrollIndicator={false}
      />
      <Text style={themed($text)}>
        Selected: {selectedUsers?.length ?? 0}/{question.howMuchPick}
      </Text>
    </View>
  )
}

const $text: ThemedStyle<TextStyle> = ({ colors }) => ({
  backgroundColor: colors.tabBarBackground,
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 8,
  marginVertical: 16,
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
