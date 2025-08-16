import { ViewStyle } from "react-native"

import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"

export default function Settings() {
  return (
    <Screen style={$root} preset="scroll">
      <Text text="settings" />
    </Screen>
  )
}

const $root: ViewStyle = {
  flex: 1,
}
