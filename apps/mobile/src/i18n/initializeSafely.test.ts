import { initializeI18nSafely } from "./initializeSafely"

describe("initializeI18nSafely", () => {
  it("completes initialization when i18n succeeds", async () => {
    const initialize = jest.fn().mockResolvedValue(undefined)
    const reportError = jest.fn()

    await expect(initializeI18nSafely(initialize, reportError)).resolves.toBeUndefined()

    expect(initialize).toHaveBeenCalledTimes(1)
    expect(reportError).not.toHaveBeenCalled()
  })

  it("allows launch to continue when i18n fails", async () => {
    const error = new Error("i18n unavailable")
    const initialize = jest.fn().mockRejectedValue(error)
    const reportError = jest.fn()

    await expect(initializeI18nSafely(initialize, reportError)).resolves.toBeUndefined()

    expect(reportError).toHaveBeenCalledWith(
      "Unable to initialize translations; continuing with fallback text.",
      error,
    )
  })
})
