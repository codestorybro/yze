import { router } from "expo-router"
import { fireEvent, render, waitFor } from "@testing-library/react-native"

import type { OrganizerTreeRow } from "@/features/organizer/organizerTree"
import { MoveContentScreen } from "@/screens/MoveContentScreen"
import { getOrganizerTree, moveItem, movePlace } from "@/services/api"
import type { OrganizerTree } from "@/services/api/types"
import { ThemeProvider } from "@/theme/context"
import { notifySuccess } from "@/utils/safeHaptics"

const mockShowToast = jest.fn()

jest.mock("expo-router", () => ({ router: { dismissTo: jest.fn() } }))
jest.mock("@/components/feedback/ToastProvider", () => ({
  useToast: () => ({ showToast: mockShowToast }),
}))
jest.mock("@/utils/safeHaptics", () => ({ notifySuccess: jest.fn() }))
jest.mock("@/services/api", () => ({
  getOrganizerTree: jest.fn(),
  moveItem: jest.fn(),
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
        {[mockRootRow(tree), ...tree.places.map(mockPlaceRow)].map((row: OrganizerTreeRow) => {
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
const mockedMoveItem = moveItem as jest.MockedFunction<typeof moveItem>
const mockedMovePlace = movePlace as jest.MockedFunction<typeof movePlace>
const mockedNotifySuccess = notifySuccess as jest.MockedFunction<typeof notifySuccess>

describe("MoveContentScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedGetOrganizerTree.mockResolvedValue({ kind: "ok", data: organizerTree() })
    mockedMoveItem.mockResolvedValue({ kind: "ok", data: {} as never })
    mockedMovePlace.mockResolvedValue({ kind: "ok", data: {} as never })
  })

  it("shows the complete hierarchy instead of one Place level at a time", async () => {
    const screen = renderScreen()

    await waitFor(() => {
      expect(screen.getByLabelText("Select All gear")).toBeDefined()
      expect(screen.getByLabelText("Select Studio")).toBeDefined()
      expect(screen.getByLabelText("Select Shelf")).toBeDefined()
      expect(screen.getByLabelText("Select Drawer")).toBeDefined()
    })
  })

  it("moves an Item into the selected Place and confirms it once", async () => {
    const screen = renderScreen({ currentPlaceId: "source", entityId: "item-1", kind: "item" })

    await waitFor(() => expect(screen.getByLabelText("Select Studio")).toBeDefined())
    fireEvent.press(screen.getByLabelText("Select Studio"))
    fireEvent.press(screen.getByText("Move here"))

    await waitFor(() => {
      expect(mockedMoveItem).toHaveBeenCalledWith("item-1", "studio")
      expect(mockShowToast).toHaveBeenCalledWith("Item moved to Studio")
      expect(mockedNotifySuccess).toHaveBeenCalledTimes(1)
      expect(router.dismissTo).toHaveBeenCalledWith("/places/studio")
    })
  })

  it("moves a Place to the immutable root using the legacy null parent contract", async () => {
    const screen = renderScreen()

    await waitFor(() => expect(screen.getByLabelText("Select All gear")).toBeDefined())
    fireEvent.press(screen.getByLabelText("Select All gear"))
    fireEvent.press(screen.getByText("Move here"))

    await waitFor(() => {
      expect(mockedMovePlace).toHaveBeenCalledWith("shelf", null)
      expect(router.dismissTo).toHaveBeenCalledWith("/places")
    })
  })

  it("disables the current parent, the moving Place, and its descendants", async () => {
    const screen = renderScreen()

    await waitFor(() => expect(screen.getByLabelText("Select Studio")).toBeDefined())
    expect(screen.getByLabelText("Select Studio").props.accessibilityState.disabled).toBe(true)
    expect(screen.getByLabelText("Select Shelf").props.accessibilityState.disabled).toBe(true)
    expect(screen.getByLabelText("Select Drawer").props.accessibilityState.disabled).toBe(true)
    expect(screen.getByLabelText("Select All gear").props.accessibilityState.disabled).toBe(false)
  })

  it("retries loading the full hierarchy after a temporary failure", async () => {
    mockedGetOrganizerTree
      .mockResolvedValueOnce({ kind: "cannot-connect", temporary: true })
      .mockResolvedValueOnce({ kind: "ok", data: organizerTree() })
    const screen = renderScreen()

    await waitFor(() => expect(screen.getByText("Try again")).toBeDefined())
    fireEvent.press(screen.getByText("Try again"))

    await waitFor(() => {
      expect(mockedGetOrganizerTree).toHaveBeenCalledTimes(2)
      expect(screen.getByLabelText("Select Drawer")).toBeDefined()
    })
  })
})

function renderScreen(
  props: React.ComponentProps<typeof MoveContentScreen> = {
    currentPlaceId: "studio",
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

function organizerTree(): OrganizerTree {
  return {
    root: { id: "root", name: "All gear", childPlaceCount: 2, itemCount: 0 },
    places: [
      place("Studio", "studio", "root"),
      place("Source", "source", "root"),
      place("Shelf", "shelf", "studio"),
      place("Drawer", "drawer", "shelf"),
    ],
    items: [
      {
        id: "item-1",
        placeId: "source",
        name: "Camera",
        iconKey: "camera",
        quantity: 1,
      },
    ],
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

function mockRootRow(tree: OrganizerTree): OrganizerTreeRow {
  return {
    id: tree.root.id,
    kind: "root",
    name: tree.root.name,
    parentId: null,
    depth: 0,
    connections: [],
    childCount: tree.root.childPlaceCount + tree.root.itemCount,
    expandable: true,
    expanded: true,
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
