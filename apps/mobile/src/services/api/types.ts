import type { GeneralApiProblem } from "./apiProblem"

export interface HelloResponse {
  message: string
}

export type ApiResult<T> = { kind: "ok"; data: T } | GeneralApiProblem

/**
 * The options used to configure apisauce.
 */
export interface ApiConfig {
  /**
   * The URL of the api.
   */
  url: string

  /**
   * Milliseconds before we timeout the request.
   */
  timeout: number
}
