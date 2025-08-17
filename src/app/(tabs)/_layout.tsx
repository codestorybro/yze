import { Tabs, Redirect } from "expo-router"

import { TabBar, Text } from "@/components"
import { useSession } from "@/store/ctx"

export default function TabLayout() {
  const { user, isLoading } = useSession()

  if (isLoading) {
    return <Text>Loading...</Text>
  }

  if (!user) {
    return <Redirect href="../sign-in" />
  }

  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <TabBar {...props} />}>
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: "Home",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: "Profile",
        }}
      />
    </Tabs>
  )
}
