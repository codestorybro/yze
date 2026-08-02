import { Platform } from "react-native"
import * as Haptics from "expo-haptics"

import { notifySuccess } from "./safeHaptics"

jest.mock("expo-haptics", () => ({
  AndroidHaptics: { Confirm: "confirm" },
  ImpactFeedbackStyle: { Medium: "medium" },
  impactAsync: jest.fn(),
  performAndroidHapticsAsync: jest.fn(),
}))

const impactAsync = Haptics.impactAsync as jest.MockedFunction<typeof Haptics.impactAsync>
const performAndroidHapticsAsync = Haptics.performAndroidHapticsAsync as jest.MockedFunction<
  typeof Haptics.performAndroidHapticsAsync
>

describe("notifySuccess", () => {
  beforeEach(() => jest.clearAllMocks())
  afterEach(() => jest.restoreAllMocks())

  it("attempts one confirmation pulse and never rejects when the native method is unavailable", async () => {
    jest.replaceProperty(Platform, "OS", "ios")
    impactAsync.mockRejectedValueOnce(new Error("Native method unavailable"))

    await expect(notifySuccess()).resolves.toBeUndefined()
    expect(impactAsync).toHaveBeenCalledTimes(1)
    expect(impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Medium)
    expect(performAndroidHapticsAsync).not.toHaveBeenCalled()
  })

  it("requests one native confirmation effect on Android", async () => {
    jest.replaceProperty(Platform, "OS", "android")

    await expect(notifySuccess()).resolves.toBeUndefined()
    expect(performAndroidHapticsAsync).toHaveBeenCalledTimes(1)
    expect(performAndroidHapticsAsync).toHaveBeenCalledWith(Haptics.AndroidHaptics.Confirm)
    expect(impactAsync).not.toHaveBeenCalled()
  })
})
