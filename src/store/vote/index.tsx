import { createContext, useContext, useState, type PropsWithChildren } from "react"

import { UserType } from "@/types/userType"

type AppContextType = {
  selectedUsers: UserType[] | null
  voteForUser: (user: UserType) => void
}

const AppContext = createContext<AppContextType | null>(null)

export function AppStoreProvider({ children }: PropsWithChildren) {
  const [selectedUsers, setSelectedUsers] = useState<UserType[] | null>(null)

  const voteForUser = (user: UserType) => {
    if (!selectedUsers) {
      setSelectedUsers([user])
      return
    }

    const exists = selectedUsers.some((u) => u.id === user.id)

    if (exists) {
      setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id))
    } else {
      setSelectedUsers([...selectedUsers, user])
    }
  }

  return (
    <AppContext.Provider
      value={{
        selectedUsers,
        voteForUser,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useVote() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useVote must be used within <AppProvider />")

  return {
    selectedUsers: ctx.selectedUsers,
    voteForUser: ctx.voteForUser,
  }
}
