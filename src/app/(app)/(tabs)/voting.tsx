import { useEffect } from "react"
import { Platform, ViewStyle } from "react-native"

import { LoggedScreenWrapper } from "@/components"
import { useQuestion, useVote } from "@/store/vote"
import { VotingList } from "@/components"
import { UserSearchBar } from "@/components/UserSearchBar"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"

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
  const { top } = useSafeAreaInsets()
  const {
    themed,
    theme: { spacing },
  } = useAppTheme()

  const bottomSpacingStyle =
    Platform.OS === "ios" ? { paddingBottom: top + spacing.xxxl } : { bottom: top + spacing.xxxl }

  const onSubmit = () => {
    setIsVoted(true)
    console.log(selectedUsers)
  }

  useEffect(() => {
    setQuestion(mockedQuestion)
  }, [])

  if (!question) return null

  return (
    <>
      <UserSearchBar style={[themed($searchBarWrapper), { top: top + spacing.xs }]} />
      <LoggedScreenWrapper
        preset="fixed"
        contentContainerStyle={{ top: top + spacing.xxxl, ...bottomSpacingStyle }}
      >
        <VotingList onSubmit={onSubmit} users={mockedUsers} question={question} />
      </LoggedScreenWrapper>
    </>
  )
}

const $searchBarWrapper: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  position: "absolute",
  left: 0,
  right: 0,
  zIndex: 1,
  marginHorizontal: spacing.lg,
})
