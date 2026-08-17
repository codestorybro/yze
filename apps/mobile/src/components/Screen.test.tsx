import { Platform, ScrollView, StyleSheet, View } from "react-native"
import { render } from "@testing-library/react-native"
import { SafeAreaProvider } from "react-native-safe-area-context"

import { ThemeProvider } from "@/theme/context"
import { spacing } from "@/theme/spacing"

import { Screen, resolveContainerSafeAreaEdges } from "./Screen"
import { NativeTabsScreenChromeProvider } from "./ScreenChromeContext"

jest.mock("expo-router/react-navigation", () => ({
  ...jest.requireActual("expo-router/react-navigation"),
  useScrollToTop: jest.fn(),
}))

const safeAreaMetrics = {
  frame: { height: 844, width: 390, x: 0, y: 0 },
  insets: { bottom: 34, left: 0, right: 0, top: 47 },
}

function renderScreen() {
  return render(
    <SafeAreaProvider initialMetrics={safeAreaMetrics}>
      <ThemeProvider initialContext="light">
        <NativeTabsScreenChromeProvider>
          <Screen preset="scroll">
            <View testID="screen-content" />
          </Screen>
        </NativeTabsScreenChromeProvider>
      </ThemeProvider>
    </SafeAreaProvider>,
  )
}

describe("Screen", () => {
  it("lets native navigation own its dynamic insets and keeps standard content clearance", () => {
    const screen = renderScreen()
    const scrollView = screen.UNSAFE_getByType(ScrollView)
    const topInsetStyle = StyleSheet.flatten(
      screen.getByTestId("screen-top-content-inset").props.style,
    )
    const bottomInsetStyle = StyleSheet.flatten(
      screen.getByTestId("screen-bottom-content-inset").props.style,
    )

    expect(scrollView.props.contentInsetAdjustmentBehavior).toBe("automatic")
    expect(scrollView.props.automaticallyAdjustContentInsets).toBe(true)
    expect(scrollView.props.automaticallyAdjustsScrollIndicatorInsets).toBe(true)
    expect(topInsetStyle.height).toBe(
      spacing.lg + (Platform.OS === "ios" ? 0 : safeAreaMetrics.insets.top),
    )
    expect(bottomInsetStyle.height).toBe(spacing.xl)
  })

  it("assigns bottom safe-area ownership according to the screen host", () => {
    const edges = ["top", "bottom"] as const

    expect(resolveContainerSafeAreaEdges([...edges], false, true, "android")).toEqual(["top"])
    expect(resolveContainerSafeAreaEdges([...edges], false, true, "ios")).toEqual(edges)
    expect(resolveContainerSafeAreaEdges([...edges], true, true, "ios")).toEqual([])
    expect(resolveContainerSafeAreaEdges([...edges], true, false, "android")).toEqual(["bottom"])
    expect(resolveContainerSafeAreaEdges([...edges], true, true, "web")).toEqual(["bottom"])
  })

  it("keeps the status area unobstructed so content can scroll to the physical edge", () => {
    const screen = renderScreen()

    expect(screen.queryByTestId("screen-top-edge-fade")).toBeNull()
  })

  it("lets scroll content grow beyond the viewport without clipping its bottom", () => {
    const screen = renderScreen()
    const innerStyle = StyleSheet.flatten(screen.getByTestId("screen-scroll-inner").props.style)

    expect(innerStyle.flex).toBeUndefined()
    expect(innerStyle.flexGrow).toBe(1)
    expect(innerStyle.flexShrink).toBe(0)
  })
})
