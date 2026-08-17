import type { OrganizerItemNode, OrganizerPlaceNode, OrganizerTree } from "@/services/api/types"

export type OrganizerTreeEntityKind = "root" | "place" | "item"

export interface OrganizerTreeEntity {
  id: string
  kind: OrganizerTreeEntityKind
}

export interface OrganizerTreeRow extends OrganizerTreeEntity {
  childCount: number
  connections: boolean[]
  depth: number
  expandable: boolean
  expanded: boolean
  iconKey?: string
  name: string
  parentId: string | null
  quantity?: number
}

export function createExpandedTree(tree: OrganizerTree): Set<string> {
  return new Set([tree.root.id, ...tree.places.map((place) => place.id)])
}

export function flattenOrganizerTree(
  tree: OrganizerTree,
  expandedIds: ReadonlySet<string>,
): OrganizerTreeRow[] {
  const placesByParent = groupPlacesByParent(tree.places)
  const itemsByPlace = groupItemsByPlace(tree.items)
  const rootChildCount =
    (placesByParent.get(tree.root.id)?.length ?? 0) + (itemsByPlace.get(tree.root.id)?.length ?? 0)
  const rows: OrganizerTreeRow[] = [
    {
      id: tree.root.id,
      kind: "root",
      name: tree.root.name,
      parentId: null,
      depth: 0,
      connections: [],
      childCount: rootChildCount,
      expandable: rootChildCount > 0,
      expanded: true,
    },
  ]
  const visited = new Set<string>()

  appendChildren(tree.root.id, 1, [], rows, visited, expandedIds, placesByParent, itemsByPlace)
  return rows
}

export function canDropTreeEntity(
  tree: OrganizerTree,
  entity: OrganizerTreeEntity,
  destinationId: string,
): boolean {
  if (entity.kind === "root") return false
  if (destinationId !== tree.root.id && !tree.places.some((place) => place.id === destinationId)) {
    return false
  }

  if (entity.kind === "item") {
    return tree.items.some((item) => item.id === entity.id && item.placeId !== destinationId)
  }

  const place = tree.places.find((entry) => entry.id === entity.id)
  if (!place || place.parentPlaceId === destinationId || place.id === destinationId) return false

  let ancestorId: string | undefined = destinationId
  const byId = new Map(tree.places.map((entry) => [entry.id, entry]))
  const visited = new Set<string>()
  while (ancestorId && ancestorId !== tree.root.id && !visited.has(ancestorId)) {
    if (ancestorId === place.id) return false
    visited.add(ancestorId)
    ancestorId = byId.get(ancestorId)?.parentPlaceId
  }
  return true
}

export function moveTreeEntity(
  tree: OrganizerTree,
  entity: OrganizerTreeEntity,
  destinationId: string,
): OrganizerTree {
  if (!canDropTreeEntity(tree, entity, destinationId)) return tree

  if (entity.kind === "place") {
    return {
      ...tree,
      places: tree.places.map((place) =>
        place.id === entity.id ? { ...place, parentPlaceId: destinationId } : place,
      ),
    }
  }

  return {
    ...tree,
    items: tree.items.map((item) =>
      item.id === entity.id ? { ...item, placeId: destinationId } : item,
    ),
  }
}

export function parentIdForTreeEntity(
  tree: OrganizerTree,
  entity: OrganizerTreeEntity,
): string | null {
  if (entity.kind === "root") return null
  if (entity.kind === "place") {
    return tree.places.find((place) => place.id === entity.id)?.parentPlaceId ?? null
  }
  return tree.items.find((item) => item.id === entity.id)?.placeId ?? null
}

function appendChildren(
  parentId: string,
  depth: number,
  ancestorConnections: boolean[],
  rows: OrganizerTreeRow[],
  visited: Set<string>,
  expandedIds: ReadonlySet<string>,
  placesByParent: Map<string, OrganizerPlaceNode[]>,
  itemsByPlace: Map<string, OrganizerItemNode[]>,
) {
  if (!expandedIds.has(parentId)) return

  const childPlaces = placesByParent.get(parentId) ?? []
  const childItems = itemsByPlace.get(parentId) ?? []
  const children: Array<
    { kind: "item"; item: OrganizerItemNode } | { kind: "place"; place: OrganizerPlaceNode }
  > = [
    ...childPlaces.map((place) => ({ kind: "place" as const, place })),
    ...childItems.map((item) => ({ kind: "item" as const, item })),
  ]

  children.forEach((child, index) => {
    const hasNextSibling = index < children.length - 1
    const connections = [...ancestorConnections, hasNextSibling]
    if (child.kind === "item") {
      rows.push({
        id: child.item.id,
        kind: "item",
        name: child.item.name,
        parentId,
        depth,
        connections,
        childCount: 0,
        expandable: false,
        expanded: false,
        iconKey: child.item.iconKey,
        quantity: child.item.quantity,
      })
      return
    }

    if (visited.has(child.place.id)) return
    visited.add(child.place.id)
    const childCount =
      (placesByParent.get(child.place.id)?.length ?? 0) +
      (itemsByPlace.get(child.place.id)?.length ?? 0)
    const expanded = expandedIds.has(child.place.id)
    rows.push({
      id: child.place.id,
      kind: "place",
      name: child.place.name,
      parentId,
      depth,
      connections,
      childCount,
      expandable: childCount > 0,
      expanded,
    })
    appendChildren(
      child.place.id,
      depth + 1,
      connections,
      rows,
      visited,
      expandedIds,
      placesByParent,
      itemsByPlace,
    )
  })
}

function groupPlacesByParent(places: OrganizerPlaceNode[]) {
  const groups = new Map<string, OrganizerPlaceNode[]>()
  for (const place of places) {
    const entries = groups.get(place.parentPlaceId) ?? []
    entries.push(place)
    groups.set(place.parentPlaceId, entries)
  }
  for (const entries of groups.values()) entries.sort(compareByName)
  return groups
}

function groupItemsByPlace(items: OrganizerItemNode[]) {
  const groups = new Map<string, OrganizerItemNode[]>()
  for (const item of items) {
    const entries = groups.get(item.placeId) ?? []
    entries.push(item)
    groups.set(item.placeId, entries)
  }
  for (const entries of groups.values()) entries.sort(compareByName)
  return groups
}

function compareByName(left: { name: string }, right: { name: string }) {
  return left.name.localeCompare(right.name, undefined, { sensitivity: "base" })
}
