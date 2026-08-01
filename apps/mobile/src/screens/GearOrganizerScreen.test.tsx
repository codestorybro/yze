import type { ReactNode } from "react"
import { router } from "expo-router"
import { act, fireEvent, render, waitFor } from "@testing-library/react-native"

import { GearOrganizerScreen } from "@/screens/GearOrganizerScreen"
import { getHello } from "@/services/api"
import type { ApiResult, HelloResponse } from "@/services/api/types"
import { ThemeProvider } from "@/theme/context"

jest.mock("@/components/Screen", () => {
  const { View } = jest.requireActual("react-native")

  return {
    Screen: ({ children }: { children: ReactNode }) => <View>{children}</View>,
  }
})

jest.mock("@/services/api", () => ({ getHello: jest.fn() }))
jest.mock("expo-router", () => ({ router: { push: jest.fn() } }))

const mockedGetHello = getHello as jest.MockedFunction<typeof getHello>
const mockedRouterPush = router.push as jest.Mock

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise
  })

  return { promise, resolve }
}

function renderScreen() {
  return render(
    <ThemeProvider>
      <GearOrganizerScreen />
    </ThemeProvider>,
  )
}

describe("GearOrganizerScreen", () => {
  afterEach(() => jest.resetAllMocks())

  it("presents the Yze visual hierarchy without invented gear data", () => {
    const screen = renderScreen()

    expect(screen.getByText("Yze")).toBeDefined()
    expect(screen.getByText("Get Yze.")).toBeDefined()
    expect(screen.getByText("Places")).toBeDefined()
    expect(screen.getByText("Appearance")).toBeDefined()
    expect(screen.getByText("Not tested")).toBeDefined()
  })

  it("keeps visible quick actions connected to real routes", () => {
    const screen = renderScreen()

    fireEvent.press(screen.getByText("Places"))
    expect(mockedRouterPush).toHaveBeenLastCalledWith("/places")

    fireEvent.press(screen.getByText("Appearance"))
    expect(mockedRouterPush).toHaveBeenLastCalledWith("/settings")
  })

  it("renders loading and then the API success message", async () => {
    const request = deferred<ApiResult<HelloResponse>>()
    mockedGetHello.mockReturnValueOnce(request.promise)
    const screen = renderScreen()

    fireEvent.press(screen.getByText("Test API connection"))
    expect(screen.getByText("Connecting…")).toBeDefined()

    await act(async () => {
      request.resolve({ kind: "ok", data: { message: "Hello from Gear Organizer API" } })
      await request.promise
    })

    await waitFor(() => {
      expect(screen.getByText("Hello from Gear Organizer API")).toBeDefined()
      expect(screen.getByText("Connected")).toBeDefined()
    })
  })

  it("shows a useful error and retries the request", async () => {
    mockedGetHello
      .mockResolvedValueOnce({ kind: "cannot-connect", temporary: true })
      .mockResolvedValueOnce({ kind: "ok", data: { message: "Connected after retry" } })
    const screen = renderScreen()

    fireEvent.press(screen.getByText("Test API connection"))
    await waitFor(() => {
      expect(
        screen.getByText("Could not connect to the API. Check its URL and whether it is running."),
      ).toBeDefined()
      expect(screen.getByText("Unavailable")).toBeDefined()
    })

    fireEvent.press(screen.getByText("Retry API connection"))
    await waitFor(() => {
      expect(screen.getByText("Connected after retry")).toBeDefined()
      expect(screen.getByText("Connected")).toBeDefined()
    })
    expect(mockedGetHello).toHaveBeenCalledTimes(2)
  })
})
