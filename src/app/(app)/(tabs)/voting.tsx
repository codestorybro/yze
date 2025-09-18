import { useEffect, useRef } from "react"
import { FlatList, View, ViewStyle, StyleSheet } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { Button, LoggedScreenWrapper, SvgIcon, Text } from "@/components"
import { useQuestion, useSearch, useVote } from "@/store/vote"
import { VotingList } from "@/components"
import { UserSearchBar } from "@/components/UserSearchBar"
import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"
import { router } from "expo-router"
import { SvgIconPaths } from "@/components/SvgIcon/svgsPaths"
import { useBottomSheet } from "@/utils/useBottomSheet"

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

  const isButtonDisabled = isVoted || !selectedUsers || selectedUsers?.length === 0

  const handleResetButtonPress = () => {
    setSearchTerm("")
    resetUsers()
    listRef.current?.scrollToOffset({ offset: 0, animated: true })
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

  const onSubmit = () => {
    setIsVoted(true)
    console.log(selectedUsers)
  }

  useEffect(() => {
    setQuestion(mockedQuestion)
  }, [])

  if (!question) return null

  return (
    <View style={{ flex: 1, paddingTop: top, paddingBottom: bottom }}>
      <View style={themed($titleWrapper)}>
        <Button preset="reverse" onPress={() => router.back()} style={{ width: 56, height: 56 }}>
          <SvgIcon pathData={SvgIconPaths.back} color={colors.primary} size={25} />
        </Button>
        <Text preset="subheading" style={{ flexShrink: 1 }}>
          {question.text}
        </Text>
      </View>

      <View style={themed($searchBarWrapper)}>
        <UserSearchBar />
      </View>

      <LoggedScreenWrapper preset="fixed">
        <VotingList listRef={listRef} onSubmit={onSubmit} users={mockedUsers} question={question} />
      </LoggedScreenWrapper>

      <View style={[themed($actionButtonsContentWrapper), { bottom }]}>
        {isVoted ? (
          <Button disabled preset="no-border" style={styles.votedButton}>
            <Text preset="bold">Already voted, nice!</Text>
          </Button>
        ) : (
          <>
            <Button
              preset="no-border"
              disabled={isButtonDisabled}
              onPress={handleSubmitButtonPress}
              style={themed($button)}
            >
              {isVoted ? (
                "Voted already!"
              ) : (
                <SvgIcon
                  pathData={SvgIconPaths.check}
                  color={isButtonDisabled ? colors.disabled : colors.confirmation}
                />
              )}
            </Button>
            <Button preset="no-border" onPress={handleResetButtonPress} style={themed($button)}>
              <SvgIcon pathData={SvgIconPaths.reset} color={colors.secondary} />
            </Button>
          </>
        )}
      </View>
    </View>
  )
}

const $titleWrapper: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.md,
  marginHorizontal: spacing.lg,
  marginBottom: spacing.md,
})

const $searchBarWrapper: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginHorizontal: spacing.lg,
  marginBottom: spacing.lg,
})

const $button: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  marginVertical: spacing.xxs,
})

const $actionButtonsContentWrapper: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  position: "absolute",
  marginHorizontal: spacing.xxxl,
  left: 0,
  right: 0,
  borderRadius: spacing.xl,
  flexDirection: "row",
  justifyContent: "space-between",
  backgroundColor: colors.tabBarBackground,
  paddingHorizontal: spacing.xxs,
  borderWidth: 1,
  borderColor: colors.border,
})

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  votedButton: {
    marginHorizontal: "auto",
  },
})
