import type { TextStyle, ViewStyle } from "react-native"
import { Pressable, View } from "react-native"
import { SymbolView } from "expo-symbols"
import Animated, {
  FadeInDown,
  FadeOutDown,
  LinearTransition,
  ReduceMotion,
} from "react-native-reanimated"

import { ItemIcon } from "@/components/organizer/ItemIcon"
import { RemotePhoto } from "@/components/organizer/RemotePhoto"
import { Text } from "@/components/Text"
import type { Item } from "@/services/api/types"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

interface ItemCardProps {
  index?: number
  item: Item
  onPress: () => void
}

export function ItemCard({ index = 0, item, onPress }: ItemCardProps) {
  const {
    theme: { colors },
    themed,
  } = useAppTheme()
  const supporting =
    [item.brand, item.model].filter(Boolean).join(" · ") || `${item.quantity} in this Place`

  return (
    <Animated.View
      entering={FadeInDown.delay(Math.min(index, 6) * 45)
        .duration(240)
        .reduceMotion(ReduceMotion.System)}
      exiting={FadeOutDown.duration(180).reduceMotion(ReduceMotion.System)}
      layout={LinearTransition.springify().damping(18).reduceMotion(ReduceMotion.System)}
    >
      <Pressable
        accessibilityHint="Opens Item details"
        accessibilityLabel={`${item.name}, ${supporting}`}
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [themed($card), pressed && themed($pressed)]}
      >
        {item.photoUrl ? (
          <RemotePhoto
            accessibilityLabel={`Photo of ${item.name}`}
            fallback={<ItemIcon iconKey={item.iconKey} />}
            style={themed($photo)}
            url={item.photoUrl}
          />
        ) : (
          <ItemIcon iconKey={item.iconKey} />
        )}
        <View style={themed($copy)}>
          <Text preset="label" numberOfLines={2} text={item.name} />
          <Text preset="caption" numberOfLines={1} style={themed($meta)} text={supporting} />
        </View>
        <SymbolView
          name={{ ios: "chevron.right", android: "chevron_right", web: "chevron_right" }}
          size={18}
          tintColor={colors.textDim}
        />
      </Pressable>
    </Animated.View>
  )
}

const $card: ThemedStyle<ViewStyle> = ({ colors, radii, spacing }) => ({
  minHeight: 76,
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.sm,
  padding: spacing.sm,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: radii.md,
  backgroundColor: colors.surfaceRaised,
})
const $pressed: ThemedStyle<ViewStyle> = ({ colors }) => ({ backgroundColor: colors.surfaceMuted })
const $photo: ThemedStyle<ViewStyle> = ({ radii }) => ({
  width: 48,
  height: 48,
  overflow: "hidden",
  borderRadius: radii.md,
})
const $copy: ThemedStyle<ViewStyle> = () => ({ flex: 1 })
const $meta: ThemedStyle<TextStyle> = ({ colors }) => ({ color: colors.textDim })
