import { router } from "expo-router"
import { act, fireEvent, render, waitFor } from "@testing-library/react-native"

import { PlacesScreen } from "@/screens/PlacesScreen"
import { moveItem, movePlace } from "@/services/api"
import type { OrganizerTree } from "@/services/api/types"
import { ThemeProvider } from "@/theme/context"
import { notifySuccess } from "@/utils/safeHaptics"

let mockResource: Record<string, any>
let mockTreeProps: Record<string, any>
const mockShowToast = jest.fn()

jest.mock("@/hooks/useFocusedApiResource", () => ({
  useFocusedApiResource: () => mockResource,
}))
jest.mock("expo-router", () => ({ router: { push: jest.fn() } }))
jest.mock("@/components/feedback/ToastProvider", () => ({
  useToast: () => ({ showToast: mockShowToast }),
}))
jest.mock("@/services/api", () => ({
  getOrganizerTree: jest.fn(),
  moveItem: jest.fn(),
  movePlace: jest.fn(),
}))
jest.mock("@/utils/safeHaptics", () => ({ notifySuccess: jest.fn() }))
jest.mock("@/components/organizer/ListScreen", () => {
  const { View } = jest.requireActual("react-native")
  return {
    ListScreen: ({ ListEmptyComponent, ListHeaderComponent }: any) => (
      <View>
        {ListHeaderComponent}
        {ListEmptyComponent}
      </View>
    ),
  }
})
jest.mock("@/components/organizer/OrganizerTreeView", () => {
  const { Pressable, Text, View } = jest.requireActual("react-native")
  return {
    OrganizerTreeView: (props: any) => {
      mockTreeProps = props
      return (
        <View>
          {props.ListHeaderComponent}
          {props.tree.places.map((place: { id: string; name: string }) => (
            <Pressable
              accessibilityLabel={`Open ${place.name}`}
              key={place.id}
              onPress={() => props.onOpenPlace(place.id)}
            >
              <Text>{place.name}</Text>
            </Pressable>
          ))}
          {props.tree.items.map((item: { id: string; name: string }) => (
            <Pressable
              accessibilityLabel={`Open ${item.name}`}
              key={item.id}
              onPress={() => props.onOpenItem(item.id)}
            >
              <Text>{item.name}</Text>
            </Pressable>
          ))}
        </View>
      )
    },
  }
})
jest.mock("@/components/organizer/FeatureHeader", () => {
  const { Text } = jest.requireActual("react-native")
  return { FeatureHeader: ({ title }: { title: string }) => <Text>{title}</Text> }
})
jest.mock("@/components/organizer/ContentState", () => {
  const { Pressable, Text, View } = jest.requireActual("react-native")
  return {
    ContentState: ({ actionLabel, description, onAction, title }: any) => (
      <View>
        <Text>{title}</Text>
        <Text>{description}</Text>
        {actionLabel ? (
          <Pressable onPress={onAction}>
            <Text>{actionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    ),
  }
})

const mockedMoveItem = moveItem as jest.MockedFunction<typeof moveItem>
const mockedMovePlace = movePlace as jest.MockedFunction<typeof movePlace>
const mockedNotifySuccess = notifySuccess as jest.MockedFunction<typeof notifySuccess>

function renderScreen() {
  return render(
    <ThemeProvider>
      <PlacesScreen />
    </ThemeProvider>,
  )
}

describe("PlacesScreen", () => {
  beforeEach(() => {
    mockResource = {
      data: tree(),
      error: null,
      loading: false,
      refresh: jest.fn().mockResolvedValue(undefined),
      refreshing: false,
      retry: jest.fn(),
    }
    mockedMoveItem.mockResolvedValue({ kind: "ok", data: {} as never })
    mockedMovePlace.mockResolvedValue({ kind: "ok", data: {} as never })
    jest.clearAllMocks()
  })

  it("starts from the immutable root without forcing artificial scrolling", async () => {
    mockResource.data = { ...tree(), places: [], items: [] }
    const screen = renderScreen()

    await waitFor(() => expect(screen.getByText("Start with something real")).toBeDefined())
    expect(mockTreeProps.scrollEnabled).toBeUndefined()
    expect(mockTreeProps.tree.root.name).toBe("All gear")
  })

  it("opens both Places and Items from the same hierarchy", async () => {
    const screen = renderScreen()

    await waitFor(() => expect(screen.getByText("Your gear tree")).toBeDefined())
    fireEvent.press(screen.getByLabelText("Open Studio"))
    fireEvent.press(screen.getByLabelText("Open Camera"))

    expect(router.push).toHaveBeenCalledWith("/places/studio")
    expect(router.push).toHaveBeenCalledWith("/places/item/camera")
  })

  it("persists one drag move and gives one success feedback", async () => {
    renderScreen()
    await waitFor(() => expect(mockTreeProps.onMove).toBeDefined())

    await act(async () => {
      await mockTreeProps.onMove({ kind: "item", id: "camera" }, "studio")
    })

    expect(mockedMoveItem).toHaveBeenCalledTimes(1)
    expect(mockedMoveItem).toHaveBeenCalledWith("camera", "studio")
    expect(mockedNotifySuccess).toHaveBeenCalledTimes(1)
    expect(mockShowToast).toHaveBeenCalledWith("Item moved to Studio")
    expect(mockResource.refresh).toHaveBeenCalledTimes(1)
  })

  it("keeps initial API errors recoverable", () => {
    mockResource.data = null
    mockResource.error = "Backend unavailable"
    const screen = renderScreen()

    fireEvent.press(screen.getByText("Try again"))
    expect(mockResource.retry).toHaveBeenCalledTimes(1)
  })
})

function tree(): OrganizerTree {
  const timestamp = "2026-08-02T10:00:00Z"
  return {
    root: { id: "root", name: "All gear", childPlaceCount: 1, itemCount: 1 },
    places: [
      {
        id: "studio",
        parentPlaceId: "root",
        name: "Studio",
        photoUrl: null,
        description: null,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ],
    items: [
      {
        id: "camera",
        placeId: "root",
        name: "Camera",
        iconKey: "camera",
        quantity: 1,
      },
    ],
  }
}
