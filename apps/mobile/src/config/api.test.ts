import { API_CONFIGURATION_ERROR, getApiBaseUrl } from "./api"

describe("getApiBaseUrl", () => {
  it("trims whitespace and trailing slashes", () => {
    expect(getApiBaseUrl("  http://localhost:8080///  ")).toBe("http://localhost:8080")
  })

  it("does not silently fall back when configuration is absent", () => {
    expect(() => getApiBaseUrl("")).toThrow(API_CONFIGURATION_ERROR)
  })

  it("rejects an incomplete HTTP URL", () => {
    expect(() => getApiBaseUrl("http://")).toThrow(API_CONFIGURATION_ERROR)
  })
})
