import axios from "axios"

import type { TokenPair } from "./tokenManager"
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "./tokenManager"
import { mockAdapter } from "./mockServer"
import Reactotron from "reactotron-react-native"

declare module "axios" {
  interface AxiosRequestConfig {
    _retry?: boolean
  }
}

export type ApiResponse<T> = {
  data: T
}

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "https://api.yze.app"

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
})

export const authClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
})

apiClient.defaults.adapter = mockAdapter
authClient.defaults.adapter = mockAdapter

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }

  Reactotron.log("📡 Request:", config.url, config)

  return config
})

let isRefreshing = false
let refreshHandler: ((refreshToken: string) => Promise<TokenPair>) | null = null
const pendingQueue: Array<{
  resolve: (token: string) => void
  reject: (error: unknown) => void
}> = []

export function registerRefreshHandler(handler: (refreshToken: string) => Promise<TokenPair>) {
  refreshHandler = handler
}

function processQueue(error: unknown, token: string | null) {
  while (pendingQueue.length > 0) {
    const { resolve, reject } = pendingQueue.shift()!
    if (token && !error) {
      resolve(token)
    } else {
      reject(error)
    }
  }
}

apiClient.interceptors.response.use(
  (response) => {
    Reactotron.log("📥 Response:", response.config.url, response)

    return response
  },
  async (error) => {
    Reactotron.log("🚨 Error response:", error.config.url, error.response)
    const originalRequest = error.config
    const status = error.response?.status

    if (status !== 401 || originalRequest?._retry) {
      return Promise.reject(error)
    }

    const refreshToken = getRefreshToken()
    if (!refreshToken) {
      clearTokens()
      return Promise.reject(error)
    }

    originalRequest._retry = true

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({
          resolve: (token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            resolve(apiClient(originalRequest))
          },
          reject,
        })
      })
    }

    isRefreshing = true

    try {
      if (!refreshHandler) {
        throw new Error("Refresh handler not registered")
      }

      const nextTokens = await refreshHandler(refreshToken)
      setTokens(nextTokens)
      processQueue(null, nextTokens.accessToken)
      originalRequest.headers.Authorization = `Bearer ${nextTokens.accessToken}`
      return apiClient(originalRequest)
    } catch (refreshError) {
      clearTokens()
      processQueue(refreshError, null)
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)
