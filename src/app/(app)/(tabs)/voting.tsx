import { useEffect } from "react"
import { ViewStyle } from "react-native"

import { LoggedScreenWrapper } from "@/components"
import { HorizontalSlider } from "@/components/HorizontalSlider"
import { useQuestion, useVote } from "@/store/vote"
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
]

const mockedQuestion = {
  howMuchPick: 3,
  text: "Who is your favorite?",
  attribute: "Charisma",
}

export default function Voting() {
  const { themed } = useAppTheme()
  const { question, setQuestion } = useQuestion()
  const { selectedUsers, setIsVoted } = useVote()

  const onSubmit = () => {
    setIsVoted(true)
    console.log(selectedUsers)
  }

  useEffect(() => {
    setQuestion(mockedQuestion)
  }, [])

  if (!question) return null

  return (
    <LoggedScreenWrapper contentContainerStyle={themed($container)}>
      <HorizontalSlider users={mockedUsers} question={question} onSubmit={onSubmit} />
    </LoggedScreenWrapper>
  )
}

const $container: ThemedStyle<ViewStyle> = () => ({
  marginHorizontal: 0,
})
