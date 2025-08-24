import { ComponentProps, useEffect } from "react"
import { TextStyle, ViewStyle } from "react-native"
import { PlatformPressable } from "@react-navigation/elements"
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated"

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
  const scale = useSharedValue(0)

  useEffect(() => {
    scale.value = withSpring(isFocused ? 1 : 0, {
      duration: 350,
    })
  }, [scale, isFocused])

  const animatedTextStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scale.value, [0, 1], [1, 0])

    return { opacity }
  })

  const animatedIconStyle = useAnimatedStyle(() => {
    const scaleValue = interpolate(scale.value, [0, 1], [1, 1.2])

    const top = interpolate(scale.value, [0, 1], [0, 7])

    return { transform: [{ scale: scaleValue }], top }
  })

  return (
    <PlatformPressable style={themed($tabBarItem)} {...props}>
      <Animated.View style={animatedIconStyle}>
        <SvgIcon
          pathData={SvgIconPaths[routeName as keyof typeof SvgIconPaths]}
          color={color}
          size={24}
        />
      </Animated.View>
      <Animated.Text style={[themed($tabBarItemText), { color }, animatedTextStyle]}>
        {label}
      </Animated.Text>
    </PlatformPressable>
  )
}

const $tabBarItem: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
})

const $tabBarItemText: ThemedStyle<TextStyle> = () => ({
  fontSize: 12,
})
