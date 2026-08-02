import * as Haptics from "expo-haptics"
import { router } from "expo-router"
import { fireEvent, render, waitFor } from "@testing-library/react-native"

import { PlaceFormScreen } from "@/screens/PlaceFormScreen"
import { createPlace, getPlace, updatePlace } from "@/services/api"
import type { PlaceDetails, PlaceSummary } from "@/services/api/types"
import { ThemeProvider } from "@/theme/context"

const mockShowToast = jest.fn()

jest.mock("expo-router", () => ({
  router: { back: jest.fn(), dismissTo: jest.fn(), push: jest.fn() },
}))
jest.mock("@/components/feedback/ToastProvider", () => ({
  useToast: () => ({ showToast: mockShowToast }),
}))
jest.mock("expo-haptics", () => ({
  NotificationFeedbackType: { Success: "success" },
  notificationAsync: jest.fn().mockResolvedValue(undefined),
}))
jest.mock("@/services/api", () => ({
  createPlace: jest.fn(),
  deletePlace: jest.fn(),
  getPlace: jest.fn(),
  updatePlace: jest.fn(),
}))
jest.mock("@/components/Screen", () => {
  const { View } = jest.requireActual("react-native")
  return { Screen: ({ children }: { children: React.ReactNode }) => <View>{children}</View> }
})
jest.mock("@/components/organizer/FeatureHeader", () => {
  const { Text } = jest.requireActual("react-native")
  return { FeatureHeader: ({ title }: { title: string }) => <Text>{title}</Text> }
})

const mockedGetPlace = getPlace as jest.MockedFunction<typeof getPlace>
const mockedCreatePlace = createPlace as jest.MockedFunction<typeof createPlace>
const mockedUpdatePlace = updatePlace as jest.MockedFunction<typeof updatePlace>
const mockedNotification = Haptics.notificationAsync as jest.MockedFunction<
  typeof Haptics.notificationAsync
>

describe("PlaceFormScreen", () => {
  beforeEach(() => jest.clearAllMocks())

  it("keeps a failed edit recoverable without rendering a blank form", async () => {
    mockedGetPlace.mockResolvedValue({ kind: "cannot-connect", temporary: true })
    const screen = render(
      <ThemeProvider>
        <PlaceFormScreen placeId="place-1" />
      </ThemeProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("This Place is unavailable")).toBeDefined()
      expect(screen.queryByLabelText("Name")).toBeNull()
      expect(screen.getByText("Try again")).toBeDefined()
    })
  })

  it("creates a nested Place and closes the sheet even when native haptics rejects", async () => {
    mockedCreatePlace.mockResolvedValue({ kind: "ok", data: place() })
    mockedNotification.mockRejectedValueOnce(new Error("Native method unavailable"))
    const screen = render(
      <ThemeProvider>
        <PlaceFormScreen parentPlaceId="desk" parentPlaceName="Desk" />
      </ThemeProvider>,
    )

    fireEvent.changeText(screen.getByLabelText("Name"), "Top drawer")
    fireEvent.press(screen.getByText("Create Place"))

    await waitFor(() => {
      expect(mockedCreatePlace).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Top drawer", parentPlaceId: "desk" }),
      )
      expect(mockShowToast).toHaveBeenCalledWith("Place created")
      expect(router.back).toHaveBeenCalledTimes(1)
    })
  })

  it("preserves the current parent when editing a nested Place", async () => {
    mockedGetPlace.mockResolvedValue({ kind: "ok", data: placeDetails() })
    mockedUpdatePlace.mockResolvedValue({ kind: "ok", data: place() })
    const screen = render(
      <ThemeProvider>
        <PlaceFormScreen placeId="drawer" />
      </ThemeProvider>,
    )

    await waitFor(() => expect(screen.getByDisplayValue("Top drawer")).toBeDefined())
    fireEvent.press(screen.getByText("Save changes"))

    await waitFor(() => {
      expect(mockedUpdatePlace).toHaveBeenCalledWith(
        "drawer",
        expect.objectContaining({ parentPlaceId: "desk" }),
      )
      expect(router.back).toHaveBeenCalledTimes(1)
    })
  })
})

function place(): PlaceSummary {
  return {
    id: "drawer",
    name: "Top drawer",
    photoUrl: null,
    description: null,
    childPlaceCount: 0,
    itemCount: 0,
    createdAt: "2026-08-02T10:00:00Z",
    updatedAt: "2026-08-02T10:00:00Z",
  }
}

function placeDetails(): PlaceDetails {
  return {
    ...place(),
    parentPlaceId: "desk",
    ancestry: [{ id: "desk", name: "Desk" }],
    children: [],
    items: [],
  }
}
