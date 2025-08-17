import { StyleSheet, View } from "react-native"
import Svg, { Path } from "react-native-svg"

import { colors } from "@/theme/colors"

type Props = {
  pathData?: string
  color?: string
  size?: number
  containerStyle?: object
}

export const SvgIcon = (props: Props) => {
  const { color = colors.text, pathData, size, containerStyle } = props

  return (
    <View style={[styles.wrapper, { width: size, height: size }, containerStyle]}>
      <Svg width={size ?? 32} height={size ?? 32} viewBox="0 0 256 256" fill="none">
        <Path d={pathData} fill={color} stroke="none" />

        <Path d={pathData} stroke={color} strokeWidth={2} strokeDasharray={2000} fill="none" />
      </Svg>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: "auto",
  },
})

SvgIcon.displayName = "SvgIcon"
