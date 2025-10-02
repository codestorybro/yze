import { useCallback } from "react"
import { LayoutAnimation, ViewStyle } from "react-native"
import { router } from "expo-router"

import { Button, Card, LoggedScreenWrapper, Text } from "@/components"
import { Switch } from "@/components/Toggle/Switch"
import { useAuth } from "@/store/auth"
import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"
import { Toggle } from "@/components/Toggle/Toggle"

export default function Settings() {
  const { setThemeContextOverride, themeContext } = useAppTheme()
  const { signOut } = useAuth()
  const { themed } = useAppTheme()

  const onSelectGroup = useCallback(() => {
    router.push("../group-selector")
  }, [router])

  const toggleTheme = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setThemeContextOverride(themeContext === "dark" ? "light" : "dark")
  }, [themeContext, setThemeContextOverride])

  return (
    <LoggedScreenWrapper>
      <Button tx="settingsScreen:selectGroup" onPress={onSelectGroup} />

      <Card
        style={themed($option)}
        HeadingComponent={<Text preset="bold" size="lg" tx="settingsScreen:userSettings" />}
        ContentComponent={
          <Switch
            value={themeContext === "dark"}
            onValueChange={toggleTheme}
            labelPosition="left"
            labelTx="settingsScreen:darkMode"
            containerStyle={themed($option)}
          />
        }
      />

      <Card
        style={themed($option)}
        HeadingComponent={<Text preset="bold" size="lg" tx="settingsScreen:manageGroup" />}
      />

      <Button tx="common:logOut" onPress={signOut} preset="error" style={themed($option)} />
    </LoggedScreenWrapper>
  )
}

const $option: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.xs,
})
