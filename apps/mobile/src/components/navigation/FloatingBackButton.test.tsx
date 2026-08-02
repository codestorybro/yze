import { router } from "expo-router"
import { fireEvent, render } from "@testing-library/react-native"

import { FloatingBackButton } from "@/components/navigation/FloatingBackButton"
import { ThemeProvider } from "@/theme/context"

jest.mock("expo-router", () => {
  const { Pressable, View } = jest.requireActual("react-native")
  const router = { back: jest.fn() }
  function Toolbar({ children }: { children: React.ReactNode }) {
    return <View>{children}</View>
  }
  function ToolbarButton({
    accessibilityLabel,
    onPress,
  }: {
    accessibilityLabel: string
    onPress: () => void
  }) {
    return <Pressable accessibilityLabel={accessibilityLabel} onPress={onPress} />
  }
  Toolbar.Button = ToolbarButton
  return { router, Stack: { Toolbar } }
})

describe("FloatingBackButton", () => {
  it("exposes one accessible Back action owned by the native header", () => {
    const screen = render(
      <ThemeProvider>
        <FloatingBackButton />
      </ThemeProvider>,
    )

    fireEvent.press(screen.getByLabelText("Back"))
    expect(router.back).toHaveBeenCalledTimes(1)
  })
})
