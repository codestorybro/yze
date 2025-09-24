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
  const { top } = useSafeAreaInsets()

  return (
    <Screen
      preset={preset}
      contentContainerStyle={[
        themed($container),
        preset !== "fixed" && !isNewIos && { paddingTop: top },
        preset !== "fixed" && { paddingBottom: spacing.lg },
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
