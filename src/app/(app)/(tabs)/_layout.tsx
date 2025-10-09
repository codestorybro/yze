import { ActivityIndicator } from "react-native"
import { Tabs, Redirect } from "expo-router"

import { TabBar } from "@/components"
import { useUser } from "@/store/auth"
import { Reactotron } from "@/devtools/ReactotronClient"

export default function TabLayout() {
  const { user, isLoading } = useUser()

  if (isLoading) {
    return <ActivityIndicator />
  }

  if (!user) {
    Reactotron.log("🙅‍♂️ No user found, redirecting to sign-in")
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
