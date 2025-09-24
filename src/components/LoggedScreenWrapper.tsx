import { ViewStyle } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"

import { Screen, ScreenProps } from "./Screen"
import isNewIos from "@/constants/isNewIos"

export function LoggedScreenWrapper({
  contentContainerStyle,
  children,
  preset = "scroll",
  ...props
}: ScreenProps) {
  const {
    themed,
    theme: { spacing },
  } = useAppTheme()
  const { top, bottom } = useSafeAreaInsets()

  return (
    <Screen
      preset={preset}
      contentContainerStyle={[
        themed($container),
        preset !== "fixed" && { paddingBottom: spacing.lg },
        preset !== "fixed" &&
          !isNewIos && { paddingTop: top, paddingBottom: bottom + spacing.xxxxl },
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
