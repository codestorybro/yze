import { useRef } from "react"
import {
  View,
  StyleSheet,
  Dimensions,
  Pressable,
  ViewStyle,
  TextStyle,
  FlatList,
} from "react-native"
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
  withSpring,
  interpolateColor,
} from "react-native-reanimated"

import { Button, Text } from "@/components"
import { useSearch, useVote } from "@/store/vote"
import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"
import { QuestionType } from "@/types/questionType"
import { UserType } from "@/types/userType"
import { useBottomSheet } from "@/utils/useBottomSheet"

import { Avatar } from "./Avatar"
// import { BackdropAvatar } from "./BackdropAvatar"
import { UserSearchBar } from "../UserSearchBar"
import Ticker from "../Ticker"

type Props = {
  users: UserType[]
  question: QuestionType
  onSubmit: () => void
}

// constants
export const { width } = Dimensions.get("screen")
export const _imageWidth = width * 0.7
export const _imageHeight = _imageWidth
const _spacing = 12

export function HorizontalSlider({ users, question, onSubmit }: Props) {
  const { openSheet, closeSheet } = useBottomSheet()
  const {
    themed,
    theme: { colors, spacing },
  } = useAppTheme()
  const { voteForUser, selectedUsers, isVoted } = useVote()
  const { searchTerm, setSearchTerm } = useSearch()
  const flatListRef = useRef<FlatList>(null)

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
        [colors.background, colors.error, colors.background],
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

  const filtered = users.filter((user) => user.name.includes(searchTerm))
  const dataResult = filtered.length
    ? filtered
    : [
        {
          id: "0",
          name: "No Results",
          avatarUri: require("../../../assets/images/placeholder.png"),
        },
      ]

  const handleResetButtonPress = () => {
    setSearchTerm("")
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true })
  }

  const handleSubmitButtonPress = () => {
    openSheet({
      title: "Are you sure?",
      description: "This action cannot be undone.",
      actionSection: (
        <>
          <Button
            style={styles.flex}
            onPress={() => {
              onSubmit()
              closeSheet()
            }}
          >
            Continue
          </Button>
          <Button preset="error" style={styles.flex} onPress={closeSheet}>
            Cancel
          </Button>
        </>
      ),
    })
  }

  return (
    <View style={styles.wrapper}>
      {/* <View style={StyleSheet.absoluteFillObject}>
        {dataResult.map((user, index) => (
          <BackdropAvatar key={`backdrop_${user.id}`} user={user} index={index} scrollX={scrollX} />
        ))}
      </View> */}
      <UserSearchBar />
      <View style={themed($row)}>
        <Text style={[themed($text), styles.question]}>{question.text}</Text>
        <Animated.View style={[themed($textWrapper), counterStyle]}>
          <Text>Selected: </Text>
          <Ticker value={selectedUsers?.length ?? 0} />
          <Text> / {question.howMuchPick}</Text>
        </Animated.View>
      </View>
      <Animated.FlatList
        ref={flatListRef}
        data={dataResult}
        keyExtractor={(item) => item.id}
        horizontal
        style={themed($flatListContainer)}
        snapToInterval={_imageWidth + _spacing}
        decelerationRate="fast"
        contentContainerStyle={{ gap: _spacing, paddingHorizontal: (width - _imageWidth) / 2 }}
        renderItem={({ item, index }) => {
          return (
            <Pressable
              disabled={isVoted || dataResult[0].id === "0"}
              onPress={() => onAvatarPress(item)}
              style={styles.wrapper}
            >
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
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
      />
      {isVoted ? (
        <Text preset="subheading" style={themed($alreadyVotedText)}>
          Nice, you have already voted today!
        </Text>
      ) : (
        <>
          <Button
            onPress={handleResetButtonPress}
            preset="reverse"
            disabled={isVoted || !selectedUsers || selectedUsers?.length === 0}
            style={[{ width: width - spacing.xxl }, themed($button)]}
          >
            Reset
          </Button>
          <Button
            disabled={isVoted || !selectedUsers || selectedUsers?.length === 0}
            onPress={handleSubmitButtonPress}
            style={[{ width: width - spacing.xxl }, themed($button)]}
          >
            Submit
          </Button>
        </>
      )}
    </View>
  )
}

const $alreadyVotedText: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginHorizontal: spacing.xl,
  textAlign: "center",
})

const $button: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginVertical: spacing.xs,
})

const $row: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  marginHorizontal: spacing.xl,
})

const $text: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginVertical: spacing.xs,
  paddingVertical: spacing.xxs,
  borderRadius: spacing.xs,
})

const $textWrapper: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  paddingHorizontal: spacing.xs,
  paddingVertical: spacing.xxs,
  borderRadius: spacing.xs,
})

const $flatListContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexGrow: 0,
  paddingVertical: spacing.xl,
})

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  question: {
    flex: 2,
  },
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
})
