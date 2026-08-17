import { fireEvent, render } from "@testing-library/react-native"

import { ContextualToolbar } from "@/components/navigation/ContextualToolbar"
import { ThemeProvider } from "@/theme/context"

jest.mock("expo-router", () => {
  const { View } = jest.requireActual("react-native")
  function Toolbar({ children }: { children: React.ReactNode }) {
    return <View>{children}</View>
  }
  function ToolbarView({ children }: { children: React.ReactNode }) {
    return <View>{children}</View>
  }
  function ToolbarSpacer() {
    return null
  }
  Toolbar.View = ToolbarView
  Toolbar.Spacer = ToolbarSpacer
  return { Stack: { Toolbar }, useFocusEffect: jest.fn() }
})
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ bottom: 0, left: 0, right: 0, top: 0 }),
}))

describe("ContextualToolbar", () => {
  it("keeps icon-only native actions accessible and actionable", () => {
    const add = jest.fn()
    const manage = jest.fn()
    const screen = render(
      <ThemeProvider>
        <ContextualToolbar
          actions={[
            {
              accessibilityLabel: "Add Place",
              fallback: "+",
              icon: { ios: "plus", android: "add", web: "add" },
              onPress: add,
            },
            {
              accessibilityLabel: "Choose a Place to edit",
              fallback: "E",
              icon: { ios: "pencil", android: "edit", web: "edit" },
              onPress: manage,
            },
          ]}
        />
      </ThemeProvider>,
    )

    fireEvent.press(screen.getByLabelText("Add Place"))
    fireEvent.press(screen.getByLabelText("Choose a Place to edit"))
    expect(add).toHaveBeenCalledTimes(1)
    expect(manage).toHaveBeenCalledTimes(1)
  })
})
