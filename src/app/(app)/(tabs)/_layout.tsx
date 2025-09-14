import { ActivityIndicator } from "react-native"
import { Tabs, Redirect } from "expo-router"

import { TabBar } from "@/components"
import { useUser } from "@/store/auth"

export default function TabLayout() {
  const { user, isLoading } = useUser()

  if (isLoading) {
    return <ActivityIndicator />
  }

  if (!user) {
    return <Redirect href="../../sign-in" />
  }

  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <TabBar {...props} />}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="voting" />
      <Tabs.Screen name="settings" />
    </Tabs>
  )
}
