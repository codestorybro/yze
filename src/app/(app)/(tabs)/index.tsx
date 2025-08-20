import { LoggedScreenWrapper } from "@/components"
import Leaderboard from "@/components/Leaderboard"

export default function Index() {
  return (
    <LoggedScreenWrapper preset="fixed">
      <Leaderboard />
    </LoggedScreenWrapper>
  )
}
