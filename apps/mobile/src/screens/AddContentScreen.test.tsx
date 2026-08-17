import { router } from "expo-router"
import { fireEvent, render, waitFor } from "@testing-library/react-native"

import { AddContentScreen } from "@/screens/AddContentScreen"
import { getOrganizerTree } from "@/services/api"
import type { OrganizerTree } from "@/services/api/types"
import { ThemeProvider } from "@/theme/context"

jest.mock("expo-router", () => ({ router: { replace: jest.fn() } }))
jest.mock("@/services/api", () => ({ getOrganizerTree: jest.fn(), getPlace: jest.fn() }))
jest.mock("@/components/navigation/SheetContent", () => {
  const { View } = jest.requireActual("react-native")
  return {
    SheetScrollView: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
  }
})
jest.mock("@/components/organizer/FeatureHeader", () => {
  const { Text } = jest.requireActual("react-native")
  return { FeatureHeader: ({ title }: { title: string }) => <Text>{title}</Text> }
})
jest.mock("@/components/QuickAction", () => {
  const { Pressable, Text } = jest.requireActual("react-native")
  return {
    QuickAction: ({
      disabled,
      label,
      onPress,
    }: {
      disabled?: boolean
      label: string
      onPress: () => void
    }) => (
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={onPress}
      >
        <Text>{label}</Text>
      </Pressable>
    ),
  }
})

describe("AddContentScreen", () => {
  const mockedGetOrganizerTree = getOrganizerTree as jest.MockedFunction<typeof getOrganizerTree>

  beforeEach(() => {
    jest.clearAllMocks()
    mockedGetOrganizerTree.mockResolvedValue({ kind: "ok", data: organizerTree() })
  })

  it("offers new Place, new Item, and an existing Place without duplicate actions", () => {
    const screen = render(
      <ThemeProvider>
        <AddContentScreen placeId="desk" placeName="Desk" />
      </ThemeProvider>,
    )

    expect(screen.getAllByRole("button")).toHaveLength(3)
    expect(screen.getByText("Add Place")).toBeDefined()
    expect(screen.getByText("Add Item")).toBeDefined()

    fireEvent.press(screen.getByText("Use existing Place"))
    expect(router.replace).toHaveBeenCalledWith(
      "/places/place-picker?mode=attach&destinationPlaceId=desk&destinationPlaceName=Desk",
    )
  })

  it("resolves the immutable root before enabling root Item and move actions", async () => {
    const screen = render(
      <ThemeProvider>
        <AddContentScreen root />
      </ThemeProvider>,
    )

    const addItem = await screen.findByRole("button", { name: "Add Item" })
    await waitFor(() => expect(addItem.props.accessibilityState.disabled).toBe(false))
    fireEvent.press(addItem)
    expect(router.replace).toHaveBeenCalledWith(
      "/places/item-form?placeId=root&placeName=All%20gear",
    )

    fireEvent.press(screen.getByText("Use existing Place"))
    expect(router.replace).toHaveBeenCalledWith(
      "/places/place-picker?mode=attach&destinationPlaceId=root&destinationPlaceName=All%20gear",
    )
  })
})

function organizerTree(): OrganizerTree {
  return {
    root: { id: "root", name: "All gear", childPlaceCount: 0, itemCount: 0 },
    places: [],
    items: [],
  }
}
