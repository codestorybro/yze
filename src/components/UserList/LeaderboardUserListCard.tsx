import { View, ViewStyle, TextStyle } from "react-native"

import { Text, SkeletonImage, SvgIcon } from "@/components"
import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"
import { UserType } from "@/types/userType"
import { useAttributeColorAndIcon } from "@/utils/useAttributeColorAndIcon"

const _imageSize = 80

type Props = {
  user: UserType
  position: number
  isCurrentUser: boolean
}

export function LeaderboardUserListCard({ user, position, isCurrentUser }: Props) {
  const {
    themed,
    theme: { colors },
  } = useAppTheme()
  const { color, icon } = useAttributeColorAndIcon(user.dominantArchetypeId)

  const getPositionColor = (pos: number) => {
    switch (pos) {
      case 1:
        return colors.gold
      case 2:
        return colors.silver
      case 3:
        return colors.bronze
      default:
        return colors.textDim
    }
  }

  const getPositionBackgroundColor = (pos: number) => {
    switch (pos) {
      case 1:
        return colors.gold + "30"
      case 2:
        return colors.silver + "30"
      case 3:
        return colors.bronze + "30"
      default:
        return colors.inputBackground
    }
  }

  return (
    <View style={themed($wrapper)}>
      <View
        style={[
          themed($positionWrapper),
          {
            backgroundColor: getPositionBackgroundColor(position),
          },
        ]}
      >
        <Text
          preset="heading"
          size="lg"
          style={[
            themed($positionText),
            {
              color: getPositionColor(position),
            },
          ]}
        >
          {position}
        </Text>
      </View>

      <View>
        <SkeletonImage
          size={_imageSize}
          source={
            user.avatarUri ? { uri: user.avatarUri } : require("../../../assets/images/user.png")
          }
          height={_imageSize}
          width={_imageSize}
          style={{ borderRadius: _imageSize / 2 }}
        />
        {user.dominantArchetypeId && (
          <View style={themed($imageWrapper)}>
            <SvgIcon pathData={icon} color={color} size={24} />
          </View>
        )}
      </View>

      <View style={themed($userInfoWrapper)}>
        <Text style={[themed($userName), isCurrentUser && themed($currentUserText)]}>
          {user.name}
        </Text>
        {isCurrentUser && (
          <Text
            preset="formHelper"
            size="xs"
            tx="homeScreen:itsYou"
            style={themed($currentUserBadge)}
          />
        )}
      </View>
    </View>
  )
}

const $wrapper: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.lg,
  position: "relative",
})

const $positionWrapper: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  minWidth: 40,
  height: 40,
  borderRadius: 20,
  alignItems: "center",
  justifyContent: "center",
  marginRight: spacing.sm,
})

const $positionText: ThemedStyle<TextStyle> = () => ({
  fontWeight: "bold",
})

const $imageWrapper: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  position: "absolute",
  zIndex: 1,
  bottom: 0,
  left: -spacing.sm,
  backgroundColor: colors.inputBackground,
  padding: spacing.xxs,
  borderRadius: spacing.xxxl,
})

const $userInfoWrapper: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  gap: spacing.xxxs,
})

const $userName: ThemedStyle<TextStyle> = () => ({})

const $currentUserText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.primary,
  fontWeight: "600",
})

const $currentUserBadge: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.primary,
  fontWeight: "500",
})
