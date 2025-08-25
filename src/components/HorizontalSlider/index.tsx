import { View, StyleSheet, Dimensions, Pressable, ViewStyle, TextStyle } from "react-native"
import Animated, {
  interpolate,
  SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
  withSpring,
  interpolateColor,
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
  isSelected,
}: {
  item: UserType
  index: number
  scrollX: SharedValue<number>
  isSelected: boolean
}) {
  const { themed } = useAppTheme()

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

  const borderStyle = useAnimatedStyle(() => {
    return {
      borderWidth: withTiming(isSelected ? 4 : 0, { duration: 250 }),
    }
  })

  return (
    <Animated.View
      style={[
        themed($avatarWrapper),
        { width: _imageWidth, height: _imageHeight, borderRadius: _imageWidth / 2 },
        borderStyle,
      ]}
    >
      <Animated.Image source={{ uri: item.avatarUri }} style={[styles.flexContainer, stylez]} />
    </Animated.View>
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
  const {
    themed,
    theme: { colors },
  } = useAppTheme()
  const { voteForUser, selectedUsers } = useVote()

  const scrollX = useSharedValue(0)
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollX.value = e.contentOffset.x / (_imageWidth + _spacing)
  })

  const shakeScale = useSharedValue(1)
  const shakeRotate = useSharedValue(0)
  const colorProgress = useSharedValue(0)

  const counterStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: shakeScale.value }, { rotate: `${shakeRotate.value}deg` }],
      backgroundColor: interpolateColor(
        colorProgress.value,
        [0, 1, 2],
        [colors.tabBarBackground, colors.error, colors.tabBarBackground],
      ),
    }
  })

  const triggerShake = () => {
    shakeScale.value = withSequence(
      withTiming(1.2, { duration: 500 }),
      withSpring(1, { damping: 5 }),
    )
    shakeRotate.value = withSequence(
      withTiming(-5, { duration: 100 }),
      withTiming(5, { duration: 100 }),
      withTiming(-5, { duration: 100 }),
      withSpring(0, { damping: 5 }),
    )
    colorProgress.value = withSequence(
      withTiming(1, { duration: 100 }),
      withTiming(2, { duration: 1000 }),
    )
  }

  const onAvatarPress = (user: UserType) => {
    try {
      voteForUser(user)
    } catch {
      triggerShake()
    }
  }

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
            <Pressable onPress={() => onAvatarPress(item)} style={styles.wrapper}>
              <Avatar
                item={item}
                index={index}
                scrollX={scrollX}
                isSelected={!!selectedUsers?.some((u) => u.id === item.id)}
              />
              <Text style={themed($text)}>{item.name}</Text>
            </Pressable>
          )
        }}
        onScroll={onScroll}
        scrollEventThrottle={1000 / 60}
        showsHorizontalScrollIndicator={false}
      />

      <Animated.View style={[themed($textWrapper), counterStyle]}>
        <Text>
          Selected: {selectedUsers?.length ?? 0}/{question.howMuchPick}
        </Text>
      </Animated.View>
    </View>
  )
}

const $textWrapper: ThemedStyle<ViewStyle> = () => ({
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 8,
  marginVertical: 16,
})

const $text: ThemedStyle<TextStyle> = ({ colors }) => ({
  backgroundColor: colors.tabBarBackground,
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 8,
  marginVertical: 16,
})

const $avatarWrapper: ThemedStyle<ViewStyle> = ({ colors }) => ({
  overflow: "hidden",
  borderColor: colors.primary,
})

const styles = StyleSheet.create({
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
