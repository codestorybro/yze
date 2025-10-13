import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"

import { UserType } from "@/types/userType"
import { GroupType } from "@/types/groupType"
import { useUser } from "@/store/auth"
import { getGroupMembers } from "@/api/group"

type GroupContextType = {
  groupDetails: GroupType | null
  setGroupDetails: (group: GroupType | null) => void
  searchUserTerm: string
  setSearchUserTerm: (term: string) => void
  isSearchBarFocused: boolean
  setIsSearchBarFocused: (value: boolean) => void
  membersList: UserType[] | null
  setMembersList: (users: UserType[] | null) => void
  isMembersLoading: boolean
  isMembersInitialLoading: boolean
  isMembersRefetching: boolean
  hasLoadedMembers: boolean
  membersError: string | null
  refreshMembersList: () => Promise<void>
}

const GroupContext = createContext<GroupContextType | null>(null)

export function GroupStoreProvider({ children }: PropsWithChildren) {
  const { user } = useUser()
  const queryClient = useQueryClient()
  const [groupDetails, setGroupDetails] = useState<GroupType | null>(null)
  const [searchUserTerm, setSearchUserTerm] = useState<string>("")
  const [isSearchBarFocused, setIsSearchBarFocused] = useState<boolean>(false)
  const groupId = groupDetails?.id ?? "default"

  const queryKey = useMemo(() => ["groupMembers", groupId], [groupId])

  const fetchGroupMembers = useCallback(async () => {
    if (!user) return []
    return getGroupMembers({ groupId: groupDetails?.id ?? null })
  }, [groupDetails?.id, user])

  const {
    data: membersData,
    isLoading: isMembersInitialLoading,
    isRefetching: isMembersRefetching,
    isFetched,
    error: membersQueryError,
  } = useQuery<UserType[]>({
    queryKey,
    queryFn: fetchGroupMembers,
    enabled: !!user,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnReconnect: "always",
    refetchOnWindowFocus: "always",
  })

  useEffect(() => {
    if (!user) {
      queryClient.removeQueries({ queryKey: ["groupMembers"], exact: false })
    }
  }, [queryClient, user])

  const membersList = useMemo(() => {
    if (!membersData) return null
    return membersData
  }, [membersData])

  const setMembersList = useCallback(
    (users: UserType[] | null) => {
      if (!users) {
        queryClient.removeQueries({ queryKey, exact: true })
        return
      }

      queryClient.setQueryData(queryKey, users)
    },
    [queryClient, queryKey],
  )

  const hasLoadedMembers = isFetched && membersData !== undefined
  const membersError = membersQueryError ? "Failed to fetch group members." : null
  const isMembersLoading = isMembersInitialLoading || isMembersRefetching

  const refreshMembersList = useCallback(async () => {
    if (!user) {
      queryClient.removeQueries({ queryKey: ["groupMembers"], exact: false })
      return
    }

    try {
      await queryClient.fetchQuery({ queryKey, queryFn: fetchGroupMembers, staleTime: 0 })
    } catch (error) {
      console.error("Failed to refresh group members", error)
    }
  }, [fetchGroupMembers, queryClient, queryKey, user])

  const contextValue = useMemo(
    () => ({
      groupDetails,
      setGroupDetails,
      searchUserTerm,
      setSearchUserTerm,
      isSearchBarFocused,
      setIsSearchBarFocused,
      membersList,
      setMembersList,
      isMembersLoading,
      isMembersInitialLoading,
      isMembersRefetching,
      hasLoadedMembers,
      membersError,
      refreshMembersList,
    }),
    [
      groupDetails,
      hasLoadedMembers,
      isMembersInitialLoading,
      isMembersLoading,
      isMembersRefetching,
      isSearchBarFocused,
      membersError,
      membersList,
      refreshMembersList,
      searchUserTerm,
    ],
  )

  return <GroupContext.Provider value={contextValue}>{children}</GroupContext.Provider>
}

export function useGroup() {
  const ctx = useContext(GroupContext)
  if (!ctx) throw new Error("useGroup must be used within <GroupProvider />")

  return {
    groupDetails: ctx.groupDetails,
    setGroupDetails: ctx.setGroupDetails,
    membersList: ctx.membersList,
    setMembersList: ctx.setMembersList,
    isMembersLoading: ctx.isMembersLoading,
    isMembersInitialLoading: ctx.isMembersInitialLoading,
    isMembersRefetching: ctx.isMembersRefetching,
    hasLoadedMembers: ctx.hasLoadedMembers,
    membersError: ctx.membersError,
    refreshMembersList: ctx.refreshMembersList,
    searchUserTerm: ctx.searchUserTerm,
    setSearchUserTerm: ctx.setSearchUserTerm,
    isSearchBarFocused: ctx.isSearchBarFocused,
    setIsSearchBarFocused: ctx.setIsSearchBarFocused,
  }
}
