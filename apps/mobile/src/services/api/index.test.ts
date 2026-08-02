import type { ApiResponse } from "apisauce"

import type { HelloResponse, Item, PlaceSummary } from "./types"

import { Api } from "."

describe("Api.getHello", () => {
  const api = new Api({ url: "https://example.test", timeout: 1000 })

  afterEach(() => jest.restoreAllMocks())

  it("returns a typed success for a valid hello response", async () => {
    const get = jest.spyOn(api.apisauce, "get").mockResolvedValue({
      ok: true,
      data: { message: "Hello from Gear Organizer" },
    } as ApiResponse<HelloResponse>)

    await expect(api.getHello()).resolves.toEqual({
      kind: "ok",
      data: { message: "Hello from Gear Organizer" },
    })
    expect(get).toHaveBeenCalledWith("/api/hello")
  })

  it("rejects a response without a string message", async () => {
    jest.spyOn(api.apisauce, "get").mockResolvedValue({
      ok: true,
      data: {},
    } as ApiResponse<HelloResponse>)

    await expect(api.getHello()).resolves.toEqual({ kind: "bad-data" })
  })
})

describe("Api organizer endpoints", () => {
  const api = new Api({ url: "https://example.test", timeout: 1000 })

  afterEach(() => jest.restoreAllMocks())

  it("lists validated root Places", async () => {
    const place = placeSummary()
    const get = jest
      .spyOn(api.apisauce, "get")
      .mockResolvedValue({ ok: true, data: [place] } as ApiResponse<PlaceSummary[]>)

    await expect(api.getRootPlaces()).resolves.toEqual({ kind: "ok", data: [place] })
    expect(get).toHaveBeenCalledWith("/api/places")
  })

  it("rejects malformed Place data", async () => {
    jest
      .spyOn(api.apisauce, "get")
      .mockResolvedValue({ ok: true, data: [{ id: "only-id" }] } as ApiResponse<unknown>)

    await expect(api.getRootPlaces()).resolves.toEqual({ kind: "bad-data" })
  })

  it("creates an Item inside the selected Place", async () => {
    const item = itemResponse()
    const post = jest
      .spyOn(api.apisauce, "post")
      .mockResolvedValue({ ok: true, data: item } as ApiResponse<Item>)

    await expect(api.createItem("place-1", { name: "Cable", iconKey: "cable" })).resolves.toEqual({
      kind: "ok",
      data: item,
    })
    expect(post).toHaveBeenCalledWith("/api/places/place-1/items", {
      name: "Cable",
      iconKey: "cable",
    })
  })
})

function placeSummary(): PlaceSummary {
  return {
    id: "place-1",
    name: "Desk",
    photoUrl: null,
    description: null,
    childPlaceCount: 1,
    itemCount: 2,
    createdAt: "2026-08-01T10:00:00Z",
    updatedAt: "2026-08-01T10:00:00Z",
  }
}

function itemResponse(): Item {
  return {
    id: "item-1",
    placeId: "place-1",
    name: "Cable",
    iconKey: "cable",
    photoUrl: null,
    brand: null,
    model: null,
    serialNumber: null,
    category: null,
    productionDate: null,
    purchaseDate: null,
    purchasePrice: null,
    purchaseCurrency: null,
    warrantyUntil: null,
    productUrl: null,
    quantity: 1,
    tags: [],
    notes: null,
    createdAt: "2026-08-01T10:00:00Z",
    updatedAt: "2026-08-01T10:00:00Z",
  }
}
