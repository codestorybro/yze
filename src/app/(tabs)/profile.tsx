import { useCallback } from "react"
import { LayoutAnimation, StyleSheet } from "react-native"

import { Button, DevSection, LoggedScreenWrapper } from "@/components"
import { useSession } from "@/store/ctx"
import { useAppTheme } from "@/theme/context"
import { Switch } from "@/components/Toggle/Switch"

export default function Settings() {
  const { setThemeContextOverride, themeContext } = useAppTheme()
  const { signOut } = useSession()

  const toggleTheme = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setThemeContextOverride(themeContext === "dark" ? "light" : "dark")
  }, [themeContext, setThemeContextOverride])

  return (
    <LoggedScreenWrapper preset="scroll">
      <Switch
        value={themeContext === "dark"}
        onValueChange={toggleTheme}
        labelPosition="left"
        labelTx="profileScreen:darkMode"
        containerStyle={styles.singleOption}
      />
      <Button tx="common:logOut" onPress={signOut} preset="secondary" />
      {__DEV__ && <DevSection />}
    </LoggedScreenWrapper>
  )
}

const styles = StyleSheet.create({
  singleOption: {
    marginBottom: 12,
  },
})
