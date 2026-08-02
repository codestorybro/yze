// The test fallback intentionally avoids the themed application Text wrapper.
// eslint-disable-next-line no-restricted-imports
import { Text } from "react-native"
import { fireEvent, render } from "@testing-library/react-native"

import { ThemeProvider } from "@/theme/context"

import { RemotePhoto } from "./RemotePhoto"

describe("RemotePhoto", () => {
  it("renders a polished fallback when no photo exists", () => {
    const screen = renderPhoto(
      <RemotePhoto accessibilityLabel="Photo" fallback={<Text>No photo fallback</Text>} />,
    )

    expect(screen.getByText("No photo fallback")).toBeDefined()
  })

  it("falls back when a remote image cannot load", () => {
    const screen = renderPhoto(
      <RemotePhoto
        accessibilityLabel="Gear photo"
        fallback={<Text>Safe fallback</Text>}
        url="https://example.test/missing.jpg"
      />,
    )

    expect(screen.getByLabelText("Loading photo")).toBeDefined()
    fireEvent(screen.getByLabelText("Gear photo"), "error")
    expect(screen.getByText("Safe fallback")).toBeDefined()
    expect(screen.getByLabelText("Photo unavailable")).toBeDefined()
  })
})

function renderPhoto(photo: React.ReactElement) {
  return render(<ThemeProvider>{photo}</ThemeProvider>)
}
