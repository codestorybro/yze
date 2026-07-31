export const API_CONFIGURATION_ERROR =
  "EXPO_PUBLIC_API_URL is missing or invalid. Use a project development command or set an http(s) URL for the current terminal session."

export function getApiBaseUrl(value = process.env.EXPO_PUBLIC_API_URL): string {
  try {
    const url = new URL(value?.trim() ?? "")

    if (!url.hostname || (url.protocol !== "http:" && url.protocol !== "https:")) {
      throw new Error(API_CONFIGURATION_ERROR)
    }

    return url.toString().replace(/\/+$/, "")
  } catch {
    throw new Error(API_CONFIGURATION_ERROR)
  }
}
