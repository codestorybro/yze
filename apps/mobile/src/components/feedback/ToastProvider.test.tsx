import { Pressable } from "react-native"
import { act, fireEvent, render } from "@testing-library/react-native"
import { SafeAreaProvider } from "react-native-safe-area-context"

import { ToastProvider, useToast } from "@/components/feedback/ToastProvider"
import { Text } from "@/components/Text"
import { ThemeProvider } from "@/theme/context"

function Harness() {
  const { showToast } = useToast()
  return (
    <>
      <Pressable onPress={() => showToast("Place created")}>
        <Text text="Show success" />
      </Pressable>
      <Pressable onPress={() => showToast({ message: "Could not save", tone: "error" })}>
        <Text text="Show error" />
      </Pressable>
    </>
  )
}

function renderProvider() {
  return render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 47, right: 0, bottom: 34, left: 0 },
      }}
    >
      <ThemeProvider>
        <ToastProvider>
          <Harness />
        </ToastProvider>
      </ThemeProvider>
    </SafeAreaProvider>,
  )
}

describe("ToastProvider", () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => {
    act(() => jest.runOnlyPendingTimers())
    jest.useRealTimers()
  })

  it("keeps one global, accessible confirmation and replaces it with newer feedback", () => {
    const screen = renderProvider()

    fireEvent.press(screen.getByText("Show success"))
    expect(screen.getByRole("alert")).toBeDefined()
    expect(screen.getByText("Place created")).toBeDefined()

    fireEvent.press(screen.getByText("Show error"))
    expect(screen.queryByText("Place created")).toBeNull()
    expect(screen.getByText("Could not save")).toBeDefined()
  })

  it("dismisses feedback after the subtle display interval", () => {
    const screen = renderProvider()
    fireEvent.press(screen.getByText("Show success"))

    act(() => jest.advanceTimersByTime(2600))

    expect(screen.queryByText("Place created")).toBeNull()
  })
})
