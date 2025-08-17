// eslint-disable-next-line no-restricted-imports
import { Text } from "react-native"

import { LoggedScreenWrapper } from "@/components"
import { useSession } from "@/store/ctx"

export default function Index() {
  const { signOut } = useSession()

  return (
    <LoggedScreenWrapper preset="fixed">
      <Text
        onPress={() => {
          signOut()
        }}
      >
        Sign Out
      </Text>
    </LoggedScreenWrapper>
  )
}
