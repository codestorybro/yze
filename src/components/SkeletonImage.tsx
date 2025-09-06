import { useState } from "react"
import { Image, ImageProps, View, StyleSheet } from "react-native"
import { Skeleton } from "moti/skeleton"
import Animated from "react-native-reanimated"

import { useAppTheme } from "@/theme/context"

interface SkeletonImageProps extends ImageProps {
  size: number
  animated?: boolean
}

export const SkeletonImage: React.FC<SkeletonImageProps> = ({
  size,
  animated = false,
  ...props
}) => {
  const { themeContext } = useAppTheme()
  const [loading, setLoading] = useState(true)

  const ImageComponent: any = animated ? Animated.Image : Image

  return (
    <View style={styles.container}>
      {loading && (
        <Skeleton
          radius={size / 2}
          height={size}
          width={size}
          colorMode={themeContext === "dark" ? "dark" : "light"}
        />
      )}
      <ImageComponent {...props} onLoadEnd={() => setLoading(false)} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
