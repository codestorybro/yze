import type { ApiFailure, GeneralApiProblem } from "./apiProblem"

const generalMessages: Record<GeneralApiProblem["kind"], string> = {
  "bad-data": "The API returned data Yze could not read.",
  "cannot-connect": "Yze could not reach the API. Check that the backend is running.",
  "forbidden": "This action is not allowed.",
  "not-found": "This content no longer exists.",
  "rejected": "The API rejected this request.",
  "server": "The API could not complete the request.",
  "timeout": "The request took too long. Try again.",
  "unauthorized": "This action requires authorization.",
  "unknown": "Something unexpected happened. Try again.",
}

export function apiFailureMessage(failure: ApiFailure) {
  if (failure.kind === "validation" || failure.kind === "conflict" || failure.kind === "domain") {
    return failure.message
  }

  return generalMessages[failure.kind]
}
