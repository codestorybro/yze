import { createContext, useContext, useState, type PropsWithChildren } from "react"

import { QuestionType } from "@/types/questionType"
import { UserType } from "@/types/userType"

type AppContextType = {
  selectedUsers: UserType[] | null
  resetUsers: () => void
  voteForUser: (user: UserType) => void
  question: QuestionType | null
  setQuestion: (question: QuestionType | null) => void
  searchTerm: string
  setSearchTerm: (term: string) => void
}

const AppContext = createContext<AppContextType | null>(null)

export function AppStoreProvider({ children }: PropsWithChildren) {
  const [selectedUsers, setSelectedUsers] = useState<UserType[] | null>(null)
  const [question, setQuestion] = useState<QuestionType | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const resetUsers = () => {
    setSelectedUsers(null)
  }

  const voteForUser = (user: UserType) => {
    const list = selectedUsers ?? []
    const exists = list.some((u) => u.id === user.id)

    if (exists) {
      setSelectedUsers(list.filter((u) => u.id !== user.id))
      return
    }

    if (question && list.length >= question.howMuchPick) {
      throw new Error("You have already selected the maximum number of users")
    }

    setSelectedUsers([...list, user])
  }

  return (
    <AppContext.Provider
      value={{
        selectedUsers,
        resetUsers,
        voteForUser,
        question,
        setQuestion,
        searchTerm,
        setSearchTerm,
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
    resetUsers: ctx.resetUsers,
    voteForUser: ctx.voteForUser,
  }
}

export function useQuestion() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useQuestion must be used within <AppProvider />")

  return {
    question: ctx.question,
    setQuestion: ctx.setQuestion,
  }
}

export function useSearch() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useSearch must be used within <AppProvider />")

  return {
    searchTerm: ctx.searchTerm,
    setSearchTerm: ctx.setSearchTerm,
  }
}
