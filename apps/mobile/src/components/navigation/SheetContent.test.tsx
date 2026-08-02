import { FlatList, ScrollView } from "react-native"
import { render } from "@testing-library/react-native"

import { SheetList, SheetScrollView } from "@/components/navigation/SheetContent"
import { ThemeProvider } from "@/theme/context"

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ bottom: 20, left: 0, right: 0, top: 0 }),
}))

describe("SheetContent", () => {
  it("keeps a keyboard-aware ScrollView at the presentation boundary", () => {
    const screen = render(
      <ThemeProvider>
        <SheetScrollView />
      </ThemeProvider>,
    )

    const scrollView = screen.UNSAFE_getByType(ScrollView)
    expect(scrollView.props.automaticallyAdjustKeyboardInsets).toBe(true)
    expect(scrollView.props.contentInsetAdjustmentBehavior).toBe("never")
    expect(scrollView.props.alwaysBounceVertical).toBe(false)
  })

  it("uses the same native sheet contract for list content", () => {
    const screen = render(
      <ThemeProvider>
        <SheetList data={[]} renderItem={() => null} />
      </ThemeProvider>,
    )

    const list = screen.UNSAFE_getByType(FlatList)
    expect(list.props.automaticallyAdjustKeyboardInsets).toBe(true)
    expect(list.props.contentInsetAdjustmentBehavior).toBe("never")
    expect(list.props.alwaysBounceVertical).toBe(false)
  })
})
