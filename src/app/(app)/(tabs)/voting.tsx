import { LoggedScreenWrapper } from "@/components"
import AttributeLeaderboard from "@/components/AttributeLeaderboard"

const mockedAttributes = [
  {
    name: "Strength",
    score: 10,
  },
  {
    name: "Agility",
    score: 15,
  },
  {
    name: "Intelligence",
    score: 20,
  },
  {
    name: "Charisma",
    score: 25,
  },
  {
    name: "Wisdom",
    score: 30,
  },
]

export default function Voting() {
  return (
    <LoggedScreenWrapper preset="fixed">
      <AttributeLeaderboard attributes={mockedAttributes} />
    </LoggedScreenWrapper>
  )
}
