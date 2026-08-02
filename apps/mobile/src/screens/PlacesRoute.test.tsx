import { router } from "expo-router"
import { fireEvent, render } from "@testing-library/react-native"

import PlacesRoute from "@/app/(tabs)/places"

const mockActions: Array<{
  accessibilityLabel: string
  icon: { android: string; ios: string; web: string }
  onPress: () => void
}> = []

jest.mock("expo-router", () => ({
  router: { dismissTo: jest.fn(), push: jest.fn() },
}))
jest.mock("@/components/navigation/FloatingBackButton", () => {
  const { Pressable } = jest.requireActual("react-native")
  return {
    FloatingBackButton: ({
      accessibilityLabel,
      onPress,
    }: {
      accessibilityLabel: string
      onPress: () => void
    }) => <Pressable accessibilityLabel={accessibilityLabel} onPress={onPress} />,
  }
})
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

  it("returns explicitly to Home instead of depending on stack history", () => {
    const screen = render(<PlacesRoute />)

    fireEvent.press(screen.getByLabelText("Back to Home"))
    expect(router.dismissTo).toHaveBeenCalledWith("/")
  })

  it("uses a pencil action to choose the Place to edit", () => {
    const screen = render(<PlacesRoute />)

    expect(mockActions[1].icon).toEqual({ ios: "pencil", android: "edit", web: "edit" })
    fireEvent.press(screen.getByLabelText("Choose a Place to edit"))
    expect(router.push).toHaveBeenCalledWith("/places/place-picker?mode=manage")
  })
})
