import { ReactElement, Ref, forwardRef, useImperativeHandle, useRef } from "react"
import { FlatList, FlatListProps, Platform, StyleProp, ViewStyle } from "react-native"
import { useScrollToTop } from "expo-router/react-navigation"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { Screen } from "@/components/Screen"
import { useAppTheme } from "@/theme/context"

export interface ListScreenProps<T> extends FlatListProps<T> {
  contentStyle?: StyleProp<ViewStyle>
}

function ListScreenInner<T>(
  { contentContainerStyle, contentStyle, ...props }: ListScreenProps<T>,
  ref: Ref<FlatList<T>>,
) {
  const {
    theme: { spacing },
  } = useAppTheme()
  const insets = useSafeAreaInsets()
  const listRef = useRef<FlatList<T>>(null)
  useScrollToTop(listRef)
  useImperativeHandle(ref, () => listRef.current as FlatList<T>)

  return (
    <Screen preset="fixed" safeAreaEdges={[]} contentContainerStyle={$screen}>
      <FlatList
        {...props}
        ref={listRef}
        automaticallyAdjustContentInsets
        automaticallyAdjustsScrollIndicatorInsets
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[
          $content,
          {
            paddingTop: (Platform.OS === "ios" ? 0 : insets.top) + spacing.lg,
            paddingBottom: spacing.xl,
          },
          contentContainerStyle,
        ]}
        style={[$list, contentStyle]}
      />
    </Screen>
  )
}

export const ListScreen = forwardRef(ListScreenInner) as <T>(
  props: ListScreenProps<T> & { ref?: Ref<FlatList<T>> },
) => ReactElement

const $screen: ViewStyle = { flex: 1 }
const $list: ViewStyle = { flex: 1 }
const $content: ViewStyle = { flexGrow: 1 }
