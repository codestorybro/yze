import type { OrganizerTree } from "@/services/api/types"

import {
  canDropTreeEntity,
  createExpandedTree,
  flattenOrganizerTree,
  moveTreeEntity,
} from "./organizerTree"

describe("organizerTree", () => {
  it("flattens the complete hierarchy from the immutable root", () => {
    const tree = fixture()

    expect(flattenOrganizerTree(tree, createExpandedTree(tree))).toMatchObject([
      { id: "root", kind: "root", depth: 0 },
      { id: "studio", kind: "place", depth: 1 },
      { id: "drawer", kind: "place", depth: 2 },
      { id: "cable", kind: "item", depth: 3 },
      { id: "camera", kind: "item", depth: 1 },
    ])
  })

  it("collapses descendants without removing their data", () => {
    const tree = fixture()
    const rows = flattenOrganizerTree(tree, new Set([tree.root.id]))

    expect(rows.map((row) => row.id)).toEqual(["root", "studio", "camera"])
    expect(tree.places).toHaveLength(2)
  })

  it("rejects root moves, no-op drops, and descendant cycles", () => {
    const tree = fixture()

    expect(canDropTreeEntity(tree, { kind: "root", id: "root" }, "studio")).toBe(false)
    expect(canDropTreeEntity(tree, { kind: "place", id: "studio" }, "root")).toBe(false)
    expect(canDropTreeEntity(tree, { kind: "place", id: "studio" }, "drawer")).toBe(false)
    expect(canDropTreeEntity(tree, { kind: "item", id: "cable" }, "drawer")).toBe(false)
  })

  it("reparents Places and Items without changing their subtree", () => {
    const tree = fixture()
    const movedPlace = moveTreeEntity(tree, { kind: "place", id: "drawer" }, "root")
    const movedItem = moveTreeEntity(tree, { kind: "item", id: "cable" }, "studio")

    expect(movedPlace.places.find((place) => place.id === "drawer")?.parentPlaceId).toBe("root")
    expect(movedItem.items.find((item) => item.id === "cable")?.placeId).toBe("studio")
    expect(movedPlace.places.find((place) => place.id === "studio")?.parentPlaceId).toBe("root")
  })
})

function fixture(): OrganizerTree {
  const timestamp = "2026-08-02T00:00:00Z"
  return {
    root: { id: "root", name: "All gear", childPlaceCount: 1, itemCount: 1 },
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
      item("camera", "Camera", "root"),
      item("cable", "Cable", "drawer"),
    ],
  }
}

function item(id: string, name: string, placeId: string) {
  return {
    id,
    placeId,
    name,
    iconKey: "cable",
    quantity: 1,
  }
}
