import { View, ViewStyle, TextStyle } from "react-native"

import { Text, SkeletonImage, SvgIcon } from "@/components"
import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"
import { UserType } from "@/types/userType"
import { useAttributeColorAndIcon } from "@/utils/useAttributeColorAndIcon"

const _imageSize = 80

type Props = {
  user: UserType
}

export function UserListCard({ user }: Props) {
  const { themed } = useAppTheme()
  const { color, icon } = useAttributeColorAndIcon(user.dominantArchetypeId)

  return (
    <View style={themed($wrapper)}>
      {user.alreadyAppreciated ? (
        <View style={themed($badgeWrapper)}>
          <Text
            preset="formHelper"
            size="xs"
            tx="searchScreen:appreciatedToday"
            style={themed($badgeText)}
          />
        </View>
      ) : null}
      {user.dominantArchetypeId && (
        <View style={themed($imageWrapper)}>
          <SvgIcon pathData={icon} color={color} size={24} />
        </View>
      )}

      <SkeletonImage
        size={_imageSize}
        source={
          user.avatarUri ? { uri: user.avatarUri } : require("../../../assets/images/user.png")
        }
        height={_imageSize}
        width={_imageSize}
        style={{ borderRadius: _imageSize / 2 }}
      />
      <Text>{user.name}</Text>
    </View>
  )
}

const $wrapper: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.lg,
  position: "relative",
})

const $badgeWrapper: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  position: "absolute",
  top: spacing.xxs,
  right: spacing.xxs,
  backgroundColor: colors.inputBackground,
  paddingHorizontal: spacing.xxs,
  paddingVertical: spacing.xxxs,
  borderRadius: spacing.xxxs,
})

const $badgeText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.primary,
})

const $imageWrapper: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  position: "absolute",
  zIndex: 100,
  bottom: 0,
  left: 0,
  backgroundColor: colors.inputBackground,
  padding: spacing.xxxs,
  borderRadius: spacing.xxxl,
})
