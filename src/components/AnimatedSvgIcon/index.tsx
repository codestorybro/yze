import { forwardRef, useImperativeHandle } from "react"
import { StyleSheet, View } from "react-native"
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withDelay,
} from "react-native-reanimated"
import Svg, { Path } from "react-native-svg"

import { colors } from "@/theme/colors"

const AnimatedPath = Animated.createAnimatedComponent(Path)

type Props = {
  pathData?: string
  color?: string
  width?: number
  height?: number
  containerStyle?: object
}

export const AnimatedSvgIcon = forwardRef((props: Props, ref) => {
  const { color = colors.text, pathData, width, height, containerStyle } = props

  const strokeOffset = useSharedValue(2000)
  const fillOpacity = useSharedValue(0)

  const animatedStrokeProps = useAnimatedProps(() => ({
    strokeDashoffset: strokeOffset.value,
  }))

  const animatedFillProps = useAnimatedProps(() => ({
    fillOpacity: fillOpacity.value,
  }))

  useImperativeHandle(ref, () => ({
    animate: () => {
      fillOpacity.value = 0
      strokeOffset.value = 2000

      strokeOffset.value = withTiming(0, { duration: 900 })
      fillOpacity.value = withDelay(200, withTiming(1, { duration: 500 }))
    },
  }))

  return (
    <View style={[styles.wrapper, { width, height }, containerStyle]}>
      <Svg width={width ?? 32} height={height ?? 32} viewBox="0 0 256 256" fill="none">
        <AnimatedPath d={pathData} fill={color} animatedProps={animatedFillProps} stroke="none" />

        <AnimatedPath
          d={pathData}
          stroke={color}
          strokeWidth={2}
          strokeDasharray={2000}
          animatedProps={animatedStrokeProps}
          fill="none"
        />
      </Svg>
    </View>
  )
})

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    height: 32,
    justifyContent: "center",
    marginHorizontal: "auto",
    width: 32,
  },
})

AnimatedSvgIcon.displayName = "AnimatedSvgIcon"
