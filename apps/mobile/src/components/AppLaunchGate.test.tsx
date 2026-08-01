import { useEffect } from "react"
import * as SplashScreen from "expo-splash-screen"
import { act, fireEvent, render, waitFor } from "@testing-library/react-native"

import { Text } from "@/components/Text"
import { ThemeProvider } from "@/theme/context"

import { AppLaunchGate, getRevealGeometry } from "./AppLaunchGate"

jest.mock("expo-splash-screen", () => ({
  hide: jest.fn(),
  setOptions: jest.fn(),
}))

const mockedHide = SplashScreen.hide as jest.MockedFunction<typeof SplashScreen.hide>
const mockedSetOptions = SplashScreen.setOptions as jest.MockedFunction<
  typeof SplashScreen.setOptions
>

interface RenderGateOptions {
  children?: React.ReactNode
  ready: boolean
  reducedMotion: boolean
}

function renderGate({ children = "Ready application", ready, reducedMotion }: RenderGateOptions) {
  return render(
    <ThemeProvider initialContext="light">
      <AppLaunchGate ready={ready} reducedMotion={reducedMotion}>
        {children}
      </AppLaunchGate>
    </ThemeProvider>,
  )
}

function prepareLaunch(screen: ReturnType<typeof renderGate>) {
  fireEvent(screen.getByTestId("app-launch-root"), "layout", {
    nativeEvent: { layout: { height: 844, width: 390, x: 0, y: 0 } },
  })
  fireEvent(screen.getByTestId("app-launch-logo"), "load")
}

describe("AppLaunchGate", () => {
  beforeEach(() => jest.clearAllMocks())
  afterEach(() => jest.useRealTimers())

  it("keeps the native splash visible while the application is loading", () => {
    const screen = renderGate({ ready: false, reducedMotion: false })

    prepareLaunch(screen)

    expect(screen.queryByText("Ready application")).toBeNull()
    expect(mockedHide).not.toHaveBeenCalled()
  })

  it("hands off from native only after the matching artwork and layout are ready", () => {
    const screen = renderGate({ ready: true, reducedMotion: false })

    expect(mockedSetOptions).toHaveBeenCalledWith({ duration: 0, fade: false })
    fireEvent(screen.getByTestId("app-launch-root"), "layout", {
      nativeEvent: { layout: { height: 844, width: 390, x: 0, y: 0 } },
    })
    expect(mockedHide).not.toHaveBeenCalled()

    fireEvent(screen.getByTestId("app-launch-logo"), "load")
    fireEvent(screen.getByTestId("app-launch-logo"), "load")

    expect(mockedSetOptions).toHaveBeenCalledWith({ duration: 0, fade: false })
    expect(mockedSetOptions.mock.invocationCallOrder[0]).toBeLessThan(
      mockedHide.mock.invocationCallOrder[0],
    )
    expect(mockedHide).toHaveBeenCalledTimes(1)
  })

  it("fails open when the matching artwork does not report that it loaded", () => {
    jest.useFakeTimers()
    const screen = renderGate({ ready: true, reducedMotion: true })

    fireEvent(screen.getByTestId("app-launch-root"), "layout", {
      nativeEvent: { layout: { height: 844, width: 390, x: 0, y: 0 } },
    })
    expect(mockedHide).not.toHaveBeenCalled()

    act(() => jest.advanceTimersByTime(1_000))

    expect(mockedHide).toHaveBeenCalledTimes(1)
    act(() => jest.runOnlyPendingTimers())
    expect(screen.queryByTestId("app-launch-artwork")).toBeNull()
  })

  it("reveals immediately and keeps the application mounted with Reduce Motion", async () => {
    let mountCount = 0

    function StableApplication() {
      useEffect(() => {
        mountCount += 1
      }, [])

      return <Text text="Ready application" />
    }

    const screen = renderGate({
      children: <StableApplication />,
      ready: true,
      reducedMotion: true,
    })

    prepareLaunch(screen)

    expect(screen.getByTestId("app-launch-artwork")).toHaveStyle({
      backgroundColor: "#F4F5F2",
    })
    await screen.findByText("Ready application")
    await waitFor(() => expect(screen.queryByTestId("app-launch-logo")).toBeNull())

    expect(screen.getByTestId("app-launch-content").props.pointerEvents).toBe("auto")
    expect(mountCount).toBe(1)
    expect(mockedHide).toHaveBeenCalledTimes(1)
  })

  it("expands the reveal beyond every corner", () => {
    const layout = { height: 844, width: 390 }
    const geometry = getRevealGeometry(layout, 1)
    const origin = { x: layout.width / 2, y: layout.height / 2 - 14 }
    const radius = geometry.diameter / 2

    for (const [x, y] of [
      [0, 0],
      [layout.width, 0],
      [0, layout.height],
      [layout.width, layout.height],
    ]) {
      expect(Math.hypot(x - origin.x, y - origin.y)).toBeLessThan(radius)
    }
  })

  it("keeps its watchdog armed when the root layout changes during launch", () => {
    jest.useFakeTimers()
    const screen = renderGate({ ready: true, reducedMotion: false })

    prepareLaunch(screen)
    fireEvent(screen.getByTestId("app-launch-root"), "layout", {
      nativeEvent: { layout: { height: 842, width: 390, x: 0, y: 0 } },
    })

    act(() => jest.advanceTimersByTime(2_000))

    expect(screen.queryByTestId("app-launch-artwork")).toBeNull()
    expect(screen.getByTestId("app-launch-content").props.pointerEvents).toBe("auto")
  })
})
