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
    name: "Towarzyskość i relacje",
    score: 50,
  },
  {
    id: "2",
    name: "Energia i nastawienie",
    score: 3,
  },
  {
    id: "3",
    name: "Umysł i działanie",
    score: 10,
  },
  {
    id: "4",
    name: "Postawa społeczna",
    score: 20,
  },
  {
    id: "5",
    name: "Kreatywność i vibe",
    score: 0,
  },
]

const _avatarSize = 150

export default function Index() {
  const { themed } = useAppTheme()
  const { user } = useUser()
  const avatarUri = user?.avatarUri
    ? { uri: user.avatarUri }
    : require("../../../../assets/images/placeholder.png")

  return (
    <LoggedScreenWrapper>
      <Animated.View
        entering={FadeInUp.delay(200).duration(1000).springify()}
        style={styles.avatarWrapper}
      >
        <SkeletonImage
          size={_avatarSize}
          source={avatarUri}
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
  marginBottom: 32,
  textAlign: "center",
})

const styles = StyleSheet.create({
  avatar: {
    alignSelf: "center",
    justifyContent: "center",
  },
  avatarWrapper: {
    alignItems: "center",
    marginBottom: 8,
  },
})
