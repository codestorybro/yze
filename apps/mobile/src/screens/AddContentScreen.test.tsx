import { router } from "expo-router"
import { fireEvent, render } from "@testing-library/react-native"

import { AddContentScreen } from "@/screens/AddContentScreen"
import { ThemeProvider } from "@/theme/context"

jest.mock("expo-router", () => ({ router: { replace: jest.fn() } }))
jest.mock("@/services/api", () => ({ getPlace: jest.fn() }))
jest.mock("@/components/Screen", () => {
  const { View } = jest.requireActual("react-native")
  return { Screen: ({ children }: { children: React.ReactNode }) => <View>{children}</View> }
})
jest.mock("@/components/organizer/FeatureHeader", () => {
  const { Text } = jest.requireActual("react-native")
  return { FeatureHeader: ({ title }: { title: string }) => <Text>{title}</Text> }
})
jest.mock("@/components/QuickAction", () => {
  const { Pressable, Text } = jest.requireActual("react-native")
  return {
    QuickAction: ({ label, onPress }: { label: string; onPress: () => void }) => (
      <Pressable accessibilityRole="button" onPress={onPress}>
        <Text>{label}</Text>
      </Pressable>
    ),
  }
})

describe("AddContentScreen", () => {
  beforeEach(() => jest.clearAllMocks())

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
})
