import { Platform, processColor, ScrollView, StyleSheet, View } from "react-native"
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

  it("softens the status-area edge with a non-interactive background fade", () => {
    const screen = renderScreen()
    const fade = screen.getByTestId("screen-top-edge-fade")
    const fadeStyle = StyleSheet.flatten(fade.props.style)

    expect(fade.props.accessible).toBe(false)
    expect(fade.props.pointerEvents).toBe("none")
    expect(fade.props.colors).toEqual(["#F4F5F2", "#F4F5F2", "#F4F5F200"].map(processColor))
    expect(fadeStyle.height).toBe(safeAreaMetrics.insets.top + spacing.lg)
  })
})
