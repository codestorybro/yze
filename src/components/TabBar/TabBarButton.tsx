import { ComponentProps } from "react"
import { ViewStyle } from "react-native"
import { PlatformPressable } from "@react-navigation/elements"

import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"

import { SvgIcon } from "../SvgIcon"
import { SvgIconPaths } from "../SvgIcon/svgsPaths"

type TabBarButtonProps = Omit<ComponentProps<typeof PlatformPressable>, "children"> & {
  label: string
  routeName: string
  color: string
  isFocused?: boolean
}

export function TabBarButton({ routeName, color, label, isFocused, ...props }: TabBarButtonProps) {
  const { themed } = useAppTheme()

  return (
    <PlatformPressable pressOpacity={1} style={themed($tabBarItem)} {...props}>
      <SvgIcon
        pathData={
          SvgIconPaths[`${routeName}${isFocused ? "_full" : ""}` as keyof typeof SvgIconPaths]
        }
        color={color}
        size={25}
      />
    </PlatformPressable>
  )
}

const $tabBarItem: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  paddingVertical: spacing.sm,
})
