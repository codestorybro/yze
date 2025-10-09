import { useEffect, useMemo } from "react"
import { StyleSheet, View, ViewStyle } from "react-native"
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated"

import { Card } from "@/components/Card"
import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"

const _iconSize = 32

const $separatorStyle: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flex: 1,
  height: 1,
  backgroundColor: colors.separator,
  marginRight: spacing.md,
})

const $separatorContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  marginLeft: _iconSize + spacing.sm + spacing.md,
})

const $iconPlaceholderSpacing: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginRight: spacing.sm,
})

type ElementsListSkeletonProps = {
  itemCount?: number
}

export function ElementsListSkeleton({ itemCount = 4 }: ElementsListSkeletonProps) {
  const { themed, theme } = useAppTheme()
  const shimmer = useSharedValue(0)

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, {
        duration: 900,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    )
  }, [shimmer])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmer.value, [0, 1], [0.5, 1]),
  }))

  const skeletonColor = useMemo(() => (theme.isDark ? "#3A3D4A" : "#E0E0E0"), [theme.isDark])

  return (
    <Card
      style={styles.cardContainer}
      ContentComponent={
        <>
          {Array.from({ length: itemCount }).map((_, index) => (
            <View key={index} style={styles.itemContainer}>
              <View style={styles.row}>
                <Animated.View
                  style={[
                    styles.iconPlaceholder,
                    themed($iconPlaceholderSpacing),
                    { backgroundColor: skeletonColor },
                    animatedStyle,
                  ]}
                />
                <View style={styles.textWrapper}>
                  <Animated.View
                    style={[styles.primaryLine, { backgroundColor: skeletonColor }, animatedStyle]}
                  />
                  <Animated.View
                    style={[
                      styles.secondaryLine,
                      { backgroundColor: skeletonColor },
                      animatedStyle,
                    ]}
                  />
                </View>
              </View>
              {index !== itemCount - 1 && (
                <View style={themed($separatorContainer)}>
                  <View style={themed($separatorStyle)} />
                </View>
              )}
            </View>
          ))}
        </>
      }
    />
  )
}

const styles = StyleSheet.create({
  cardContainer: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  itemContainer: {
    flexDirection: "column",
    padding: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  iconPlaceholder: {
    width: _iconSize,
    height: _iconSize,
    borderRadius: _iconSize / 2,
  },
  textWrapper: {
    flex: 1,
    justifyContent: "center",
  },
  primaryLine: {
    height: 14,
    borderRadius: 7,
    marginBottom: 8,
    width: "80%",
  },
  secondaryLine: {
    height: 12,
    borderRadius: 6,
    width: "55%",
  },
})
