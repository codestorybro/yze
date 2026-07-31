import type { ApiResponse } from "apisauce"

import type { HelloResponse } from "./types"

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
