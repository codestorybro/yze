import { router } from "expo-router"
import { fireEvent, render, waitFor } from "@testing-library/react-native"

import { PlacePickerScreen } from "@/screens/PlacePickerScreen"
import { getChildPlaces, getPlace, getRootPlaces, movePlace } from "@/services/api"
import type { PlaceDetails, PlaceSummary } from "@/services/api/types"
import { ThemeProvider } from "@/theme/context"
import { notifySuccess } from "@/utils/safeHaptics"

const mockShowToast = jest.fn()

jest.mock("expo-router", () => ({ router: { back: jest.fn(), replace: jest.fn() } }))
jest.mock("@/components/feedback/ToastProvider", () => ({
  useToast: () => ({ showToast: mockShowToast }),
}))
jest.mock("@/utils/safeHaptics", () => ({ notifySuccess: jest.fn() }))
jest.mock("@/services/api", () => ({
  getChildPlaces: jest.fn(),
  getPlace: jest.fn(),
  getRootPlaces: jest.fn(),
  movePlace: jest.fn(),
}))
jest.mock("@/components/organizer/FeatureHeader", () => {
  const { Text } = jest.requireActual("react-native")
  return { FeatureHeader: ({ title }: { title: string }) => <Text>{title}</Text> }
})
jest.mock("@/components/navigation/SheetContent", () => {
  const { View } = jest.requireActual("react-native")
  return {
    SheetList: ({
      data,
      ListEmptyComponent,
      ListFooterComponent,
      ListHeaderComponent,
      renderItem,
    }: any) => (
      <View>
        {ListHeaderComponent}
        {data.length
          ? data.map((item: PlaceSummary, index: number) => (
              <View key={item.id}>{renderItem({ item, index })}</View>
            ))
          : ListEmptyComponent}
        {ListFooterComponent}
      </View>
    ),
  }
})

const mockedGetRootPlaces = getRootPlaces as jest.MockedFunction<typeof getRootPlaces>
const mockedGetChildPlaces = getChildPlaces as jest.MockedFunction<typeof getChildPlaces>
const mockedGetPlace = getPlace as jest.MockedFunction<typeof getPlace>
const mockedMovePlace = movePlace as jest.MockedFunction<typeof movePlace>
const mockedNotifySuccess = notifySuccess as jest.MockedFunction<typeof notifySuccess>

describe("PlacePickerScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedGetRootPlaces.mockResolvedValue({
      kind: "ok",
      data: [
        summary("Ancestor", "ancestor", 1),
        summary("Destination", "destination", 1),
        summary("Candidate", "candidate"),
      ],
    })
    mockedGetPlace.mockResolvedValue({ kind: "ok", data: destination() })
    mockedMovePlace.mockResolvedValue({ kind: "ok", data: summary("Candidate", "candidate") })
  })

  it("moves a selected existing Place into the destination and confirms success", async () => {
    const screen = renderPicker()

    await waitFor(() => expect(screen.getByLabelText("Select Candidate")).toBeDefined())
    expect(screen.getByLabelText("Select Ancestor").props.accessibilityState.disabled).toBe(true)
    expect(screen.getByLabelText("Browse inside Ancestor")).toBeDefined()
    expect(screen.getByLabelText("Select Destination").props.accessibilityState.disabled).toBe(true)

    fireEvent.press(screen.getByLabelText("Select Candidate"))
    fireEvent.press(screen.getByText("Move here"))

    await waitFor(() => {
      expect(mockedMovePlace).toHaveBeenCalledWith("candidate", "destination")
      expect(mockShowToast).toHaveBeenCalledWith("Place moved into Destination")
      expect(mockedNotifySuccess).toHaveBeenCalledTimes(1)
      expect(router.back).toHaveBeenCalledTimes(1)
    })
  })

  it("opens the selected Place for management without mutating its hierarchy", async () => {
    const screen = render(
      <ThemeProvider>
        <PlacePickerScreen mode="manage" />
      </ThemeProvider>,
    )

    await waitFor(() => expect(screen.getByLabelText("Select Candidate")).toBeDefined())
    fireEvent.press(screen.getByLabelText("Select Candidate"))
    fireEvent.press(screen.getByText("Manage Place"))

    expect(router.replace).toHaveBeenCalledWith("/places/place-form?placeId=candidate")
    expect(mockedMovePlace).not.toHaveBeenCalled()
  })

  it("retries the current hierarchy level without mixing root data into its breadcrumb", async () => {
    const branch = summary("Branch", "branch", 1)
    mockedGetChildPlaces
      .mockResolvedValueOnce({ kind: "ok", data: [branch] })
      .mockResolvedValueOnce({ kind: "cannot-connect", temporary: true })
      .mockResolvedValueOnce({ kind: "ok", data: [branch] })
    const screen = renderPicker()

    await waitFor(() => expect(screen.getByLabelText("Browse inside Ancestor")).toBeDefined())
    fireEvent.press(screen.getByLabelText("Browse inside Ancestor"))
    await waitFor(() => expect(screen.getByLabelText("Browse inside Branch")).toBeDefined())
    fireEvent.press(screen.getByLabelText("Browse inside Branch"))

    await waitFor(() => expect(screen.getByText("Try again")).toBeDefined())
    fireEvent.press(screen.getByText("Try again"))

    await waitFor(() => {
      expect(mockedGetChildPlaces.mock.calls.map(([parentId]) => parentId)).toEqual([
        "ancestor",
        "branch",
        "ancestor",
      ])
      expect(screen.getByText("Ancestor")).toBeDefined()
      expect(screen.getByLabelText("Select Branch")).toBeDefined()
      expect(screen.queryByLabelText("Select Candidate")).toBeNull()
    })
  })

  it("reloads destination details after an initial error before enabling selections", async () => {
    mockedGetPlace
      .mockResolvedValueOnce({ kind: "cannot-connect", temporary: true })
      .mockResolvedValueOnce({ kind: "ok", data: destination() })
    const screen = renderPicker()

    await waitFor(() => expect(screen.getByText("Try again")).toBeDefined())
    fireEvent.press(screen.getByText("Try again"))

    await waitFor(() => {
      expect(mockedGetPlace).toHaveBeenCalledTimes(2)
      expect(screen.getByLabelText("Select Destination").props.accessibilityState.disabled).toBe(
        true,
      )
      expect(screen.getByLabelText("Select Ancestor").props.accessibilityState.disabled).toBe(true)
      expect(screen.getByLabelText("Select Candidate").props.accessibilityState.disabled).toBe(
        false,
      )
    })
  })
})

function renderPicker() {
  return render(
    <ThemeProvider>
      <PlacePickerScreen
        destinationPlaceId="destination"
        destinationPlaceName="Destination"
        mode="attach"
      />
    </ThemeProvider>,
  )
}

function destination(): PlaceDetails {
  return {
    id: "destination",
    name: "Destination",
    parentPlaceId: "ancestor",
    photoUrl: null,
    description: null,
    createdAt: "2026-08-01T10:00:00Z",
    updatedAt: "2026-08-01T10:00:00Z",
    ancestry: [{ id: "ancestor", name: "Ancestor" }],
    children: [summary("Existing child", "child")],
    items: [],
  }
}

function summary(name: string, id: string, childPlaceCount = 0): PlaceSummary {
  return {
    id,
    name,
    photoUrl: null,
    description: null,
    childPlaceCount,
    itemCount: 0,
    createdAt: "2026-08-01T10:00:00Z",
    updatedAt: "2026-08-01T10:00:00Z",
  }
}
