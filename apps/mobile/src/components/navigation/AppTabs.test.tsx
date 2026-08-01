import type { ReactNode } from "react"
import { render } from "@testing-library/react-native"

import { AppTabs } from "@/components/navigation/AppTabs"
import { ThemeProvider } from "@/theme/context"

let mockNativeTabsProps: Record<string, unknown> | undefined

jest.mock("expo-router/unstable-native-tabs", () => {
  const { Text: NativeText, View } = jest.requireActual("react-native")

  const Trigger = ({ children, name }: { children: ReactNode; name: string }) => (
    <View testID={`tab-${name}`}>{children}</View>
  )
  function TriggerIcon() {
    return null
  }
  function TriggerLabel({ children }: { children: ReactNode }) {
    return <NativeText>{children}</NativeText>
  }
  Trigger.Icon = TriggerIcon
  Trigger.Label = TriggerLabel

  const NativeTabs = ({ children, ...props }: { children: ReactNode }) => {
    mockNativeTabsProps = props
    return <View>{children}</View>
  }
  NativeTabs.Trigger = Trigger

  return { NativeTabs }
})

describe("AppTabs", () => {
  it("declares the stable top-level destinations", () => {
    const screen = render(
      <ThemeProvider>
        <AppTabs />
      </ThemeProvider>,
    )

    expect(screen.getByTestId("tab-index")).toBeDefined()
    expect(screen.getByText("Home")).toBeDefined()
    expect(screen.getByTestId("tab-places")).toBeDefined()
    expect(screen.getByText("Places")).toBeDefined()
    expect(screen.getByTestId("tab-settings")).toBeDefined()
    expect(screen.getByText("Settings")).toBeDefined()
    expect(mockNativeTabsProps).toMatchObject({
      disableTransparentOnScrollEdge: true,
    })
    expect(mockNativeTabsProps).not.toHaveProperty("blurEffect")
  })
})
