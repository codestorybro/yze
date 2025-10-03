import { View, ViewStyle } from "react-native"

import { Text, SkeletonImage } from "@/components"
import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"
import { UserType } from "@/types/userType"

const _imageSize = 80

type Props = {
  user: UserType
}

export function UserListCard({ user }: Props) {
  const { themed } = useAppTheme()

  return (
    <View style={themed($wrapper)}>
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
})
