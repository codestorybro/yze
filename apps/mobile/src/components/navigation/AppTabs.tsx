import { useState } from "react"
import { Platform } from "react-native"
import { usePathname } from "expo-router"
import { NativeTabs } from "expo-router/unstable-native-tabs"

import { NativeTabsScreenChromeProvider } from "@/components/ScreenChromeContext"
import { useAppTheme } from "@/theme/context"

import type { ContextualToolbarAction } from "./ContextualToolbar.types"
import { NativeTabAccessory } from "./NativeTabAccessory"

/**
 * The semantic bottom-navigation boundary for the application.
 *
 * Native tabs provide Liquid Glass on supported iOS versions, the standard tab bar on older iOS
 * versions, and the native Material navigation treatment on Android. Keep platform and capability
 * decisions inside this boundary rather than in routes or screens.
 */
export function AppTabs() {
  const [hidden, setHidden] = useState(false)
  const [accessoryActions, setAccessoryActions] = useState<ContextualToolbarAction[]>([])
  const pathname = usePathname()
  const normalizedPathname = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname
  const effectiveHidden = hidden || normalizedPathname.startsWith("/places/")
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
    <NativeTabsScreenChromeProvider
      hidden={effectiveHidden}
      setAccessoryActions={setAccessoryActions}
      setHidden={setHidden}
    >
      <NativeTabs
        backBehavior="history"
        backgroundColor={Platform.select({ web: colors.surfaceRaised })}
        disableTransparentOnScrollEdge
        hidden={effectiveHidden}
        labelVisibilityMode="labeled"
        labelStyle={webLabelStyle}
        tabBarRespectsIMEInsets
        tintColor={colors.tint}
      >
        {!effectiveHidden && accessoryActions.length > 0 ? (
          <NativeTabs.BottomAccessory>
            <NativeTabAccessory actions={accessoryActions} />
          </NativeTabs.BottomAccessory>
        ) : null}
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
