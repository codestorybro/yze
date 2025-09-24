import { ActivityIndicator } from "react-native"
import { Tabs, Redirect } from "expo-router"

import { NativeTabs, Icon, Label } from "expo-router/unstable-native-tabs"

import { TabBar } from "@/components"
import { useUser } from "@/store/auth"
import isNewIos from "@/constants/isNewIos"

export default function TabLayout() {
  const { user, isLoading } = useUser()

  if (isLoading) {
    return <ActivityIndicator />
  }

  if (!user) {
    return <Redirect href="../../sign-in" />
  }

  // Use native tabs on iOS (for Liquid Glass effect), and custom tab bar on Android
  if (isNewIos)
    return (
      <NativeTabs>
        <NativeTabs.Trigger name="index">
          <Icon sf="house.fill" />
          <Label hidden />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="search" role="search">
          <Icon sf="person.3.fill" />
          <Label hidden />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="settings">
          <Icon sf="gear" />
          <Label hidden />
        </NativeTabs.Trigger>
      </NativeTabs>
    )

  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <TabBar {...props} />}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="search" options={{ tabBarStyle: { display: "none" } }} />
      <Tabs.Screen name="settings" />
    </Tabs>
  )
}
