import { forwardRef, type ReactElement, type Ref } from "react"
import type { FlatListProps, ScrollViewProps, ViewStyle } from "react-native"
import { FlatList, Platform, ScrollView } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { useAppTheme } from "@/theme/context"

/**
 * Form-sheet routes need a native scrollable as their first content view so react-native-screens
 * can coordinate layout, detents, and the keyboard without losing the React subtree on iOS.
 */
export function SheetScrollView({ contentContainerStyle, style, ...props }: ScrollViewProps) {
  const {
    theme: { colors, spacing },
  } = useAppTheme()
  const insets = useSafeAreaInsets()

  return (
    <ScrollView
      {...props}
      alwaysBounceVertical={false}
      automaticallyAdjustContentInsets={false}
      automaticallyAdjustKeyboardInsets
      automaticallyAdjustsScrollIndicatorInsets={false}
      contentInsetAdjustmentBehavior="never"
      contentContainerStyle={[
        $content,
        { paddingBottom: insets.bottom + spacing.xl },
        contentContainerStyle,
      ]}
      keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      style={[$scrollable, { backgroundColor: colors.background }, style]}
    />
  )
}

function SheetListInner<T>(
  { contentContainerStyle, style, ...props }: FlatListProps<T>,
  ref: Ref<FlatList<T>>,
) {
  const {
    theme: { colors, spacing },
  } = useAppTheme()
  const insets = useSafeAreaInsets()

  return (
    <FlatList
      {...props}
      ref={ref}
      alwaysBounceVertical={false}
      automaticallyAdjustContentInsets={false}
      automaticallyAdjustKeyboardInsets
      automaticallyAdjustsScrollIndicatorInsets={false}
      contentInsetAdjustmentBehavior="never"
      contentContainerStyle={[
        $content,
        { paddingBottom: insets.bottom + spacing.xl },
        contentContainerStyle,
      ]}
      keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      style={[$scrollable, { backgroundColor: colors.background }, style]}
    />
  )
}

export const SheetList = forwardRef(SheetListInner) as <T>(
  props: FlatListProps<T> & { ref?: Ref<FlatList<T>> },
) => ReactElement

const $scrollable: ViewStyle = { flex: 1 }
const $content: ViewStyle = { flexGrow: 1 }
