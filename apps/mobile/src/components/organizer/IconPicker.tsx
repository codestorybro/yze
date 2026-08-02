import type { TextStyle, ViewStyle } from "react-native"
import { Pressable, View } from "react-native"
import { SymbolView } from "expo-symbols"

import { Text } from "@/components/Text"
import { itemIconCatalog, type ItemIconKey } from "@/features/organizer/itemIconCatalog"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

interface IconPickerProps {
  error?: string
  onChange: (iconKey: ItemIconKey) => void
  value: string
}

export function IconPicker({ error, onChange, value }: IconPickerProps) {
  const {
    theme: { colors },
    themed,
  } = useAppTheme()

  return (
    <View style={themed($section)}>
      <Text preset="formLabel" text="Icon" />
      <View accessibilityRole="radiogroup" style={themed($grid)}>
        {itemIconCatalog.map((item) => {
          const selected = item.key === value
          return (
            <Pressable
              key={item.key}
              accessibilityLabel={item.label}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              onPress={() => onChange(item.key)}
              style={({ pressed }) => [
                themed($option),
                selected && themed($selectedOption),
                pressed && $pressed,
              ]}
            >
              <SymbolView
                name={item.symbol}
                size={26}
                tintColor={selected ? colors.onTint : colors.text}
              />
              <Text
                preset="caption"
                numberOfLines={2}
                style={[themed($label), selected && themed($selectedLabel)]}
                text={item.label}
              />
            </Pressable>
          )
        })}
      </View>
      {error ? <Text preset="formHelper" style={themed($error)} text={error} /> : null}
    </View>
  )
}

const $section: ThemedStyle<ViewStyle> = ({ spacing }) => ({ gap: spacing.xs })
const $grid: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  flexWrap: "wrap",
  gap: spacing.xs,
})
const $option: ThemedStyle<ViewStyle> = ({ colors, radii, spacing }) => ({
  width: "23%",
  minWidth: 72,
  minHeight: 82,
  flexGrow: 1,
  alignItems: "center",
  justifyContent: "center",
  gap: spacing.xs,
  padding: spacing.xs,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: radii.md,
  backgroundColor: colors.surfaceRaised,
})
const $selectedOption: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderColor: colors.tint,
  backgroundColor: colors.tint,
})
const $label: ThemedStyle<TextStyle> = () => ({ textAlign: "center" })
const $selectedLabel: ThemedStyle<TextStyle> = ({ colors }) => ({ color: colors.onTint })
const $error: ThemedStyle<TextStyle> = ({ colors }) => ({ color: colors.error })
const $pressed: ViewStyle = { opacity: 0.7 }
