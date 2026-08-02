import type { ViewStyle } from "react-native"
import { View } from "react-native"
import { SymbolView } from "expo-symbols"

import { getItemIconDefinition } from "@/features/organizer/itemIconCatalog"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

interface ItemIconProps {
  iconKey: string
  size?: number
}

export function ItemIcon({ iconKey, size = 26 }: ItemIconProps) {
  const {
    theme: { colors },
    themed,
  } = useAppTheme()
  const definition = getItemIconDefinition(iconKey)

  return (
    <View
      accessible
      accessibilityLabel={`${definition.label} icon`}
      style={[themed($container), { width: size + 22, height: size + 22 }]}
    >
      <SymbolView name={definition.symbol} size={size} tintColor={colors.tint} />
    </View>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ colors, radii }) => ({
  alignItems: "center",
  justifyContent: "center",
  borderRadius: radii.md,
  backgroundColor: colors.tintSubtle,
})
