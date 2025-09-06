import { View, ViewStyle, StyleSheet } from "react-native"
import Animated, {
  interpolate,
  SharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated"

import { SkeletonImage } from "@/components"
import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"
import { UserType } from "@/types/userType"

import { _imageHeight, _imageWidth } from "."

export function Avatar({
  item,
  index,
  scrollX,
  isSelected,
}: {
  item: UserType
  index: number
  scrollX: SharedValue<number>
  isSelected: boolean
}) {
  const { themed } = useAppTheme()

  const stylez = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: interpolate(scrollX.value, [index - 1, index, index + 1], [1.4, 1, 1.4]),
        },
        {
          rotate: `${interpolate(scrollX.value, [index - 1, index, index + 1], [15, 0, -15])}deg`,
        },
      ],
    }
  })

  const borderStyle = useAnimatedStyle(() => {
    return {
      borderWidth: withTiming(isSelected ? 4 : 0, { duration: 250 }),
    }
  })

  return (
    <Animated.View
      style={[
        themed($avatarWrapper),
        {
          width: _imageWidth,
          height: _imageHeight,
          borderRadius: _imageWidth / 2,
        },
        borderStyle,
      ]}
    >
      {item.id === "0" ? (
        <View style={styles.placeholderContainer}>
          <SkeletonImage
            size={_imageWidth}
            source={require("../../../assets/images/placeholder.png")}
            style={styles.placeholderImage}
            resizeMode="contain"
          />
        </View>
      ) : (
        <SkeletonImage
          size={_imageWidth}
          animated
          source={{ uri: item.avatarUri }}
          style={[StyleSheet.absoluteFillObject, stylez]}
          resizeMode="cover"
        />
      )}
    </Animated.View>
  )
}

const $avatarWrapper: ThemedStyle<ViewStyle> = ({ colors }) => ({
  overflow: "hidden",
  borderColor: colors.primary,
})

const styles = StyleSheet.create({
  placeholderContainer: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  placeholderImage: {
    height: _imageWidth,
    width: _imageWidth,
  },
})
