import { LoggedScreenWrapper } from "@/components"
import AttributeLeaderboard from "@/components/AttributeLeaderboard"

const mockedAttributes = [
  {
    id: "1",
    name: "Strength",
    score: 10,
  },
  {
    id: "2",
    name: "Agility",
    score: 15,
  },
  {
    id: "3",
    name: "Intelligence",
    score: 20,
  },
  {
    id: "4",
    name: "Charisma",
    score: 25,
  },
  {
    id: "5",
    name: "Wisdom",
    score: 30,
  },
]

export default function Index() {
  return (
    <LoggedScreenWrapper preset="fixed">
      <AttributeLeaderboard attributes={mockedAttributes} />
    </LoggedScreenWrapper>
  )
}
