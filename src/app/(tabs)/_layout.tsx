import { Tabs, Redirect } from "expo-router"
import FontAwesome from "@expo/vector-icons/FontAwesome"

import { Text } from "@/components/Text"
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
    <Tabs screenOptions={{ tabBarActiveTintColor: "blue" }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="cog" color={color} />,
        }}
      />
    </Tabs>
  )
}
