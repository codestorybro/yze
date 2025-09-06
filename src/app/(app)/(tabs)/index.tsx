import { StyleSheet, TextStyle } from "react-native"
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated"

import { LoggedScreenWrapper, SkeletonImage } from "@/components"
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

const _avatarSize = 150

export default function Index() {
  const { themed } = useAppTheme()
  const { user } = useUser()

  return (
    <LoggedScreenWrapper>
      <Animated.View entering={FadeInUp.delay(200).duration(1000).springify()}>
        <SkeletonImage
          animated
          size={150}
          source={{ uri: user?.avatarUri }}
          width={_avatarSize}
          height={_avatarSize}
          style={[styles.avatar, { borderRadius: _avatarSize / 2 }]}
        />
      </Animated.View>

      <Animated.Text
        entering={FadeInDown.delay(400).duration(1000).springify()}
        style={themed($nameText)}
      >
        {user?.name}
      </Animated.Text>
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
    justifyContent: "center",
    marginBottom: 10,
  },
})
