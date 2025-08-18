import { useCallback } from "react"
import { LayoutAnimation } from "react-native"

import { Button, DevSection, LoggedScreenWrapper } from "@/components"
import { useSession } from "@/store/ctx"
import { useAppTheme } from "@/theme/context"

export default function Settings() {
  const { setThemeContextOverride, themeContext } = useAppTheme()
  const { signOut } = useSession()

  const toggleTheme = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut) // Animate the transition
    setThemeContextOverride(themeContext === "dark" ? "light" : "dark")
  }, [themeContext, setThemeContextOverride])

  return (
    <LoggedScreenWrapper preset="scroll">
      <Button onPress={toggleTheme} text={`Toggle Theme: ${themeContext}`} />
      <Button tx="common:logOut" onPress={signOut} />
      {__DEV__ && <DevSection />}
    </LoggedScreenWrapper>
  )
}
