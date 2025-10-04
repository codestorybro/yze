import { ActivityIndicator } from "react-native"
import { Tabs, Redirect } from "expo-router"

import { TabBar } from "@/components"
import { useUser } from "@/store/auth"
import { useAppTheme } from "@/theme/context"

export default function TabLayout() {
  const {
    theme: { colors },
  } = useAppTheme()
  const { user, isLoading } = useUser()

  if (isLoading) {
    return <ActivityIndicator />
  }

  if (!user) {
    return <Redirect href="../../sign-in" />
  }

  return (
    <Tabs
      screenOptions={{ headerShown: false, tabBarStyle: { position: "absolute" } }}
      tabBar={(props) => <TabBar {...props} />}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="search" options={{ tabBarStyle: { display: "none" } }} />
      <Tabs.Screen name="settings" />
    </Tabs>
  )
}
