import { createContext, useContext, useState, type PropsWithChildren } from "react"

import { UserType } from "@/types/userType"
import { GroupType } from "@/types/groupType"

type GroupContextType = {
  groupDetails: GroupType | null
  setGroupDetails: (group: GroupType | null) => void
  searchUserTerm: string
  setSearchUserTerm: (term: string) => void
  isSearchBarFocused: boolean
  setIsSearchBarFocused: (value: boolean) => void
  membersList: UserType[] | null
  setMembersList: (users: UserType[] | null) => void
}

const GroupContext = createContext<GroupContextType | null>(null)

export function GroupStoreProvider({ children }: PropsWithChildren) {
  const [groupDetails, setGroupDetails] = useState<GroupType | null>(null)
  const [membersList, setMembersList] = useState<UserType[] | null>(null)
  const [searchUserTerm, setSearchUserTerm] = useState<string>("")
  const [isSearchBarFocused, setIsSearchBarFocused] = useState<boolean>(false)

  return (
    <GroupContext.Provider
      value={{
        groupDetails,
        setGroupDetails,
        searchUserTerm,
        setSearchUserTerm,
        isSearchBarFocused,
        setIsSearchBarFocused,
        membersList,
        setMembersList,
      }}
    >
      {children}
    </GroupContext.Provider>
  )
}

export function useGroup() {
  const ctx = useContext(GroupContext)
  if (!ctx) throw new Error("useGroup must be used within <GroupProvider />")

  return {
    groupDetails: ctx.groupDetails,
    setGroupDetails: ctx.setGroupDetails,
    membersList: ctx.membersList,
    setMembersList: ctx.setMembersList,
    searchUserTerm: ctx.searchUserTerm,
    setSearchUserTerm: ctx.setSearchUserTerm,
    isSearchBarFocused: ctx.isSearchBarFocused,
    setIsSearchBarFocused: ctx.setIsSearchBarFocused,
  }
}
