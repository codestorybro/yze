import { render } from "@testing-library/react-native"

import PlacesLayout, { unstable_settings } from "@/app/(tabs)/places/_layout"

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
  return { Stack }
})
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

  it("leaves the root header hidden because persistent tabs own root navigation", () => {
    render(<PlacesLayout />)

    expect(mockScreenOptions.get("index")).toEqual({ headerShown: false })
  })

  it("anchors nested deep links to the Places root so native Back always has a destination", () => {
    expect(unstable_settings).toEqual({ initialRouteName: "index" })
  })
})
