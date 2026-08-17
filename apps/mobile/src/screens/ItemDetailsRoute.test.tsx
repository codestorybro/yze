import { Alert } from "react-native"
import { router } from "expo-router"
import { fireEvent, render, waitFor } from "@testing-library/react-native"

import ItemDetailsRoute from "@/app/(tabs)/places/item/[itemId]"
import { deleteItem, getItem, getPlace } from "@/services/api"
import type { Item, PlaceDetails } from "@/services/api/types"

const mockShowToast = jest.fn()

jest.mock("expo-router", () => ({
  router: { dismissTo: jest.fn(), push: jest.fn() },
  useLocalSearchParams: () => ({ itemId: "item-1" }),
}))
jest.mock("@/components/feedback/ToastProvider", () => ({
  useToast: () => ({ showToast: mockShowToast }),
}))
jest.mock("@/components/navigation/FloatingBackButton", () => ({
  FloatingBackButton: () => null,
}))
jest.mock("@/components/navigation/ContextualToolbar", () => ({
  ContextualToolbar: ({
    actions,
  }: {
    actions: Array<{ accessibilityLabel: string; onPress: () => void }>
  }) => {
    const { Pressable, Text, View } = jest.requireActual("react-native")
    return (
      <View>
        {actions.map((action) => (
          <Pressable
            accessibilityLabel={action.accessibilityLabel}
            key={action.accessibilityLabel}
            onPress={action.onPress}
          >
            <Text>{action.accessibilityLabel}</Text>
          </Pressable>
        ))}
      </View>
    )
  },
}))
jest.mock("@/screens/ItemDetailsScreen", () => ({ ItemDetailsScreen: () => null }))
jest.mock("@/services/api", () => ({
  deleteItem: jest.fn(),
  getItem: jest.fn(),
  getPlace: jest.fn(),
}))
jest.mock("@/utils/safeHaptics", () => ({ notifySuccess: jest.fn() }))

const mockedDeleteItem = deleteItem as jest.MockedFunction<typeof deleteItem>
const mockedGetItem = getItem as jest.MockedFunction<typeof getItem>
const mockedGetPlace = getPlace as jest.MockedFunction<typeof getPlace>
const alertSpy = jest.spyOn(Alert, "alert")

describe("ItemDetailsRoute", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedDeleteItem.mockResolvedValue({ kind: "ok", data: undefined })
    mockedGetItem.mockResolvedValue({ kind: "ok", data: item() })
    mockedGetPlace.mockResolvedValue({ kind: "ok", data: place() })
    alertSpy.mockImplementation((_title, _message, buttons) => {
      buttons?.find(({ style }) => style === "destructive")?.onPress?.()
    })
  })

  afterAll(() => alertSpy.mockRestore())

  it("dismisses to the Item's actual Place after deletion", async () => {
    const screen = render(<ItemDetailsRoute />)

    fireEvent.press(screen.getByLabelText("Delete Item"))

    await waitFor(() => {
      expect(mockedDeleteItem).toHaveBeenCalledWith("item-1")
      expect(router.dismissTo).toHaveBeenCalledWith("/places/place-1")
      expect(mockShowToast).toHaveBeenCalledWith("Item deleted")
    })
  })

  it("falls back to the Places root when the deleted Item's parent cannot be read", async () => {
    mockedGetItem.mockResolvedValue({ kind: "cannot-connect", temporary: true })
    const screen = render(<ItemDetailsRoute />)

    fireEvent.press(screen.getByLabelText("Delete Item"))

    await waitFor(() => expect(router.dismissTo).toHaveBeenCalledWith("/places"))
  })

  it("returns to the hierarchy when the Item lived directly in its immutable root", async () => {
    mockedGetPlace.mockResolvedValue({ kind: "ok", data: place(true) })
    const screen = render(<ItemDetailsRoute />)

    fireEvent.press(screen.getByLabelText("Delete Item"))

    await waitFor(() => expect(router.dismissTo).toHaveBeenCalledWith("/places"))
  })
})

function item(): Item {
  return {
    id: "item-1",
    placeId: "place-1",
    name: "USB-C cable",
    iconKey: "cable",
    photoUrl: null,
    brand: null,
    model: null,
    serialNumber: null,
    category: null,
    productionDate: null,
    purchaseDate: null,
    purchasePrice: null,
    purchaseCurrency: null,
    warrantyUntil: null,
    productUrl: null,
    quantity: 1,
    tags: [],
    notes: null,
    createdAt: "2026-08-01T10:00:00Z",
    updatedAt: "2026-08-01T10:00:00Z",
  }
}

function place(isRoot = false): PlaceDetails {
  return {
    id: isRoot ? "root" : "place-1",
    isRoot,
    name: isRoot ? "All gear" : "Desk",
    parentPlaceId: null,
    photoUrl: null,
    description: null,
    createdAt: "2026-08-01T10:00:00Z",
    updatedAt: "2026-08-01T10:00:00Z",
    ancestry: [],
    children: [],
    items: [],
  }
}
