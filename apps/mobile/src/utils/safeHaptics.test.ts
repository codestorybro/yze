import * as Haptics from "expo-haptics"

import { notifySuccess } from "./safeHaptics"

jest.mock("expo-haptics", () => ({
  NotificationFeedbackType: { Success: "success" },
  notificationAsync: jest.fn(),
}))

const notificationAsync = Haptics.notificationAsync as jest.MockedFunction<
  typeof Haptics.notificationAsync
>

describe("notifySuccess", () => {
  beforeEach(() => jest.clearAllMocks())

  it("never rejects when the native method is unavailable", async () => {
    notificationAsync.mockRejectedValueOnce(new Error("Native method unavailable"))

    await expect(notifySuccess()).resolves.toBeUndefined()
  })
})
