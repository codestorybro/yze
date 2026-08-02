import { useState } from "react"
import { Platform } from "react-native"
import { NativeTabs } from "expo-router/unstable-native-tabs"

import { NativeTabsScreenChromeProvider } from "@/components/ScreenChromeContext"
import { useAppTheme } from "@/theme/context"

/**
 * The semantic bottom-navigation boundary for the application.
 *
 * Native tabs provide Liquid Glass on supported iOS versions, the standard tab bar on older iOS
 * versions, and the native Material navigation treatment on Android. Keep platform and capability
 * decisions inside this boundary rather than in routes or screens.
 */
export function AppTabs() {
  const [hidden, setHidden] = useState(false)
  const {
    theme: { colors },
  } = useAppTheme()
  const webIndicatorColor = Platform.select({ web: colors.surfaceMuted })
  const webLabelStyle = Platform.select({
    web: {
      default: { color: colors.textDim },
      selected: { color: colors.tint },
    },
  })

  return (
    <NativeTabsScreenChromeProvider hidden={hidden} setHidden={setHidden}>
      <NativeTabs
        backBehavior="history"
        backgroundColor={Platform.select({ web: colors.surfaceRaised })}
        disableTransparentOnScrollEdge
        hidden={hidden}
        labelVisibilityMode="labeled"
        labelStyle={webLabelStyle}
        tabBarRespectsIMEInsets
        tintColor={colors.tint}
      >
        <NativeTabs.Trigger name="index" indicatorColor={webIndicatorColor}>
          <NativeTabs.Trigger.Icon
            sf={{ default: "house", selected: "house.fill" }}
            md={{ default: "home", selected: "home" }}
          />
          <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="places" indicatorColor={webIndicatorColor}>
          <NativeTabs.Trigger.Icon
            sf={{ default: "archivebox", selected: "archivebox.fill" }}
            md={{ default: "inventory_2", selected: "inventory_2" }}
          />
          <NativeTabs.Trigger.Label>Places</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="settings" indicatorColor={webIndicatorColor}>
          <NativeTabs.Trigger.Icon
            sf={{ default: "gearshape", selected: "gearshape.fill" }}
            md={{ default: "settings", selected: "settings" }}
          />
          <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    </NativeTabsScreenChromeProvider>
  )
}
