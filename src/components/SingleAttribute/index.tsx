import { View, StyleSheet, TextStyle } from "react-native"
import Animated, {
  FadeInUp,
  interpolate,
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
import { scheduleOnRN } from "react-native-worklets"
import { useState } from "react"

// constants
const _barSize = 12
const _stagger = 0

type Props = {
  attribute: AttributeType
  index: number
  onFinish: (() => void) | null
  anim: SharedValue<number>
  color: string
  maxScore: number
}

export function SingleAttribute({ attribute, index, onFinish, anim, color, maxScore }: Props) {
  const {
    themed,
    theme: { spacing },
  } = useAppTheme()
  const [maxBarWidth, setMaxBarWidth] = useState(0)

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
    const scaledWidth = maxScore > 0 ? (attribute.score / maxScore) * maxBarWidth : _barSize

    return {
      width: interpolate(_anim.value, [0, 1], [_barSize, Math.max(scaledWidth, _barSize)]),
    }
  })

  return (
    <View
      onLayout={(e) => setMaxBarWidth(e.nativeEvent.layout.width - spacing.sm)}
      style={{ flex: 1 }}
    >
      <Animated.View style={styles.attributeTitleWrapper}>
        <Text style={themed($attributeTitle)}>{attribute.label}</Text>
      </Animated.View>
      <Animated.View
        entering={FadeInUp.delay(_stagger * index)
          .springify()
          .damping(80)
          .stiffness(200)
          .withCallback((finished) => {
            if (finished && onFinish) {
              scheduleOnRN(onFinish)
            }
          })}
        style={styles.innerContainer}
      >
        <Animated.View
          style={[styles.avatar, { backgroundColor: color, borderRadius: _barSize }, stylez]}
        >
          <View style={[styles.imageWrapper, { width: _barSize }]} />
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
})
