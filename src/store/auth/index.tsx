import { createContext, useContext, type PropsWithChildren } from "react"

import { useStorageState } from "./useStorageState"

export type User = {
  id: string
  email: string
  name: string
}

type AuthContextType = {
  user: User | null
  authToken: string | null
  refreshToken: string | null
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: PropsWithChildren) {
  const [storedUser, setStoredUser] = useStorageState("user")
  const [storedAuthToken, setStoredAuthToken] = useStorageState("authToken")
  const [storedRefreshToken, setStoredRefreshToken] = useStorageState("refreshToken")

  const parseUser = (raw: string | null): User | null => {
    if (!raw) return null
    try {
      return JSON.parse(raw) as User
    } catch (err) {
      console.warn("Invalid stored user data", err)
      return null
    }
  }

  const user = parseUser(storedUser)

  const signIn = async (email: string, password: string) => {
    // TODO: call backend here, mock for now
    const fakeUser: User = { id: "1", email, name: "John Doe" }
    const fakeAuthToken = "fakeAuthToken123"
    const fakeRefreshToken = "fakeRefreshToken456"

    setStoredUser(JSON.stringify(fakeUser))
    setStoredAuthToken(fakeAuthToken)
    setStoredRefreshToken(fakeRefreshToken)
  }

  const signOut = () => {
    setStoredUser(null)
    setStoredAuthToken(null)
    setStoredRefreshToken(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        authToken: storedAuthToken,
        refreshToken: storedRefreshToken,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider />")
  return { signIn: ctx.signIn, signOut: ctx.signOut }
}

export function useUser() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useUser must be used within <AuthProvider />")
  return { user: ctx.user, authToken: ctx.authToken, refreshToken: ctx.refreshToken }
}
