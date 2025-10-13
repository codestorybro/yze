import { apiClient, ApiResponse } from "./httpClient"

import type { UserType } from "@/types/userType"

export type GetGroupMembersPayload = {
  groupId?: string | null
}

export async function getGroupMembers({ groupId }: GetGroupMembersPayload = {}): Promise<
  UserType[]
> {
  const response = await apiClient.get<ApiResponse<UserType[]>>("/groups/members", {
    params: groupId ? { groupId } : undefined,
  })

  return response.data.data
}
