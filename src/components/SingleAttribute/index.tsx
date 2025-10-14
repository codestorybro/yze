import { useEffect, useMemo, useState } from "react"
import { View, StyleSheet, TextStyle } from "react-native"
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated"

import { Text } from "@/components"
import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"
import { AttributeTraitType } from "@/types/attributeType"

// constants
const _barSize = 12

type Props = {
  attribute: AttributeTraitType
  color: string
  maxScore: number
}

export function SingleAttribute({ attribute, color, maxScore }: Props) {
  const {
    themed,
    theme: { spacing },
  } = useAppTheme()
  const [maxBarWidth, setMaxBarWidth] = useState(0)
  const width = useSharedValue(_barSize)

  const targetWidth = useMemo(() => {
    if (maxScore <= 0 || maxBarWidth <= 0) {
      return _barSize
    }

    const scaledWidth = (attribute.score / maxScore) * maxBarWidth
    return Math.max(scaledWidth, _barSize)
  }, [attribute.score, maxBarWidth, maxScore])

  useEffect(() => {
    width.value = withSpring(targetWidth, {
      damping: 80,
      stiffness: 220,
    })
  }, [targetWidth, width])

  const stylez = useAnimatedStyle(() => {
    return {
      width: width.value,
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
      <Animated.View style={styles.innerContainer}>
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
