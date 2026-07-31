/**
 * This Api class lets you define an API endpoint and methods to request
 * data and process it.
 *
 * See the [Backend API Integration](https://docs.infinite.red/ignite-cli/boilerplate/app/services/#backend-api-integration)
 * documentation for more details.
 */
import { ApisauceInstance, create } from "apisauce"

import { getApiBaseUrl } from "@/config/api"

import { getGeneralApiProblem } from "./apiProblem"
import type { ApiConfig, ApiResult, HelloResponse } from "./types"

/**
 * Configuring the apisauce instance.
 */
export const getDefaultApiConfig = (): ApiConfig => ({ url: getApiBaseUrl(), timeout: 10000 })

/**
 * Manages all requests to the API. You can use this class to build out
 * various requests that you need to call from your backend API.
 */
export class Api {
  apisauce: ApisauceInstance
  config: ApiConfig

  /**
   * Set up our API instance. Keep this lightweight!
   */
  constructor(config: ApiConfig = getDefaultApiConfig()) {
    this.config = config
    this.apisauce = create({
      baseURL: this.config.url,
      timeout: this.config.timeout,
      headers: {
        Accept: "application/json",
      },
    })
  }

  async getHello(): Promise<ApiResult<HelloResponse>> {
    const response = await this.apisauce.get<HelloResponse>("/api/hello")

    if (!response.ok) {
      return getGeneralApiProblem(response) ?? { kind: "unknown", temporary: true }
    }

    if (!response.data || typeof response.data.message !== "string") {
      return { kind: "bad-data" }
    }

    return { kind: "ok", data: response.data }
  }
}

export const getHello = () => new Api().getHello()
