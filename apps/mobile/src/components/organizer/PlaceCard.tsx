import type { TextStyle, ViewStyle } from "react-native"
import { Pressable, View } from "react-native"
import { SymbolView } from "expo-symbols"
import Animated, {
  FadeInDown,
  FadeOutDown,
  LinearTransition,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated"

import { RemotePhoto } from "@/components/organizer/RemotePhoto"
import { Text } from "@/components/Text"
import type { PlaceSummary } from "@/services/api/types"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

interface PlaceCardProps {
  index?: number
  onPress: () => void
  place: PlaceSummary
}

export function PlaceCard({ index = 0, onPress, place }: PlaceCardProps) {
  const {
    theme: { colors },
    themed,
  } = useAppTheme()
  const scale = useSharedValue(1)
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))
  const contents = [
    place.childPlaceCount === 1 ? "1 place" : `${place.childPlaceCount} places`,
    place.itemCount === 1 ? "1 item" : `${place.itemCount} items`,
  ].join(" · ")

  return (
    <Animated.View
      entering={FadeInDown.delay(Math.min(index, 6) * 45)
        .duration(260)
        .reduceMotion(ReduceMotion.System)}
      exiting={FadeOutDown.duration(180).reduceMotion(ReduceMotion.System)}
      layout={LinearTransition.springify().damping(18).reduceMotion(ReduceMotion.System)}
      style={[$flex, animatedStyle]}
    >
      <Pressable
        accessibilityHint="Opens this Place"
        accessibilityLabel={`${place.name}, ${contents}`}
        accessibilityRole="button"
        onPress={onPress}
        onPressIn={() => {
          scale.set(
            withSpring(0.975, {
              damping: 18,
              stiffness: 280,
              reduceMotion: ReduceMotion.System,
            }),
          )
        }}
        onPressOut={() => {
          scale.set(
            withSpring(1, {
              damping: 18,
              stiffness: 280,
              reduceMotion: ReduceMotion.System,
            }),
          )
        }}
        style={({ pressed }) => [themed($card), pressed && themed($pressedCard)]}
      >
        <RemotePhoto
          accessibilityLabel={`Photo of ${place.name}`}
          fallback={<PlaceFallback name={place.name} />}
          style={themed($visual)}
          url={place.photoUrl}
        />
        <View style={themed($body)}>
          <View style={themed($titleRow)}>
            <Text preset="section" numberOfLines={2} style={$title} text={place.name} />
            <SymbolView
              name={{ ios: "chevron.right", android: "chevron_right", web: "chevron_right" }}
              size={20}
              tintColor={colors.textDim}
            />
          </View>
          <Text preset="caption" style={themed($meta)} text={contents} />
        </View>
      </Pressable>
    </Animated.View>
  )
}

function PlaceFallback({ name }: { name: string }) {
  const {
    theme: { colors },
    themed,
  } = useAppTheme()
  return (
    <View style={themed($fallback)}>
      <SymbolView
        name={{ ios: "archivebox", android: "inventory_2", web: "inventory_2" }}
        size={42}
        tintColor={colors.tint}
      />
      <Text preset="eyebrow" style={themed($fallbackLabel)} text={name.slice(0, 18)} />
    </View>
  )
}

const $flex: ViewStyle = { flex: 1 }
const $title: TextStyle = { flex: 1 }
const $card: ThemedStyle<ViewStyle> = ({ colors, radii }) => ({
  flex: 1,
  overflow: "hidden",
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: radii.lg,
  backgroundColor: colors.surface,
})
const $pressedCard: ThemedStyle<ViewStyle> = ({ colors }) => ({ borderColor: colors.tint })
const $visual: ThemedStyle<ViewStyle> = () => ({
  width: "100%",
  aspectRatio: 1.25,
  overflow: "hidden",
})
const $fallback: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flex: 1,
  alignItems: "flex-start",
  justifyContent: "space-between",
  padding: spacing.md,
  backgroundColor: colors.tintSubtle,
})
const $fallbackLabel: ThemedStyle<TextStyle> = ({ colors }) => ({ color: colors.tint })
const $body: ThemedStyle<ViewStyle> = ({ spacing }) => ({ gap: spacing.xs, padding: spacing.md })
const $titleRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xs,
})
const $meta: ThemedStyle<TextStyle> = ({ colors }) => ({ color: colors.textDim })
