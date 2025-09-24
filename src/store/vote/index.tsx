import { createContext, useContext, useState, type PropsWithChildren } from "react"

import { QuestionType } from "@/types/questionType"
import { UserType } from "@/types/userType"

type AppContextType = {
  selectedUsers: UserType[] | null
  voteForUser: (user: UserType) => void
  question: QuestionType | null
  setQuestion: (question: QuestionType | null) => void
  searchTerm: string
  setSearchTerm: (term: string) => void
  isVoted: boolean
  setIsVoted: (voted: boolean) => void
}

const AppContext = createContext<AppContextType | null>(null)

export function AppStoreProvider({ children }: PropsWithChildren) {
  const [selectedUsers, setSelectedUsers] = useState<UserType[] | null>(null)
  const [question, setQuestion] = useState<QuestionType | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isVoted, setIsVoted] = useState(false)

  const voteForUser = (user: UserType) => {
    const list = selectedUsers ?? []
    const exists = list.some((u) => u.id === user.id)

    if (exists) {
      setSelectedUsers(list.filter((u) => u.id !== user.id))
      return
    }

    setSelectedUsers([...list, user])
  }

  return (
    <AppContext.Provider
      value={{
        selectedUsers,
        voteForUser,
        question,
        setQuestion,
        searchTerm,
        setSearchTerm,
        isVoted,
        setIsVoted,
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
    isVoted: ctx.isVoted,
    setIsVoted: ctx.setIsVoted,
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
