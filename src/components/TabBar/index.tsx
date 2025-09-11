import { useState } from "react"
import { LayoutChangeEvent, Platform, View, ViewStyle } from "react-native"
import { BottomTabBarProps } from "@react-navigation/bottom-tabs"
import { useLinkBuilder } from "@react-navigation/native"
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"

import { TabBarButton } from "./TabBarButton"

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { buildHref } = useLinkBuilder()
  const { bottom } = useSafeAreaInsets()
  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  const [dimensions, setDimensions] = useState({ height: 20, width: 100 })

  const buttonWidth = dimensions.width / state.routes.length

  const onTabBarLayout = (e: LayoutChangeEvent) => {
    setDimensions({
      height: e.nativeEvent.layout.height,
      width: e.nativeEvent.layout.width,
    })
  }

  const tabPositionX = useSharedValue(0)

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: tabPositionX.value }],
    }
  })

  return (
    <View
      onLayout={onTabBarLayout}
      style={[
        themed($tabBarContainer),
        Platform.OS === "android" && {
          marginBottom: bottom,
        },
        { bottom },
      ]}
    >
      <Animated.View
        style={[
          themed($tabBarItemAnimationStyle),
          { height: dimensions.height - 18, width: buttonWidth - 25 },
          animatedStyle,
        ]}
      />
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key]
        const label = (options.tabBarLabel as string) ?? ""

        const isFocused = state.index === index

        const onPress = () => {
          tabPositionX.value = withSpring(buttonWidth * index, { duration: 1500 })
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          })

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params)
          }
        }

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          })
        }

        return (
          <TabBarButton
            key={route.key}
            href={buildHref(route.name, route.params)}
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarButtonTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            routeName={route.name}
            isFocused={isFocused}
            color={isFocused ? colors.textReversed : colors.text}
            label={label}
          />
        )
      })}
    </View>
  )
}

const $tabBarContainer: ThemedStyle<ViewStyle> = ({ colors, isDark }) => ({
  flexDirection: "row",
  position: "absolute",
  backgroundColor: colors.tabBarBackground,
  justifyContent: "space-between",
  alignItems: "center",
  marginHorizontal: 80,
  paddingVertical: 16,
  borderRadius: 32,
  ...(!isDark && {
    shadowColor: colors.palette.neutral900,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 10,
    shadowOpacity: 0.1,
    elevation: 8,
  }),
})

const $tabBarItemAnimationStyle: ThemedStyle<ViewStyle> = ({ colors }) => ({
  position: "absolute",
  backgroundColor: colors.primary,
  borderRadius: 30,
  marginHorizontal: 12,
})
