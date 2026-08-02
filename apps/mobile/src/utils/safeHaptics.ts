import * as Haptics from "expo-haptics"

/**
 * Haptics are an enhancement, never part of the success path.
 *
 * A development build can temporarily run newer JavaScript against an older native binary. In
 * that situation Expo rejects the call because the native method is missing. Mutations and
 * navigation must still complete, so this boundary deliberately absorbs native availability
 * failures.
 */
export async function notifySuccess(): Promise<void> {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
  } catch {
    // Best-effort feedback: the visible toast remains the authoritative confirmation.
  }
}
