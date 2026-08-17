import { router } from "expo-router"
import { fireEvent, render } from "@testing-library/react-native"

import PlacesRoute from "@/app/(tabs)/places"

const mockActions: Array<{
  accessibilityLabel: string
  icon: { android: string; ios: string; web: string }
  onPress: () => void
}> = []

jest.mock("expo-router", () => ({
  router: { push: jest.fn() },
}))
jest.mock("@/components/navigation/ContextualToolbar", () => {
  const { Pressable, Text, View } = jest.requireActual("react-native")
  return {
    ContextualToolbar: ({ actions }: { actions: typeof mockActions }) => {
      mockActions.splice(0, mockActions.length, ...actions)
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
  }
})
jest.mock("@/screens/PlacesScreen", () => ({ PlacesScreen: () => null }))

describe("PlacesRoute", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockActions.length = 0
  })

  it("uses the persistent bottom tabs for root navigation and has no redundant Back button", () => {
    const screen = render(<PlacesRoute />)

    expect(screen.queryByLabelText("Back to Home")).toBeNull()
    expect(mockActions).toHaveLength(2)
  })

  it("adds content directly under the organizer root", () => {
    const screen = render(<PlacesRoute />)

    fireEvent.press(screen.getByLabelText("Add Place or Item"))
    expect(router.push).toHaveBeenCalledWith("/places/add?root=true")
  })

  it("uses a pencil action to choose the Place to edit", () => {
    const screen = render(<PlacesRoute />)

    expect(mockActions[1].icon).toEqual({ ios: "pencil", android: "edit", web: "edit" })
    fireEvent.press(screen.getByLabelText("Choose a Place to edit"))
    expect(router.push).toHaveBeenCalledWith("/places/place-picker?mode=manage")
  })
})
