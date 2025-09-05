import { StyleSheet, TextStyle } from "react-native"
import Animated from "react-native-reanimated"

import { LoggedScreenWrapper } from "@/components"
import AttributeLeaderboard from "@/components/AttributeLeaderboard"
import { useUser } from "@/store/auth"
import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"

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
  const { themed } = useAppTheme()
  const { user } = useUser()

  return (
    <LoggedScreenWrapper preset="scroll">
      <Animated.Image
        source={{ uri: user?.avatarUri }}
        width={150}
        height={150}
        style={styles.avatar}
      />
      <Animated.Text style={themed($nameText)}>{user?.name}</Animated.Text>
      <AttributeLeaderboard attributes={mockedAttributes} />
    </LoggedScreenWrapper>
  )
}

const $nameText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
  fontSize: 18,
  fontWeight: "bold",
  marginBottom: 20,
  textAlign: "center",
})

const styles = StyleSheet.create({
  avatar: {
    alignSelf: "center",
    borderRadius: 75,
    justifyContent: "center",
    marginBottom: 10,
  },
})
