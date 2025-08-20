import { View, Image, StyleSheet } from "react-native"
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

import type { AttributeType } from "."
import { _spacing } from "."

// constants
const _avatarSize = 28
const _stagger = 150

type Props = {
  attribute: AttributeType
  index: number
  onFinish: (() => void) | null
  anim: SharedValue<number>
}

export function SingleAttribute({ attribute, index, onFinish, anim }: Props) {
  const {
    theme: { colors },
  } = useAppTheme()

  const _anim = useDerivedValue(() => {
    return withDelay(
      _stagger * index,
      withSpring(anim.value, {
        damping: 80,
        stiffness: 200,
      }),
    )
  })

  const stylez = useAnimatedStyle(() => {
    return {
      width: interpolate(
        _anim.value,
        [0, 1],
        [_avatarSize, Math.max(attribute.score * 3, _avatarSize + _spacing)],
      ),
      backgroundColor:
        index === 4
          ? interpolateColor(_anim.value, [0, 1], [colors.border, "turquoise"])
          : colors.border,
    }
  })

  const textStylez = useAnimatedStyle(() => {
    return {
      opacity: interpolate(_anim.value, [0, 0.5, 1], [0, 0, 1]),
    }
  })

  return (
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
      style={styles.container}
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
      <Animated.Text style={[styles.scoreText, textStylez]}>{attribute.score}</Animated.Text>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: "flex-end",
  },
  avatarImage: {
    aspectRatio: 1,
    flex: 1,
  },
  container: {
    alignItems: "center",
    flexDirection: "row",
  },
  imageWrapper: {
    aspectRatio: 1,
  },
  scoreText: {
    fontSize: 7,
    fontWeight: "700",
  },
})
