import { useEffect, useState } from "react"
import { Slot, ThemeProvider as NavigationThemeProvider } from "expo-router"
import * as SplashScreen from "expo-splash-screen"
import { useFonts } from "@expo-google-fonts/space-grotesk"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { initialWindowMetrics, SafeAreaProvider } from "react-native-safe-area-context"

import { AppLaunchGate } from "@/components/AppLaunchGate"
import { ToastProvider } from "@/components/feedback/ToastProvider"
import { initializeI18nSafely } from "@/i18n/initializeSafely"
import { ThemeProvider, useAppTheme } from "@/theme/context"
import { customFontsToLoad } from "@/theme/typography"

void SplashScreen.preventAutoHideAsync()

if (__DEV__) {
  // Load Reactotron configuration in development. We don't want to
  // include this in our production bundle, so we are using `if (__DEV__)`
  // to only execute this in development.
  require("@/devtools/ReactotronConfig")
}

export default function Root() {
  const [fontsLoaded, fontError] = useFonts(customFontsToLoad)
  const [isI18nInitialized, setIsI18nInitialized] = useState(false)

  useEffect(() => {
    let isMounted = true

    void initializeI18nSafely().then(() => {
      if (isMounted) setIsI18nInitialized(true)
    })

    return () => {
      isMounted = false
    }
  }, [])

  const loaded = fontsLoaded && isI18nInitialized

  useEffect(() => {
    if (fontError) throw fontError
  }, [fontError])

  return (
    <GestureHandlerRootView style={$root}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <ThemeProvider>
          <ToastProvider>
            <AppLaunchGate ready={loaded}>
              <RootNavigation />
            </AppLaunchGate>
          </ToastProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}

const $root = { flex: 1 } as const

function RootNavigation() {
  const { navigationTheme } = useAppTheme()

  return (
    <NavigationThemeProvider value={navigationTheme}>
      <Slot />
    </NavigationThemeProvider>
  )
}
