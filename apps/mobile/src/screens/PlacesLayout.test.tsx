import { render } from "@testing-library/react-native"

import PlacesLayout from "@/app/(tabs)/places/_layout"

const mockSetNativeTabsHidden = jest.fn()
const mockScreenOptions = new Map<string, Record<string, unknown>>()

jest.mock("expo-router", () => {
  const { View } = jest.requireActual("react-native")

  function Stack({ children }: { children: React.ReactNode }) {
    return <View>{children}</View>
  }
  function StackScreen({ name, options }: { name: string; options?: Record<string, unknown> }) {
    mockScreenOptions.set(name, options ?? {})
    return null
  }
  Stack.Screen = StackScreen

  return {
    Stack,
    useFocusEffect: (effect: () => void) => effect(),
  }
})
jest.mock("@/components/ScreenChromeContext", () => ({
  useScreenChrome: () => ({ setNativeTabsHidden: mockSetNativeTabsHidden }),
}))
jest.mock("@/theme/context", () => ({
  useAppTheme: () => ({ theme: { colors: { background: "white", text: "black" } } }),
}))

describe("PlacesLayout", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockScreenOptions.clear()
  })

  it("gives every form sheet a stable full-height expansion target", () => {
    render(<PlacesLayout />)

    for (const route of ["add", "place-form", "item-form", "move", "place-picker"]) {
      expect(mockScreenOptions.get(route)).toMatchObject({
        headerShown: false,
        presentation: "formSheet",
        sheetAllowedDetents: [0.8, 1],
        sheetExpandsWhenScrolledToEdge: true,
        sheetInitialDetentIndex: 0,
      })
    }
  })

  it("keeps a transparent native header available for the root Back control", () => {
    render(<PlacesLayout />)

    expect(mockScreenOptions.get("index")).toMatchObject({
      headerBackVisible: false,
      headerShown: true,
      headerTransparent: true,
    })
  })
})
