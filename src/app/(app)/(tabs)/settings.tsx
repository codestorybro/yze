import { useState } from "react"
import { View, ViewStyle, TextStyle, StyleSheet, Alert } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useTranslation } from "react-i18next"

import { Screen, Text, Button, Dropdown } from "@/components"
import { Switch } from "@/components/Toggle/Switch"
import { useAuth, useUser } from "@/store/auth"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { loadDateFnsLocale } from "@/utils/formatDate"

const LANGUAGE_OPTIONS = [
  { labelText: "English", value: "en" },
  { labelText: "Polski", value: "pl" },
]

export default function SettingsScreen() {
  const { top } = useSafeAreaInsets()
  const {
    themed,
    theme: { spacing },
    themeContext,
    setThemeContextOverride,
  } = useAppTheme()
  const { user } = useUser()
  const { signOut } = useAuth()
  const { t, i18n } = useTranslation()

  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false)
  const currentLanguage = i18n.language.split("-")[0]

  const isDark = themeContext === "dark"

  const toggleTheme = () => {
    setThemeContextOverride(isDark ? "light" : "dark")
  }

  const handleLanguageChange = async (value: string) => {
    await i18n.changeLanguage(value)
    await loadDateFnsLocale()
    setIsLanguageDropdownOpen(false)
  }

  const handleLogout = () => {
    Alert.alert(t("settingsScreen:logOutConfirmTitle"), t("settingsScreen:logOutConfirmMessage"), [
      { text: t("common:cancel"), style: "cancel" },
      { text: t("common:logOut"), style: "destructive", onPress: signOut },
    ])
  }

  return (
    <Screen preset="scroll" contentContainerStyle={{ paddingTop: top + spacing.md }}>
      <Text preset="heading" tx="settingsScreen:title" style={themed($title)} />

      <View style={themed($section)}>
        <Text preset="bold" tx="settingsScreen:account" style={themed($sectionTitle)} />
        <View style={themed($card)}>
          <View style={styles.row}>
            <Text tx="settingsScreen:email" style={themed($label)} />
            <Text style={themed($value)}>{user?.email || t("settingsScreen:notSet")}</Text>
          </View>
          <View style={styles.row}>
            <Text tx="settingsScreen:name" style={themed($label)} />
            <Text style={themed($value)}>{user?.name || t("settingsScreen:notSet")}</Text>
          </View>
        </View>
      </View>

      <View style={themed($section)}>
        <Text preset="bold" tx="settingsScreen:appearance" style={themed($sectionTitle)} />
        <View style={themed($card)}>
          <View style={styles.row}>
            <Text tx="settingsScreen:darkMode" style={themed($label)} />
            <Switch value={isDark} onValueChange={toggleTheme} />
          </View>
        </View>
      </View>

      <View style={themed($section)}>
        <Text preset="bold" tx="settingsScreen:language" style={themed($sectionTitle)} />
        <View style={themed($card)}>
          <View style={styles.row}>
            <Text tx="settingsScreen:language" style={themed($label)} />
            <Dropdown
              options={LANGUAGE_OPTIONS}
              selectedValue={currentLanguage}
              isOpen={isLanguageDropdownOpen}
              onToggle={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
              onSelect={handleLanguageChange}
              triggerStyle={themed($dropdownTrigger)}
            />
          </View>
        </View>
      </View>

      <View style={themed($section)}>
        <Button preset="error" tx="common:logOut" onPress={handleLogout} />
      </View>
    </Screen>
  )
}

const $title: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.text,
  marginBottom: spacing.lg,
  paddingHorizontal: spacing.lg,
})

const $section: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.lg,
  paddingHorizontal: spacing.lg,
})

const $sectionTitle: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.textDim,
  fontSize: 14,
  marginBottom: spacing.sm,
})

const $card: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.cardBackground,
  borderRadius: 12,
  padding: spacing.md,
})

const $label: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
  fontSize: 16,
})

const $value: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
  fontSize: 16,
})

const $dropdownTrigger: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.separator,
  paddingHorizontal: 12,
  paddingVertical: 8,
  borderRadius: 8,
  minWidth: 100,
})

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
})
