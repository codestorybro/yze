import { useEffect } from "react"
import { View, ViewStyle, StyleSheet } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { Button, KeyboardShiftView, LoggedScreenWrapper, SvgIcon, Text } from "@/components"
import { useQuestion, useVote } from "@/store/vote"
import { VotingList } from "@/components"
import { UserSearchBar } from "@/components/UserSearchBar"
import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"
import { SvgIconPaths } from "@/components/SvgIcon/svgsPaths"
import { GradientSeparator } from "@/components/TabBar/GradientSeparator"
import isNewIos from "@/constants/isNewIos"
import { router } from "expo-router"

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
  const { question, setQuestion } = useQuestion()
  const { selectedUsers, setIsVoted } = useVote()
  const { top, bottom } = useSafeAreaInsets()
  const {
    themed,
    theme: { colors },
  } = useAppTheme()

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
        <Text preset="subheading" style={{ flexShrink: 1, textAlign: "center" }}>
          Who do you want to appreciate today?
        </Text>
      </GradientSeparator>

      <LoggedScreenWrapper preset="fixed">
        <VotingList onSubmit={onSubmit} users={mockedUsers} question={question} />
      </LoggedScreenWrapper>

      {!isNewIos && (
        <KeyboardShiftView style={[themed($actionContentWrapper), { bottom }]}>
          <Button preset="floating" onPress={() => router.back()}>
            <SvgIcon pathData={SvgIconPaths.index} color={colors.text} />
          </Button>
          <View style={themed($searchBarWrapper)}>
            <UserSearchBar />
          </View>
        </KeyboardShiftView>
      )}
    </View>
  )
}

const $titleWrapper: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xxs,
  paddingHorizontal: spacing.sm,
  paddingBottom: spacing.xxs,
  backgroundColor: colors.topBarBackground,
  zIndex: 1,
})

const $searchBarWrapper: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
})

const $actionContentWrapper: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  position: "absolute",
  marginHorizontal: spacing.lg + spacing.xxxs,

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
