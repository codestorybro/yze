import { useEffect, useRef } from "react"
import { FlatList, View, ViewStyle, StyleSheet } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { Button, KeyboardShiftView, LoggedScreenWrapper, SvgIcon, Text } from "@/components"
import { useQuestion, useSearch, useVote } from "@/store/vote"
import { VotingList } from "@/components"
import { UserSearchBar } from "@/components/UserSearchBar"
import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"
import { router } from "expo-router"
import { SvgIconPaths } from "@/components/SvgIcon/svgsPaths"
import { useBottomSheet } from "@/utils/useBottomSheet"
import { GradientSeparator } from "@/components/TabBar/GradientSeparator"

const mockedUsers = [
  {
    id: "1",
    name: "John Doe",
    avatarUri: "https://avatar.iran.liara.run/public/40",
  },
  {
    id: "2",
    name: "Jane Smith",
    avatarUri: "https://avatar.iran.liara.run/public/16",
  },
  {
    id: "3",
    name: "Alice Johnson",
    avatarUri: "https://avatar.iran.liara.run/public/33",
  },
  {
    id: "4",
    name: "Bob Brown",
    avatarUri: "https://avatar.iran.liara.run/public/32",
  },
  {
    id: "5",
    name: "Charlie Davis",
    avatarUri: "https://avatar.iran.liara.run/public/39",
  },
  { id: "13", name: "No avataro alvaro", avatarUri: "" },
  {
    id: "6",
    name: "David Wilson",
    avatarUri: "https://avatar.iran.liara.run/public/21",
  },
  {
    id: "7",
    name: "Emma Thompson",
    avatarUri: "https://avatar.iran.liara.run/public/3",
  },
  {
    id: "8",
    name: "Frank Miller",
    avatarUri: "https://avatar.iran.liara.run/public/48",
  },
  {
    id: "9",
    name: "Grace Lee",
    avatarUri: "https://avatar.iran.liara.run/public/36",
  },
  {
    id: "10",
    name: "Hannah White",
    avatarUri: "https://avatar.iran.liara.run/public/12",
  },
  { id: "14", name: "Blah bala" },
  {
    id: "11",
    name: "Ian Harris",
    avatarUri: "https://avatar.iran.liara.run/public/27",
  },
  {
    id: "12",
    name: "Jack Clark",
    avatarUri: "https://avatar.iran.liara.run/public/23",
  },
  { id: "15", name: "Lorem ipsum" },
  {
    id: "16",
    name: "Tony Williams",
    avatarUri: "https://avatar.iran.liara.run/public/16",
  },
  {
    id: "17",
    name: "Stephen Clark",
    avatarUri: "https://avatar.iran.liara.run/public/17",
  },
  {
    id: "18",
    name: "Johny Bravo",
    avatarUri: "https://avatar.iran.liara.run/public/23",
  },
]

const mockedQuestion = {
  id: "1",
  text: "Who helped you with a difficult task today?",
  attributesInfluence: ["Charisma", "Kindness"],
}

export default function Voting() {
  const listRef = useRef<FlatList>(null)
  const { question, setQuestion } = useQuestion()
  const { selectedUsers, setIsVoted, resetUsers, isVoted } = useVote()
  const { top, bottom } = useSafeAreaInsets()
  const { setSearchTerm } = useSearch()
  const { openSheet, closeSheet } = useBottomSheet()
  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  const noUsersSelected = !selectedUsers || selectedUsers?.length === 0

  const handleResetButtonPress = () => {
    setSearchTerm("")
    resetUsers()
    listRef.current?.scrollToOffset({ offset: 0, animated: true })
  }

  const handleSubmitButtonPress = () => {
    const titleDescription = noUsersSelected
      ? {
          title: "No one was chosen!",
          description: "Maybe there is someone worth voting for?",
        }
      : {
          title: "Are you sure?",
          description: "This action cannot be undone.",
        }

    openSheet({
      title: titleDescription.title,
      description: titleDescription.description,
      actionSection: (
        <>
          <Button
            style={styles.flex}
            onPress={() => {
              onSubmit()
              closeSheet()
            }}
          >
            Confirm
          </Button>
          <Button preset="error" style={styles.flex} onPress={closeSheet}>
            Back to voting
          </Button>
        </>
      ),
    })
  }

  const onSubmit = () => {
    setIsVoted(true)
    console.log(selectedUsers)
  }

  useEffect(() => {
    setQuestion(mockedQuestion)
  }, [])

  if (!question) return null

  return (
    <View style={styles.flex}>
      <GradientSeparator style={[themed($titleWrapper), { paddingTop: top }]}>
        <Button preset="no-border" onPress={() => router.back()} style={themed($button)}>
          <SvgIcon pathData={SvgIconPaths.back} color={colors.primary} />
        </Button>
        <Text preset="subheading" style={{ flexShrink: 1, textAlign: "center" }}>
          {question.text}
        </Text>
        <Button preset="no-border" onPress={handleResetButtonPress} style={themed($button)}>
          <SvgIcon pathData={SvgIconPaths.reset} color={colors.secondary} />
        </Button>
      </GradientSeparator>

      <LoggedScreenWrapper preset="fixed">
        <VotingList listRef={listRef} onSubmit={onSubmit} users={mockedUsers} question={question} />
      </LoggedScreenWrapper>

      <KeyboardShiftView style={[themed($actionContentWrapper), { bottom }]}>
        <View style={themed($searchBarWrapper)}>
          <UserSearchBar />
        </View>
        {isVoted ? (
          <Text preset="bold">Already voted, nice!</Text>
        ) : (
          <Button onPress={handleSubmitButtonPress}>
            <SvgIcon pathData={SvgIconPaths.check} color={colors.textReversed} />
          </Button>
        )}
      </KeyboardShiftView>
    </View>
  )
}

const $titleWrapper: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xxs,
  paddingHorizontal: spacing.sm,
  paddingBottom: spacing.xxs,
  backgroundColor: colors.tabBarBackground,
  zIndex: 1,
})

const $searchBarWrapper: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 8,
})

const $button: ThemedStyle<ViewStyle> = ({ spacing }) => ({})

const $actionContentWrapper: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  position: "absolute",
  marginHorizontal: spacing.md,
  left: 0,
  right: 0,
  gap: spacing.xs,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
})

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
})
