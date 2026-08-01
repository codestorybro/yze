import { initI18n } from "./index"

type I18nInitializer = typeof initI18n
type ErrorReporter = (message: string, error: unknown) => void

export async function initializeI18nSafely(
  initialize: I18nInitializer = initI18n,
  reportError: ErrorReporter = console.error,
): Promise<void> {
  try {
    await initialize()
  } catch (error) {
    // Translated text falls back to its key when i18n is unavailable, so launch can continue.
    reportError("Unable to initialize translations; continuing with fallback text.", error)
  }
}
