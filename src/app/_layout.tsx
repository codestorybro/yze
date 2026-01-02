import { useEffect, useState } from "react"
import { Slot } from "expo-router"
import { useFonts } from "@expo-google-fonts/space-grotesk"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { KeyboardProvider } from "react-native-keyboard-controller"
import { initialWindowMetrics, SafeAreaProvider } from "react-native-safe-area-context"

import { AnimatedBootSplash } from "@/components/AnimatedBootSplash"
import { initI18n } from "@/i18n"
import { AuthProvider } from "@/store/auth"
import { BottomSheetProvider } from "@/store/bottomSheet"
import { PartnerProvider } from "@/store/partner"
import { ThemeProvider } from "@/theme/context"
import { customFontsToLoad } from "@/theme/typography"
import { loadDateFnsLocale } from "@/utils/formatDate"
import { GestureHandlerRootView } from "react-native-gesture-handler"

const queryClient = new QueryClient()

if (__DEV__) {
  require("src/devtools/ReactotronConfig.ts")
}

export { ErrorBoundary } from "@/components/ErrorBoundary/ErrorBoundary"

export default function Root() {
  const [fontsLoaded, fontError] = useFonts(customFontsToLoad)
  const [isI18nInitialized, setIsI18nInitialized] = useState(false)
  const [appIsReady, setAppIsReady] = useState(false)
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    initI18n()
      .then(() => setIsI18nInitialized(true))
      .then(() => loadDateFnsLocale())
  }, [])

  useEffect(() => {
    if (fontError) throw fontError
  }, [fontError])

  useEffect(() => {
    if (fontsLoaded && isI18nInitialized) {
      setAppIsReady(true)
    }
  }, [fontsLoaded, isI18nInitialized])

  return (
    <GestureHandlerRootView>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider initialMetrics={initialWindowMetrics}>
          <ThemeProvider>
            <KeyboardProvider>
              <AuthProvider>
                <PartnerProvider>
                  <BottomSheetProvider>
                    {appIsReady ? (
                      <>
                        <Slot />
                        {showSplash && (
                          <AnimatedBootSplash
                            onAnimationEnd={() => {
                              setShowSplash(false)
                            }}
                          />
                        )}
                      </>
                    ) : null}
                  </BottomSheetProvider>
                </PartnerProvider>
              </AuthProvider>
            </KeyboardProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  )
}
