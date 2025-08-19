import { useCallback } from "react"
import { LayoutAnimation, ViewStyle } from "react-native"
import { router } from "expo-router"

import { Button, DevSection, LoggedScreenWrapper } from "@/components"
import { Switch } from "@/components/Toggle/Switch"
import { useAuth } from "@/store/auth"
import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"

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
    <LoggedScreenWrapper preset="scroll">
      <Button tx="profileScreen:selectGroup" onPress={onSelectGroup} style={themed($option)} />
      <Switch
        value={themeContext === "dark"}
        onValueChange={toggleTheme}
        labelPosition="left"
        labelTx="profileScreen:darkMode"
        containerStyle={themed($option)}
      />
      <Button tx="common:logOut" onPress={signOut} preset="secondary" style={themed($option)} />
      {__DEV__ && <DevSection />}
    </LoggedScreenWrapper>
  )
}

const $option: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginVertical: spacing.xs,
})
