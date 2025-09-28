import { UserType } from "@/types/userType"
import { AnimatePresence, MotiView } from "moti"
import { StyleSheet, ViewStyle } from "react-native"
import { Text, SkeletonImage } from "@/components"
import { View } from "react-native-reanimated/lib/typescript/Animated"
import { ThemedStyle } from "@/theme/types"
import { useAppTheme } from "@/theme/context"

const _imageSize = 80

type Props = {
  user: UserType
}

export function UserListCard({ user }: Props) {
  const { themed } = useAppTheme()

  return (
    <AnimatePresence key={user.id}>
      <MotiView
        from={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5 }}
        transition={{ type: "timing", duration: 250 }}
        style={themed($wrapper)}
      >
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
      </MotiView>
    </AnimatePresence>
  )
}

const $wrapper: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.lg,
})
