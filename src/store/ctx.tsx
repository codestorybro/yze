import { use, createContext, type PropsWithChildren } from "react"

import { useStorageState } from "./useStorageState"

type UserType = {
  id: string
  email: string
  name: string
}

type AuthContextType = {
  signIn: () => void
  signOut: () => void
  user: UserType | null
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useSession() {
  const value = use(AuthContext)
  if (!value) {
    throw new Error("useSession must be wrapped in a <SessionProvider />")
  }
  return value
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [[isLoading, storedUser], setStoredUser] = useStorageState("user")

  const parseUser = (raw: string | null): UserType | null => {
    if (!raw) return null
    try {
      return JSON.parse(raw) as UserType
    } catch (err) {
      console.warn("Invalid stored user data", err)
      return null
    }
  }

  const user = parseUser(storedUser)

  return (
    <AuthContext.Provider
      value={{
        signIn: () => {
          const fakeUser: UserType = {
            id: "xxx",
            email: "user@example.com",
            name: "User",
          }
          setStoredUser(JSON.stringify(fakeUser))
        },
        signOut: () => {
          setStoredUser(null)
        },
        user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
