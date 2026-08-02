import { useCallback } from "react"
import { Stack, useFocusEffect } from "expo-router"

import { useScreenChrome } from "@/components/ScreenChromeContext"
import { useAppTheme } from "@/theme/context"

export default function PlacesLayout() {
  const {
    theme: { colors },
  } = useAppTheme()
  const { setNativeTabsHidden } = useScreenChrome()

  useFocusEffect(
    useCallback(() => {
      setNativeTabsHidden(true)
      return () => setNativeTabsHidden(false)
    }, [setNativeTabsHidden]),
  )

  const headerOptions = {
    headerBackButtonDisplayMode: "minimal" as const,
    headerBackVisible: false,
    headerShadowVisible: false,
    headerShown: true,
    headerTintColor: colors.text,
    headerTitle: "",
    headerTransparent: true,
  }
  const sheetOptions = {
    ...headerOptions,
    headerShown: false,
    presentation: "formSheet" as const,
    sheetAllowedDetents: [0.8],
    sheetExpandsWhenScrolledToEdge: false,
    sheetGrabberVisible: true,
    sheetInitialDetentIndex: 0,
  }

  return (
    <Stack
      screenOptions={{
        animation: "default",
        contentStyle: { backgroundColor: colors.background },
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="[placeId]" options={headerOptions} />
      <Stack.Screen name="item/[itemId]" options={headerOptions} />
      <Stack.Screen name="add" options={sheetOptions} />
      <Stack.Screen name="place-form" options={sheetOptions} />
      <Stack.Screen name="item-form" options={sheetOptions} />
      <Stack.Screen name="move" options={sheetOptions} />
      <Stack.Screen name="place-picker" options={sheetOptions} />
    </Stack>
  )
}
