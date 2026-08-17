import { router } from "expo-router"
import { fireEvent, render, waitFor } from "@testing-library/react-native"

import type { OrganizerTreeRow } from "@/features/organizer/organizerTree"
import { PlacePickerScreen } from "@/screens/PlacePickerScreen"
import { getOrganizerTree, movePlace } from "@/services/api"
import type { OrganizerTree } from "@/services/api/types"
import { ThemeProvider } from "@/theme/context"
import { notifySuccess } from "@/utils/safeHaptics"

const mockShowToast = jest.fn()

jest.mock("expo-router", () => ({ router: { back: jest.fn(), replace: jest.fn() } }))
jest.mock("@/components/feedback/ToastProvider", () => ({
  useToast: () => ({ showToast: mockShowToast }),
}))
jest.mock("@/utils/safeHaptics", () => ({ notifySuccess: jest.fn() }))
jest.mock("@/services/api", () => ({
  getOrganizerTree: jest.fn(),
  movePlace: jest.fn(),
}))
jest.mock("@/components/organizer/FeatureHeader", () => ({
  FeatureHeader: ({ subtitle, title }: { subtitle?: string; title: string }) => {
    const { Text, View } = jest.requireActual("react-native")
    return (
      <View>
        <Text>{title}</Text>
        {subtitle ? <Text>{subtitle}</Text> : null}
      </View>
    )
  },
}))
jest.mock("@/components/navigation/SheetContent", () => ({
  SheetScrollView: ({ children }: { children: React.ReactNode }) => {
    const { View } = jest.requireActual("react-native")
    return <View>{children}</View>
  },
}))
jest.mock("@/components/organizer/OrganizerTreeView", () => {
  const { Pressable, Text, View } = jest.requireActual("react-native")
  return {
    OrganizerTreeView: ({
      ListHeaderComponent,
      floatingFooter,
      onSelect,
      selectedId,
      selectionAllowed,
      tree,
    }: any) => (
      <View>
        {ListHeaderComponent}
        {floatingFooter}
        {tree.places.map((place: OrganizerTree["places"][number]) => {
          const row = mockPlaceRow(place)
          const disabled = !selectionAllowed(row)
          return (
            <Pressable
              accessibilityLabel={`Select ${row.name}`}
              accessibilityRole="radio"
              accessibilityState={{ checked: selectedId === row.id, disabled }}
              disabled={disabled}
              key={row.id}
              onPress={() => onSelect(row)}
            >
              <Text>{row.name}</Text>
            </Pressable>
          )
        })}
      </View>
    ),
  }
})
jest.mock("@/components/organizer/TreeSelectionBar", () => {
  const { Pressable, Text, View } = jest.requireActual("react-native")
  return {
    TreeSelectionBar: ({ actionLabel, error, onPress, title }: any) => (
      <View>
        <Text>{title}</Text>
        <Pressable onPress={onPress}>
          <Text>{actionLabel}</Text>
        </Pressable>
        {error ? <Text>{error}</Text> : null}
      </View>
    ),
  }
})

const mockedGetOrganizerTree = getOrganizerTree as jest.MockedFunction<typeof getOrganizerTree>
const mockedMovePlace = movePlace as jest.MockedFunction<typeof movePlace>
const mockedNotifySuccess = notifySuccess as jest.MockedFunction<typeof notifySuccess>

describe("PlacePickerScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedGetOrganizerTree.mockResolvedValue({ kind: "ok", data: organizerTree() })
    mockedMovePlace.mockResolvedValue({ kind: "ok", data: {} as never })
  })

  it("shows the whole hierarchy and moves a valid Place into the destination", async () => {
    const screen = renderPicker()

    await waitFor(() => expect(screen.getByLabelText("Select Candidate")).toBeDefined())
    expect(screen.getByText("Ancestor")).toBeDefined()
    expect(screen.getByText("Destination")).toBeDefined()
    expect(screen.getByLabelText("Select Ancestor").props.accessibilityState.disabled).toBe(true)
    expect(screen.getByLabelText("Select Destination").props.accessibilityState.disabled).toBe(true)
    expect(screen.getByLabelText("Select Existing child").props.accessibilityState.disabled).toBe(
      true,
    )

    fireEvent.press(screen.getByLabelText("Select Candidate"))
    fireEvent.press(screen.getByText("Move here"))

    await waitFor(() => {
      expect(mockedMovePlace).toHaveBeenCalledWith("candidate", "destination")
      expect(mockShowToast).toHaveBeenCalledWith("Place moved into Destination")
      expect(mockedNotifySuccess).toHaveBeenCalledTimes(1)
      expect(router.back).toHaveBeenCalledTimes(1)
    })
  })

  it("opens a selected Place for editing without changing the hierarchy", async () => {
    const screen = render(
      <ThemeProvider>
        <PlacePickerScreen mode="manage" />
      </ThemeProvider>,
    )

    await waitFor(() => expect(screen.getByLabelText("Select Candidate")).toBeDefined())
    fireEvent.press(screen.getByLabelText("Select Candidate"))
    fireEvent.press(screen.getByText("Edit Place"))

    expect(router.replace).toHaveBeenCalledWith("/places/place-form?placeId=candidate")
    expect(mockedMovePlace).not.toHaveBeenCalled()
  })

  it("maps the visible organizer root to a null Place parent", async () => {
    const screen = render(
      <ThemeProvider>
        <PlacePickerScreen
          destinationPlaceId="root"
          destinationPlaceName="All gear"
          mode="attach"
        />
      </ThemeProvider>,
    )

    await waitFor(() => expect(screen.getByLabelText("Select Destination")).toBeDefined())
    fireEvent.press(screen.getByLabelText("Select Destination"))
    fireEvent.press(screen.getByText("Move here"))

    await waitFor(() => {
      expect(mockedMovePlace).toHaveBeenCalledWith("destination", null)
      expect(mockShowToast).toHaveBeenCalledWith("Place moved into All gear")
    })
  })

  it("retries loading the complete hierarchy after an API failure", async () => {
    mockedGetOrganizerTree
      .mockResolvedValueOnce({ kind: "cannot-connect", temporary: true })
      .mockResolvedValueOnce({ kind: "ok", data: organizerTree() })
    const screen = renderPicker()

    await waitFor(() => expect(screen.getByText("Try again")).toBeDefined())
    fireEvent.press(screen.getByText("Try again"))

    await waitFor(() => {
      expect(mockedGetOrganizerTree).toHaveBeenCalledTimes(2)
      expect(screen.getByLabelText("Select Candidate")).toBeDefined()
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

function organizerTree(): OrganizerTree {
  return {
    root: { id: "root", name: "All gear", childPlaceCount: 2, itemCount: 0 },
    places: [
      place("Ancestor", "ancestor", "root"),
      place("Destination", "destination", "ancestor"),
      place("Existing child", "existing", "destination"),
      place("Candidate", "candidate", "root"),
    ],
    items: [],
  }
}

function place(name: string, id: string, parentPlaceId: string) {
  return {
    id,
    name,
    parentPlaceId,
    photoUrl: null,
    description: null,
    createdAt: "2026-08-01T10:00:00Z",
    updatedAt: "2026-08-01T10:00:00Z",
  }
}

function mockPlaceRow(place: OrganizerTree["places"][number]): OrganizerTreeRow {
  return {
    id: place.id,
    kind: "place",
    name: place.name,
    parentId: place.parentPlaceId,
    depth: 1,
    connections: [],
    childCount: 0,
    expandable: false,
    expanded: true,
  }
}
