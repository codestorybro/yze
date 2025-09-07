import { View, Image, StyleSheet, TextStyle } from "react-native"
import Animated, {
  FadeInUp,
  interpolate,
  interpolateColor,
  runOnJS,
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  withDelay,
  withSpring,
} from "react-native-reanimated"

import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"
import { AttributeType } from "@/types/attributeType"

import { _spacing } from "."

// constants
const _avatarSize = 40
const _stagger = 150

type Props = {
  attribute: AttributeType & { widthPercent: number; rank: number | null }
  index: number
  onFinish: (() => void) | null
  anim: SharedValue<number>
}

export function SingleAttribute({ attribute, index, onFinish, anim }: Props) {
  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  const rankColors: Record<number, string> = {
    1: colors.palette.justGold,
    2: colors.palette.justSilver,
    3: colors.palette.justBronze,
  }

  const _anim = useDerivedValue(() => {
    return withDelay(
      _stagger * index,
      withSpring(anim.value, {
        damping: 80,
        stiffness: 200,
      }),
    )
  })

  const attributeColor =
    attribute.rank != null ? rankColors[attribute.rank] : colors.inputBackground

  const stylez = useAnimatedStyle(() => {
    return {
      width: interpolate(
        _anim.value,
        [0, 1],
        [_avatarSize, Math.max(attribute.widthPercent * 3, _avatarSize + _spacing)],
      ),
      backgroundColor: interpolateColor(
        _anim.value,
        [0, 1],
        [colors.inputBackground, attributeColor],
      ),
    }
  })

  const textStylez = useAnimatedStyle(() => {
    return {
      opacity: interpolate(_anim.value, [0, 0.5, 1], [0, 0, 1]),
    }
  })

  return (
    <View style={styles.outerContainer}>
      <Animated.Text style={[themed($attributeTitle), textStylez]}>{attribute.name}</Animated.Text>
      <Animated.View
        entering={FadeInUp.delay(_stagger * index)
          .springify()
          .damping(80)
          .stiffness(200)
          .withCallback((finished) => {
            if (finished && onFinish) {
              runOnJS(onFinish)()
            }
          })}
        style={styles.innerContainer}
      >
        <Animated.View
          style={[
            styles.avatar,
            { backgroundColor: colors.border, borderRadius: _avatarSize },
            stylez,
          ]}
        >
          <View style={[styles.imageWrapper, { width: _avatarSize }]}>
            <Image
              source={{ uri: `https://i.pravatar.cc/150?u=user_${attribute.name}` }}
              style={[styles.avatarImage, { borderRadius: _avatarSize }]}
            />
          </View>
        </Animated.View>
      </Animated.View>
    </View>
  )
}

const $attributeTitle: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
  fontSize: 16,
  marginBottom: 2,
})

const styles = StyleSheet.create({
  avatar: {
    alignItems: "flex-end",
  },
  avatarImage: {
    aspectRatio: 1,
    flex: 1,
  },
  imageWrapper: {
    aspectRatio: 1,
  },
  innerContainer: {
    alignItems: "center",
    flexDirection: "row",
  },
  outerContainer: {
    marginBottom: 12,
  },
})
