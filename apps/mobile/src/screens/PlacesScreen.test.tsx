import { router } from "expo-router"
import { fireEvent, render } from "@testing-library/react-native"

import { PlacesScreen } from "@/screens/PlacesScreen"
import type { PlaceSummary } from "@/services/api/types"
import { ThemeProvider } from "@/theme/context"

let mockResource: Record<string, any>

jest.mock("@/hooks/useFocusedApiResource", () => ({
  useFocusedApiResource: () => mockResource,
}))
jest.mock("expo-router", () => ({ router: { navigate: jest.fn(), push: jest.fn() } }))
jest.mock("@/components/organizer/ListScreen", () => {
  const { View } = jest.requireActual("react-native")
  return {
    ListScreen: ({ data, ListEmptyComponent, ListHeaderComponent, renderItem }: any) => (
      <View>
        {ListHeaderComponent}
        {data.length
          ? data.map((item: unknown, index: number) => (
              <View key={(item as { id: string }).id}>{renderItem({ item, index })}</View>
            ))
          : ListEmptyComponent}
      </View>
    ),
  }
})
jest.mock("@/components/organizer/FeatureHeader", () => {
  const { Text } = jest.requireActual("react-native")
  return { FeatureHeader: ({ title }: { title: string }) => <Text>{title}</Text> }
})
jest.mock("@/components/organizer/PlaceCard", () => {
  const { Pressable, Text } = jest.requireActual("react-native")
  return {
    PlaceCard: ({ onPress, place }: { onPress: () => void; place: PlaceSummary }) => (
      <Pressable onPress={onPress} accessibilityRole="button">
        <Text>{place.name}</Text>
      </Pressable>
    ),
  }
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
      data: [],
      error: null,
      loading: false,
      refresh: jest.fn(),
      refreshing: false,
      retry: jest.fn(),
    }
    jest.clearAllMocks()
  })

  it("moves the empty-state copy into the primary header without a duplicate CTA", () => {
    const screen = renderScreen()

    expect(screen.getByText("Start with one real place")).toBeDefined()
    expect(screen.queryByText("Create your first Place")).toBeNull()
  })

  it("renders and opens visual root Places", () => {
    mockResource.data = [place("Desk"), place("Camera case", "place-2")]
    const screen = renderScreen()

    fireEvent.press(screen.getByText("Desk"))
    expect(router.push).toHaveBeenCalledWith("/places/place-1")
    expect(screen.getByText("Camera case")).toBeDefined()
    expect(screen.getByText("Places")).toBeDefined()
  })

  it("keeps API errors recoverable", () => {
    mockResource.error = "Backend unavailable"
    const screen = renderScreen()

    fireEvent.press(screen.getByText("Try again"))
    expect(mockResource.retry).toHaveBeenCalledTimes(1)
  })
})

function place(name: string, id = "place-1"): PlaceSummary {
  return {
    id,
    name,
    photoUrl: null,
    description: null,
    childPlaceCount: 0,
    itemCount: 0,
    createdAt: "2026-08-01T10:00:00Z",
    updatedAt: "2026-08-01T10:00:00Z",
  }
}
