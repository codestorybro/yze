import { ApiResponse } from "apisauce"

export type GeneralApiProblem =
  /**
   * Times up.
   */
  | { kind: "timeout"; temporary: true }
  /**
   * Cannot connect to the server for some reason.
   */
  | { kind: "cannot-connect"; temporary: true }
  /**
   * The server experienced a problem. Any 5xx error.
   */
  | { kind: "server" }
  /**
   * We're not allowed because we haven't identified ourself. This is 401.
   */
  | { kind: "unauthorized" }
  /**
   * We don't have access to perform that request. This is 403.
   */
  | { kind: "forbidden" }
  /**
   * Unable to find that resource.  This is a 404.
   */
  | { kind: "not-found" }
  /**
   * All other 4xx series errors.
   */
  | { kind: "rejected" }
  /**
   * Something truly unexpected happened. Most likely can try again. This is a catch all.
   */
  | { kind: "unknown"; temporary: true }
  /**
   * The data we received is not in the expected format.
   */
  | { kind: "bad-data" }

export type ApiFailure =
  | GeneralApiProblem
  | {
      kind: "validation"
      code: string
      message: string
      errors: Record<string, string[]>
    }
  | {
      kind: "conflict"
      code: string
      message: string
    }
  | {
      kind: "domain"
      code: string
      message: string
      status: number
    }

interface ProblemPayload {
  code?: unknown
  detail?: unknown
  errors?: unknown
  title?: unknown
}

export function getApiFailure(response: ApiResponse<unknown>): ApiFailure {
  const payload = isRecord(response.data) ? (response.data as ProblemPayload) : undefined
  const code = typeof payload?.code === "string" ? payload.code : undefined
  const message =
    typeof payload?.detail === "string"
      ? payload.detail
      : typeof payload?.title === "string"
        ? payload.title
        : "The request could not be completed."

  if (response.status === 400 && payload && isFieldErrors(payload.errors)) {
    return {
      kind: "validation",
      code: code ?? "validation_failed",
      message,
      errors: payload.errors,
    }
  }

  if (response.status === 409 && code) {
    return { kind: "conflict", code, message }
  }

  if (response.status && code) {
    return { kind: "domain", code, message, status: response.status }
  }

  return getGeneralApiProblem(response) ?? { kind: "unknown", temporary: true }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isFieldErrors(value: unknown): value is Record<string, string[]> {
  return (
    isRecord(value) &&
    Object.values(value).every(
      (messages) =>
        Array.isArray(messages) && messages.every((message) => typeof message === "string"),
    )
  )
}

/**
 * Attempts to get a common cause of problems from an api response.
 *
 * @param response The api response.
 */
export function getGeneralApiProblem(response: ApiResponse<any>): GeneralApiProblem | null {
  switch (response.problem) {
    case "CONNECTION_ERROR":
      return { kind: "cannot-connect", temporary: true }
    case "NETWORK_ERROR":
      return { kind: "cannot-connect", temporary: true }
    case "TIMEOUT_ERROR":
      return { kind: "timeout", temporary: true }
    case "SERVER_ERROR":
      return { kind: "server" }
    case "UNKNOWN_ERROR":
      return { kind: "unknown", temporary: true }
    case "CLIENT_ERROR":
      switch (response.status) {
        case 401:
          return { kind: "unauthorized" }
        case 403:
          return { kind: "forbidden" }
        case 404:
          return { kind: "not-found" }
        default:
          return { kind: "rejected" }
      }
    case "CANCEL_ERROR":
      return null
  }

  return null
}
