import { emptyItemDraft, itemRequestFromDraft, validateItemDraft } from "./itemForm"

describe("Item form", () => {
  it("requires only a name, catalogue icon, and destination", () => {
    expect(validateItemDraft(emptyItemDraft)).toMatchObject({
      name: expect.any(String),
      iconKey: expect.any(String),
      placeId: expect.any(String),
    })
  })

  it("normalizes progressive details into the API request", () => {
    const draft = {
      ...emptyItemDraft,
      name: "  HDMI adapter  ",
      iconKey: "adapter",
      purchasePrice: "129,90",
      purchaseCurrency: "pln",
      quantity: "2",
      tags: "travel, USB-C, travel",
    }

    expect(validateItemDraft(draft, "place-1")).toEqual({})
    expect(itemRequestFromDraft(draft)).toMatchObject({
      name: "HDMI adapter",
      iconKey: "adapter",
      purchasePrice: 129.9,
      purchaseCurrency: "PLN",
      quantity: 2,
      tags: ["travel", "USB-C", "travel"],
    })
  })

  it("rejects local or clear-text photo paths and invalid dates", () => {
    const localErrors = validateItemDraft(
      {
        ...emptyItemDraft,
        name: "Camera",
        iconKey: "camera",
        photoUrl: "file:///private/camera.jpg",
        purchaseDate: "2026-02-31",
      },
      "place-1",
    )

    const clearTextErrors = validateItemDraft(
      {
        ...emptyItemDraft,
        name: "Camera",
        iconKey: "camera",
        photoUrl: "http://example.test/camera.jpg",
      },
      "place-1",
    )

    expect(localErrors.photoUrl).toBeDefined()
    expect(localErrors.purchaseDate).toBeDefined()
    expect(clearTextErrors.photoUrl).toBeDefined()
  })
})
