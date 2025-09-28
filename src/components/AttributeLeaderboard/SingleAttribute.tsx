import { View, StyleSheet, TextStyle, ImageSourcePropType } from "react-native"
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

import { Text } from "@/components"
import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"
import { AttributeType } from "@/types/attributeType"

import { SkeletonImage } from "../SkeletonImage"

import { _spacing } from "."

// constants
const _avatarSize = 40
const _stagger = 150

type Props = {
  attribute: AttributeType & {
    widthPercent: number
    rank: number | null
    attributeImage: ImageSourcePropType | null
  }
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
    1: colors.primary,
    2: colors.primary,
    3: colors.primary,
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

  const attributeTitleWrapperStylez = useAnimatedStyle(() => {
    return {
      opacity: interpolate(_anim.value, [0, 0.5, 1], [0, 0, 1]),
    }
  })

  return (
    <View style={styles.outerContainer}>
      <Animated.View style={[attributeTitleWrapperStylez, styles.attributeTitleWrapper]}>
        <Text style={themed($attributeTitle)}>{attribute.name}</Text>
      </Animated.View>
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
            <SkeletonImage
              size={_avatarSize}
              source={attribute.attributeImage ?? undefined}
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
})

const styles = StyleSheet.create({
  attributeTitleWrapper: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 2,
  },
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
