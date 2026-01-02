import { ActivityIndicator } from "react-native"
import { Tabs, Redirect } from "expo-router"

import { useUser } from "@/store/auth"
import { useAppTheme } from "@/theme/context"
import { SvgIcon } from "@/components/SvgIcon"
import { SvgIconPaths } from "@/components/SvgIcon/svgsPaths"

export default function AppLayout() {
  const { user, isLoading } = useUser()
  const {
    theme: { colors },
  } = useAppTheme()

  if (isLoading) {
    return <ActivityIndicator />
  }

  if (!user) {
    return <Redirect href="../../sign-in" />
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.tabBarBackground,
          borderTopColor: colors.separator,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textDim,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <SvgIcon pathData={SvgIconPaths.index} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <SvgIcon pathData={SvgIconPaths.settings} size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  )
}
