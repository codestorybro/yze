import React, { useEffect, useRef } from "react"
import { Keyboard, KeyboardEvent, Platform, Animated, ViewStyle, StyleProp } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

type Props = {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
  enabled?: boolean
}

export function KeyboardShiftView({ children, style, enabled = true }: Props) {
  const { bottom } = useSafeAreaInsets()
  const offset = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (!enabled) return

    const show = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow"
    const hide = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide"

    const onShow = (e: KeyboardEvent) => {
      Animated.timing(offset, {
        toValue: e.endCoordinates.height - (Platform.OS === "ios" ? bottom : 0),
        duration: e.duration ?? 250,
        useNativeDriver: false,
      }).start()
    }

    const onHide = (e: KeyboardEvent) => {
      Animated.timing(offset, {
        toValue: 0,
        duration: e.duration ?? 250,
        useNativeDriver: false,
      }).start()
    }

    const subShow = Keyboard.addListener(show, onShow)
    const subHide = Keyboard.addListener(hide, onHide)

    return () => {
      subShow.remove()
      subHide.remove()
    }
  }, [enabled, offset])

  return <Animated.View style={[style, { marginBottom: offset }]}>{children}</Animated.View>
}
