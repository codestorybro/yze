import { StyleSheet, TextStyle, ViewStyle } from "react-native"
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated"

import { ElementsList, LoggedScreenWrapper, SkeletonImage } from "@/components"
import { useUser } from "@/store/auth"
import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"
import { normalizeAttributes } from "@/utils/normalizeAttributes"

const mockedAttributes = [
  {
    id: "spark",
    label: "Spark",
    score: 3,
  },
  {
    id: "connector",
    label: "Connector",
    score: 10,
  },
  {
    id: "creator",
    label: "Creator",
    score: 30,
  },
  {
    id: "anchor",
    label: "Anchor",
    score: 20,
  },
]

const _avatarSize = 150

export default function Index() {
  const { themed } = useAppTheme()
  const { user } = useUser()
  const avatarUri = user?.avatarUri
    ? { uri: user.avatarUri }
    : require("../../../../assets/images/user.png")

  const normalizedAttributes = normalizeAttributes(mockedAttributes)

  return (
    <LoggedScreenWrapper>
      <Animated.View
        entering={FadeInUp.delay(200).duration(1000).springify()}
        style={themed($avatarWrapper)}
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
      <ElementsList items={normalizedAttributes} />
    </LoggedScreenWrapper>
  )
}

const $nameText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.text,
  fontSize: spacing.md,
  fontWeight: "bold",
  marginBottom: spacing.xl,
  textAlign: "center",
})

const $avatarWrapper: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  marginBottom: spacing.xs,
})

const styles = StyleSheet.create({
  avatar: {
    alignSelf: "center",
    justifyContent: "center",
  },
})
