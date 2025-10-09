import { ApiResponse, authClient, registerRefreshHandler } from "./httpClient"

import type { UserType } from "@/types/userType"
import type { TokenPair } from "./tokenManager"

type LoginPayload = {
  email: string
  password: string
}

type RefreshPayload = {
  refreshToken: string
}

type LoginData = {
  user: UserType
  tokens: TokenPair
}

type RefreshData = {
  tokens: TokenPair
}

export async function login(payload: LoginPayload): Promise<LoginData> {
  const response = await authClient.post<ApiResponse<LoginData>>("/auth/login", payload)
  return response.data.data
}

export async function refreshSession(payload: RefreshPayload): Promise<RefreshData> {
  const response = await authClient.post<ApiResponse<RefreshData>>("/auth/refresh", payload)
  return response.data.data
}

export async function logout(): Promise<void> {
  await authClient.post("/auth/logout")
}

registerRefreshHandler(async (refreshToken: string) => {
  const { tokens } = await refreshSession({ refreshToken })
  return tokens
})
