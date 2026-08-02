import { router } from "expo-router"
import { fireEvent, render } from "@testing-library/react-native"

import { PlaceDetailsScreen } from "@/screens/PlaceDetailsScreen"
import type { Item, PlaceDetails, PlaceSummary } from "@/services/api/types"
import { ThemeProvider } from "@/theme/context"

let mockResource: Record<string, any>
let mockListProps: Record<string, any>

jest.mock("@/hooks/useFocusedApiResource", () => ({ useFocusedApiResource: () => mockResource }))
jest.mock("expo-router", () => ({ router: { back: jest.fn(), push: jest.fn() } }))
jest.mock("@/components/organizer/ListScreen", () => {
  const { View } = jest.requireActual("react-native")
  return {
    ListScreen: (props: any) => {
      mockListProps = props
      const { data, ListEmptyComponent, ListHeaderComponent, renderItem } = props
      return (
        <View>
          {ListHeaderComponent}
          {data.length
            ? data.map((item: { key: string }, index: number) => (
                <View key={item.key}>{renderItem({ item, index })}</View>
              ))
            : ListEmptyComponent}
        </View>
      )
    },
  }
})
jest.mock("@/components/organizer/FeatureHeader", () => {
  const { Pressable, Text, View } = jest.requireActual("react-native")
  return {
    FeatureHeader: ({ actionLabel, onAction, title }: any) => (
      <View>
        <Text>{title}</Text>
        <Pressable onPress={onAction}>
          <Text>{actionLabel}</Text>
        </Pressable>
      </View>
    ),
  }
})
jest.mock("@/components/organizer/PlaceCard", () => {
  const { Pressable, Text } = jest.requireActual("react-native")
  return {
    PlaceCard: ({ onPress, place }: { onPress: () => void; place: PlaceSummary }) => (
      <Pressable onPress={onPress}>
        <Text>{place.name}</Text>
      </Pressable>
    ),
  }
})
jest.mock("@/components/organizer/ItemCard", () => {
  const { Pressable, Text } = jest.requireActual("react-native")
  return {
    ItemCard: ({ item, onPress }: { item: Item; onPress: () => void }) => (
      <Pressable onPress={onPress}>
        <Text>{item.name}</Text>
      </Pressable>
    ),
  }
})
jest.mock("@/components/organizer/ContentState", () => ({ ContentState: () => null }))

describe("PlaceDetailsScreen", () => {
  beforeEach(() => {
    mockResource = {
      data: details(),
      error: null,
      loading: false,
      refresh: jest.fn(),
      refreshing: false,
      retry: jest.fn(),
    }
    jest.clearAllMocks()
  })

  it("renders visually distinct child Places and Items", () => {
    const screen = render(
      <ThemeProvider>
        <PlaceDetailsScreen placeId="root" />
      </ThemeProvider>,
    )

    expect(screen.getByText("Places inside")).toBeDefined()
    expect(screen.getByText("Upper drawer")).toBeDefined()
    expect(screen.getByText("Gear in this Place")).toBeDefined()
    expect(screen.getByText("USB-C cable")).toBeDefined()
    expect(mockListProps.scrollEnabled).toBe(true)

    fireEvent.press(screen.getByText("Upper drawer"))
    expect(router.push).toHaveBeenCalledWith("/places/child")
    fireEvent.press(screen.getByText("USB-C cable"))
    expect(router.push).toHaveBeenCalledWith("/places/item/item-1")
  })

  it("uses the empty guidance as the header and does not duplicate Add actions", () => {
    mockResource.data = { ...details(), children: [], items: [] }
    const screen = render(
      <ThemeProvider>
        <PlaceDetailsScreen placeId="root" />
      </ThemeProvider>,
    )

    expect(screen.getByText("Ready for something")).toBeDefined()
    expect(screen.queryByText("Add content")).toBeNull()
    expect(screen.queryByText("Add to this Place")).toBeNull()
    expect(mockListProps.scrollEnabled).toBe(false)
  })
})

function details(): PlaceDetails {
  return {
    id: "root",
    name: "Desk",
    parentPlaceId: null,
    photoUrl: null,
    description: null,
    createdAt: "2026-08-01T10:00:00Z",
    updatedAt: "2026-08-01T10:00:00Z",
    ancestry: [],
    children: [summary()],
    items: [item()],
  }
}

function summary(): PlaceSummary {
  return {
    id: "child",
    name: "Upper drawer",
    photoUrl: null,
    description: null,
    childPlaceCount: 0,
    itemCount: 0,
    createdAt: "2026-08-01T10:00:00Z",
    updatedAt: "2026-08-01T10:00:00Z",
  }
}

function item(): Item {
  return {
    id: "item-1",
    placeId: "root",
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
