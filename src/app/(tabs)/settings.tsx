import { useCallback } from "react"
import { LayoutAnimation, View, ViewStyle } from "react-native"

import { Button, Screen } from "@/components"
import { useAppTheme } from "@/theme/context"

export default function Settings() {
  const { setThemeContextOverride, themeContext } = useAppTheme()

  const toggleTheme = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut) // Animate the transition
    setThemeContextOverride(themeContext === "dark" ? "light" : "dark")
  }, [themeContext, setThemeContextOverride])

  return (
    <Screen style={$root} preset="scroll">
      <View>
        <Button onPress={toggleTheme} text={`Toggle Theme: ${themeContext}`} />
      </View>
    </Screen>
  )
}

const $root: ViewStyle = {
  flex: 1,
}
