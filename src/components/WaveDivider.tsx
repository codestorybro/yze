import { StyleSheet } from "react-native"
import Svg, { Path } from "react-native-svg"

interface WaveDividerProps {
  color: string
}

export function WaveDivider({ color }: WaveDividerProps) {
  return (
    <Svg viewBox="0 0 1440 320" preserveAspectRatio="none" style={styles.wrapper}>
      <Path fill={color} d="M0,160 C480,320 960,0 1440,160 L1440,320 L0,320 Z" />
    </Svg>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    height: 120,
    position: "absolute",
    top: "40%",
    width: "100%",
  },
})
