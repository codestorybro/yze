import { fireEvent, render, waitFor } from "@testing-library/react-native"

import { OrganizerTreeView } from "@/components/organizer/OrganizerTreeView"
import { Text } from "@/components/Text"
import type { OrganizerTree } from "@/services/api/types"
import { ThemeProvider } from "@/theme/context"

jest.mock("react-native-gesture-handler", () => {
  const { View } = jest.requireActual("react-native")
  const pan = () => {
    const gesture: Record<string, jest.Mock> = {}
    for (const method of [
      "enabled",
      "activateAfterLongPress",
      "shouldCancelWhenOutside",
      "onStart",
      "onUpdate",
      "onEnd",
      "onFinalize",
    ]) {
      gesture[method] = jest.fn(() => gesture)
    }
    return gesture
  }
  return {
    Gesture: { Pan: pan },
    GestureDetector: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
  }
})
jest.mock("@/components/navigation/SheetContent", () => {
  const React = jest.requireActual("react")
  const { View } = jest.requireActual("react-native")
  return {
    SheetList: React.forwardRef(
      (
        {
          data,
          ListFooterComponent,
          ListHeaderComponent,
          renderItem,
        }: {
          data: Array<{ id: string; kind: string }>
          ListFooterComponent?: React.ReactNode
          ListHeaderComponent?: React.ReactNode
          renderItem: (info: { item: any; index: number }) => React.ReactNode
        },
        ref: React.Ref<unknown>,
      ) => {
        React.useImperativeHandle(ref, () => ({
          getNativeScrollRef: () => null,
          scrollToOffset: jest.fn(),
        }))
        return (
          <View>
            {ListHeaderComponent}
            {data.map((item, index) => (
              <View key={`${item.kind}:${item.id}`}>{renderItem({ item, index })}</View>
            ))}
            {ListFooterComponent}
          </View>
        )
      },
    ),
  }
})
jest.mock("@/components/BrandMark", () => {
  const { View } = jest.requireActual("react-native")
  return { BrandMark: () => <View testID="brand-mark" /> }
})
jest.mock("@/components/organizer/ItemIcon", () => {
  const { View } = jest.requireActual("react-native")
  return {
    ItemIcon: ({ iconKey }: { iconKey: string }) => <View testID={`item-icon-${iconKey}`} />,
  }
})

describe("OrganizerTreeView", () => {
  it("renders one expanded hierarchy from the locked root and collapses a branch", async () => {
    const screen = renderTree()

    expect(screen.getByLabelText(/All gear, 1 direct entry · fixed root, level 1/)).toBeDefined()
    expect(screen.getByLabelText(/Studio, 2 direct entries, level 2/)).toBeDefined()
    expect(screen.getByLabelText(/Drawer, 0 direct entries, level 3/)).toBeDefined()
    expect(screen.getByTestId("item-icon-camera", { includeHiddenElements: true })).toBeDefined()

    const collapse = screen.getByLabelText("Collapse Studio")
    expect(collapse.props.accessibilityState.expanded).toBe(true)
    fireEvent.press(collapse)

    await waitFor(() => {
      expect(screen.queryByLabelText(/Drawer/)).toBeNull()
      expect(screen.getByLabelText("Expand Studio").props.accessibilityState.expanded).toBe(false)
    })
  })

  it("exposes an accessible Move alternative to drag and drop", () => {
    const onRequestMove = jest.fn()
    const screen = renderTree({ onRequestMove })
    const item = screen.getByLabelText(/Camera, Item, level 3/)

    fireEvent(item, "accessibilityAction", { nativeEvent: { actionName: "move" } })

    expect(onRequestMove).toHaveBeenCalledWith(
      expect.objectContaining({ id: "camera", kind: "item" }),
    )
  })

  it("uses radio semantics and keeps invalid destinations disabled in selection mode", () => {
    const onSelect = jest.fn()
    const screen = renderTree({
      draggingDisabled: true,
      onSelect,
      selectedId: "studio",
      selectionAllowed: (row) => row.id === "studio",
    })
    const studio = screen.getByLabelText(/Studio, 2 direct entries, level 2/)
    const root = screen.getByLabelText(/All gear, 1 direct entry · fixed root, level 1/)

    expect(studio.props.accessibilityRole).toBe("radio")
    expect(studio.props.accessibilityState).toEqual({ checked: true, disabled: false })
    expect(root.props.accessibilityState.disabled).toBe(true)
    fireEvent.press(studio)
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: "studio", kind: "place" }))
  })

  it("keeps a supplied confirmation control outside the scrollable tree", () => {
    const screen = renderTree({ floatingFooter: <Text text="Move here" /> })

    expect(screen.getByText("Move here")).toBeDefined()
  })
})

function renderTree(props: Partial<React.ComponentProps<typeof OrganizerTreeView>> = {}) {
  return render(
    <ThemeProvider>
      <OrganizerTreeView surface="sheet" tree={tree()} {...props} />
    </ThemeProvider>,
  )
}

function tree(): OrganizerTree {
  const timestamp = "2026-08-02T10:00:00Z"
  return {
    root: { id: "root", name: "All gear", childPlaceCount: 1, itemCount: 0 },
    places: [
      {
        id: "studio",
        parentPlaceId: "root",
        name: "Studio",
        photoUrl: null,
        description: null,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      {
        id: "drawer",
        parentPlaceId: "studio",
        name: "Drawer",
        photoUrl: null,
        description: null,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ],
    items: [
      {
        id: "camera",
        placeId: "studio",
        name: "Camera",
        iconKey: "camera",
        quantity: 1,
      },
    ],
  }
}
