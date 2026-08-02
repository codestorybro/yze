import { ApiErrorResponse } from "apisauce"

import { getApiFailure, getGeneralApiProblem } from "./apiProblem"

test("handles connection errors", () => {
  expect(getGeneralApiProblem({ problem: "CONNECTION_ERROR" } as ApiErrorResponse<null>)).toEqual({
    kind: "cannot-connect",
    temporary: true,
  })
})

test("handles network errors", () => {
  expect(getGeneralApiProblem({ problem: "NETWORK_ERROR" } as ApiErrorResponse<null>)).toEqual({
    kind: "cannot-connect",
    temporary: true,
  })
})

test("handles timeouts", () => {
  expect(getGeneralApiProblem({ problem: "TIMEOUT_ERROR" } as ApiErrorResponse<null>)).toEqual({
    kind: "timeout",
    temporary: true,
  })
})

test("handles server errors", () => {
  expect(getGeneralApiProblem({ problem: "SERVER_ERROR" } as ApiErrorResponse<null>)).toEqual({
    kind: "server",
  })
})

test("handles unknown errors", () => {
  expect(getGeneralApiProblem({ problem: "UNKNOWN_ERROR" } as ApiErrorResponse<null>)).toEqual({
    kind: "unknown",
    temporary: true,
  })
})

test("handles unauthorized errors", () => {
  expect(
    getGeneralApiProblem({ problem: "CLIENT_ERROR", status: 401 } as ApiErrorResponse<null>),
  ).toEqual({
    kind: "unauthorized",
  })
})

test("handles forbidden errors", () => {
  expect(
    getGeneralApiProblem({ problem: "CLIENT_ERROR", status: 403 } as ApiErrorResponse<null>),
  ).toEqual({
    kind: "forbidden",
  })
})

test("handles not-found errors", () => {
  expect(
    getGeneralApiProblem({ problem: "CLIENT_ERROR", status: 404 } as ApiErrorResponse<null>),
  ).toEqual({
    kind: "not-found",
  })
})

test("handles other client errors", () => {
  expect(
    getGeneralApiProblem({ problem: "CLIENT_ERROR", status: 418 } as ApiErrorResponse<null>),
  ).toEqual({
    kind: "rejected",
  })
})

test("handles cancellation errors", () => {
  expect(getGeneralApiProblem({ problem: "CANCEL_ERROR" } as ApiErrorResponse<null>)).toBeNull()
})

test("preserves structured validation errors", () => {
  expect(
    getApiFailure({
      ok: false,
      problem: "CLIENT_ERROR",
      status: 400,
      data: {
        code: "validation_failed",
        detail: "Fix the highlighted fields.",
        errors: { name: ["This field is required."] },
      },
    } as ApiErrorResponse<unknown>),
  ).toEqual({
    kind: "validation",
    code: "validation_failed",
    message: "Fix the highlighted fields.",
    errors: { name: ["This field is required."] },
  })
})

test("preserves machine-readable domain conflicts", () => {
  expect(
    getApiFailure({
      ok: false,
      problem: "CLIENT_ERROR",
      status: 409,
      data: { code: "place_not_empty", detail: "Move its contents first." },
    } as ApiErrorResponse<unknown>),
  ).toEqual({
    kind: "conflict",
    code: "place_not_empty",
    message: "Move its contents first.",
  })
})
