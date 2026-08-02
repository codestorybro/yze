import { router } from "expo-router"
import { fireEvent, render, waitFor } from "@testing-library/react-native"

import { ItemFormScreen } from "@/screens/ItemFormScreen"
import { createItem, getItem } from "@/services/api"
import type { Item } from "@/services/api/types"
import { ThemeProvider } from "@/theme/context"

const mockShowToast = jest.fn()

jest.mock("expo-router", () => ({ router: { back: jest.fn() } }))
jest.mock("@/components/feedback/ToastProvider", () => ({
  useToast: () => ({ showToast: mockShowToast }),
}))
jest.mock("expo-haptics", () => ({
  NotificationFeedbackType: { Success: "success" },
  notificationAsync: jest.fn().mockResolvedValue(undefined),
}))
jest.mock("@/services/api", () => ({
  createItem: jest.fn(),
  getItem: jest.fn(),
  getPlace: jest.fn(),
  updateItem: jest.fn(),
}))
jest.mock("@/components/Screen", () => {
  const { View } = jest.requireActual("react-native")
  return { Screen: ({ children }: { children: React.ReactNode }) => <View>{children}</View> }
})
jest.mock("@/components/organizer/FeatureHeader", () => ({ FeatureHeader: () => null }))
jest.mock("@/components/organizer/FormField", () => {
  const { Text, TextInput, View } = jest.requireActual("react-native")
  return {
    FormField: ({ error, label, onChangeText, value }: any) => (
      <View>
        <TextInput accessibilityLabel={label} onChangeText={onChangeText} value={value} />
        {error ? <Text>{error}</Text> : null}
      </View>
    ),
  }
})
jest.mock("@/components/organizer/IconPicker", () => {
  const { Pressable, Text, View } = jest.requireActual("react-native")
  return {
    IconPicker: ({ error, onChange }: any) => (
      <View>
        <Pressable accessibilityLabel="Choose cable icon" onPress={() => onChange("cable")}>
          <Text>Cable icon</Text>
        </Pressable>
        {error ? <Text>{error}</Text> : null}
      </View>
    ),
  }
})

const mockedCreateItem = createItem as jest.MockedFunction<typeof createItem>
const mockedGetItem = getItem as jest.MockedFunction<typeof getItem>

function renderScreen() {
  return render(
    <ThemeProvider>
      <ItemFormScreen placeId="place-1" placeName="Desk" />
    </ThemeProvider>,
  )
}

describe("ItemFormScreen", () => {
  beforeEach(() => jest.clearAllMocks())

  it("validates the minimal creation fields", () => {
    const screen = renderScreen()

    fireEvent.press(screen.getByText("Add Item"))
    expect(screen.getByText("Give this Item a name.")).toBeDefined()
    expect(screen.getByText("Select the icon that best identifies this Item.")).toBeDefined()
    expect(mockedCreateItem).not.toHaveBeenCalled()
  })

  it("creates an Item only after the API confirms persistence", async () => {
    mockedCreateItem.mockResolvedValue({ kind: "ok", data: item() })
    const screen = renderScreen()

    fireEvent.changeText(screen.getByLabelText("Name"), "USB-C cable")
    fireEvent.press(screen.getByLabelText("Choose cable icon"))
    fireEvent.press(screen.getByText("Add Item"))

    await waitFor(() => {
      expect(mockedCreateItem).toHaveBeenCalledWith(
        "place-1",
        expect.objectContaining({ name: "USB-C cable", iconKey: "cable", quantity: 1 }),
      )
      expect(router.back).toHaveBeenCalledTimes(1)
      expect(mockShowToast).toHaveBeenCalledWith("Item added")
    })
  })

  it("preserves the draft and exposes backend field errors", async () => {
    mockedCreateItem.mockResolvedValue({
      kind: "validation",
      code: "validation_failed",
      message: "Fix the highlighted fields.",
      errors: { name: ["That name is unavailable."] },
    })
    const screen = renderScreen()

    fireEvent.changeText(screen.getByLabelText("Name"), "Cable")
    fireEvent.press(screen.getByLabelText("Choose cable icon"))
    fireEvent.press(screen.getByText("Add Item"))

    await waitFor(() => {
      expect(screen.getByDisplayValue("Cable")).toBeDefined()
      expect(screen.getByText("That name is unavailable.")).toBeDefined()
      expect(router.back).not.toHaveBeenCalled()
      expect(mockShowToast).not.toHaveBeenCalled()
    })
  })

  it("shows backend validation beside progressively disclosed fields", async () => {
    mockedCreateItem.mockResolvedValue({
      kind: "validation",
      code: "validation_failed",
      message: "Fix the highlighted fields.",
      errors: { tags: ["Use at most 12 tags."] },
    })
    const screen = renderScreen()

    fireEvent.changeText(screen.getByLabelText("Name"), "Cable")
    fireEvent.press(screen.getByLabelText("Choose cable icon"))
    fireEvent.press(screen.getByText("Add details"))
    fireEvent.changeText(screen.getByLabelText("Tags"), "one, two")
    fireEvent.press(screen.getByText("Add Item"))

    await waitFor(() => expect(screen.getByText("Use at most 12 tags.")).toBeDefined())
  })

  it("does not expose an empty edit form when the Item cannot load", async () => {
    mockedGetItem.mockResolvedValue({ kind: "cannot-connect", temporary: true })
    const screen = render(
      <ThemeProvider>
        <ItemFormScreen itemId="item-1" />
      </ThemeProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText("This Item is unavailable")).toBeDefined()
      expect(screen.queryByLabelText("Name")).toBeNull()
      expect(screen.getByText("Try again")).toBeDefined()
    })
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
