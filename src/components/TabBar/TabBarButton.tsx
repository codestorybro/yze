import { ComponentProps, useState } from "react"
import { ViewStyle } from "react-native"

import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"

import { SvgIcon } from "../SvgIcon"
import { SvgIconPaths } from "../SvgIcon/svgsPaths"
import { Button } from "@/components"

type TabBarButtonProps = Omit<ComponentProps<typeof Button>, "children"> & {
  label: string
  routeName: string
  isFocused?: boolean
  href?: string
}

export function TabBarButton({ routeName, label, isFocused, ...props }: TabBarButtonProps) {
  const {
    themed,
    theme: { colors },
  } = useAppTheme()
  const [isPressed, setIsPressed] = useState(false)
  const localColor = isFocused || isPressed ? colors.primary : colors.text

  return (
    <Button
      preset="navigation"
      style={themed($tabBarItem)}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      {...props}
    >
      <SvgIcon
        pathData={
          SvgIconPaths[`${routeName}${isFocused ? "_full" : ""}` as keyof typeof SvgIconPaths]
        }
        color={localColor}
        size={32}
      />
    </Button>
  )
}

const $tabBarItem: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})
