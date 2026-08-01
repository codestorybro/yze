import { NativeTabs } from "expo-router/unstable-native-tabs"

import { useAppTheme } from "@/theme/context"

/**
 * The semantic bottom-navigation boundary for the application.
 *
 * Native tabs provide Liquid Glass on supported iOS versions, the standard tab bar on older iOS
 * versions, and the native Material navigation treatment on Android. Keep platform and capability
 * decisions inside this boundary rather than in routes or screens.
 */
export function AppTabs() {
  const {
    theme: { colors },
  } = useAppTheme()

  return (
    <NativeTabs
      backBehavior="history"
      disableTransparentOnScrollEdge
      labelVisibilityMode="labeled"
      tabBarRespectsIMEInsets
      tintColor={colors.tint}
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon
          sf={{ default: "house", selected: "house.fill" }}
          md={{ default: "home", selected: "home" }}
        />
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="places">
        <NativeTabs.Trigger.Icon
          sf={{ default: "archivebox", selected: "archivebox.fill" }}
          md={{ default: "inventory_2", selected: "inventory_2" }}
        />
        <NativeTabs.Trigger.Label>Places</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Icon
          sf={{ default: "gearshape", selected: "gearshape.fill" }}
          md={{ default: "settings", selected: "settings" }}
        />
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  )
}
