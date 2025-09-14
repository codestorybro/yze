import { Platform, ViewStyle } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"

import { Screen, ScreenProps } from "./Screen"

export function LoggedScreenWrapper({ contentContainerStyle, children, ...props }: ScreenProps) {
  const {
    themed,
    theme: { spacing },
  } = useAppTheme()
  const { top, bottom } = useSafeAreaInsets()
  const paddingBottom = Platform.OS === "ios" ? bottom : spacing.xxxxl

  return (
    <Screen
      preset="scroll"
      contentContainerStyle={[
        themed($container),
        { top: top + spacing.xl, paddingBottom },
        contentContainerStyle,
      ]}
      {...props}
    >
      {children}
    </Screen>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginHorizontal: spacing.lg,
})
