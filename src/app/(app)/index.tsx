import { CircularCarousel, Screen } from "@/components"
import { data } from "@/components/CircularCarousel/mockedData"

export default function Index() {
  return (
    <Screen preset="fixed">
      <CircularCarousel data={data} />
    </Screen>
  )
}
