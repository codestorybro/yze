import { View, ViewStyle } from "react-native"
import { BottomTabBarProps } from "@react-navigation/bottom-tabs"
import { useLinkBuilder } from "@react-navigation/native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"

import { TabBarButton } from "./TabBarButton"

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const currentRoute = state.routes[state.index]
  const options = descriptors[currentRoute.key].options

  if (
    options?.tabBarStyle &&
    typeof options.tabBarStyle === "object" &&
    "display" in options.tabBarStyle &&
    (options.tabBarStyle as ViewStyle).display === "none"
  ) {
    return null
  }

  const { buildHref } = useLinkBuilder()
  const { bottom } = useSafeAreaInsets()
  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  return (
    <View style={[themed($tabBarContainer), { bottom }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key]
        const label = (options.tabBarLabel as string) ?? ""

        const isFocused = state.index === index

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          })

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params)
          }
        }

        return (
          <TabBarButton
            key={route.key}
            href={buildHref(route.name, route.params)}
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarButtonTestID}
            onPress={onPress}
            routeName={route.name}
            isFocused={isFocused}
            color={isFocused ? colors.primary : colors.text}
            label={label}
          />
        )
      })}
    </View>
  )
}

const $tabBarContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  position: "absolute",
  left: spacing.lg,
  right: spacing.lg,
  flexDirection: "row",
  backgroundColor: colors.tabBarBackground,
  justifyContent: "space-between",
  alignItems: "center",
  borderRadius: spacing.xxxxl,
  padding: spacing.xxs,
  borderWidth: 1,
  borderColor: colors.border,

  boxShadow: `0px 0px 12px ${colors.shadow}`,
})
