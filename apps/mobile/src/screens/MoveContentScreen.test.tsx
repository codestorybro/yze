import { router } from "expo-router"
import { fireEvent, render, waitFor } from "@testing-library/react-native"

import { MoveContentScreen } from "@/screens/MoveContentScreen"
import { getChildPlaces, getRootPlaces, moveItem, movePlace } from "@/services/api"
import type { PlaceSummary } from "@/services/api/types"
import { ThemeProvider } from "@/theme/context"

const mockShowToast = jest.fn()

jest.mock("expo-router", () => ({ router: { back: jest.fn(), dismissTo: jest.fn() } }))
jest.mock("@/components/feedback/ToastProvider", () => ({
  useToast: () => ({ showToast: mockShowToast }),
}))
jest.mock("expo-haptics", () => ({
  AndroidHaptics: { Confirm: "confirm" },
  ImpactFeedbackStyle: { Medium: "medium" },
  impactAsync: jest.fn().mockResolvedValue(undefined),
  performAndroidHapticsAsync: jest.fn().mockResolvedValue(undefined),
}))
jest.mock("@/services/api", () => ({
  getChildPlaces: jest.fn(),
  getRootPlaces: jest.fn(),
  moveItem: jest.fn(),
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
const mockedMoveItem = moveItem as jest.MockedFunction<typeof moveItem>
const mockedMovePlace = movePlace as jest.MockedFunction<typeof movePlace>

describe("MoveContentScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedGetRootPlaces.mockResolvedValue({ kind: "ok", data: [place("Studio", "studio", 1)] })
    mockedMoveItem.mockResolvedValue({ kind: "ok", data: {} as never })
    mockedMovePlace.mockResolvedValue({ kind: "ok", data: place("Shelf", "shelf") })
  })

  it("commits the hierarchy path only after the next level loads", async () => {
    mockedGetChildPlaces.mockResolvedValue({ kind: "cannot-connect", temporary: true })
    const screen = renderScreen({ currentPlaceId: "studio", entityId: "item-1", kind: "item" })

    await waitFor(() => expect(screen.getByText("Studio")).toBeDefined())
    fireEvent.press(screen.getByLabelText("Browse inside Studio"))

    await waitFor(() => {
      expect(screen.getByText("All root Places")).toBeDefined()
      expect(
        screen.getByText("Yze could not reach the API. Check that the backend is running."),
      ).toBeDefined()
      expect(screen.getByText("Studio")).toBeDefined()
    })
  })

  it("loads a child level and prevents browsing into the moving Place itself", async () => {
    mockedGetChildPlaces.mockResolvedValue({
      kind: "ok",
      data: [place("Camera shelf", "shelf", 1)],
    })
    const screen = renderScreen()

    await waitFor(() => expect(screen.getByText("Studio")).toBeDefined())
    fireEvent.press(screen.getByLabelText("Browse inside Studio"))

    await waitFor(() => {
      expect(screen.getByText("Camera shelf")).toBeDefined()
      expect(screen.getByText("Studio")).toBeDefined()
    })

    expect(screen.queryByLabelText("Browse inside Camera shelf")).toBeNull()
  })

  it("dismisses to an Item's new Place after moving it", async () => {
    const screen = renderScreen({ currentPlaceId: "source", entityId: "item-1", kind: "item" })

    await waitFor(() => expect(screen.getByText("Studio")).toBeDefined())
    fireEvent.press(screen.getByRole("radio"))
    fireEvent.press(screen.getByText("Move here"))

    await waitFor(() => {
      expect(mockedMoveItem).toHaveBeenCalledWith("item-1", "studio")
      expect(router.dismissTo).toHaveBeenCalledWith("/places/studio")
    })
  })

  it("dismisses to the Places root after moving a Place to root", async () => {
    const screen = renderScreen()

    await waitFor(() => expect(screen.getByText("Move to root level")).toBeDefined())
    fireEvent.press(screen.getByText("Move to root level"))

    await waitFor(() => {
      expect(mockedMovePlace).toHaveBeenCalledWith("shelf", null)
      expect(router.dismissTo).toHaveBeenCalledWith("/places")
    })
  })
})

function renderScreen(
  props: React.ComponentProps<typeof MoveContentScreen> = {
    currentPlaceId: "source",
    entityId: "shelf",
    kind: "place",
  },
) {
  return render(
    <ThemeProvider>
      <MoveContentScreen {...props} />
    </ThemeProvider>,
  )
}

function place(name: string, id: string, childPlaceCount = 0): PlaceSummary {
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
