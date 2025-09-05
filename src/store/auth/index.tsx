import { createContext, useContext, type PropsWithChildren } from "react"

import { UserType } from "@/types/userType"

import { useStorageState } from "./useStorageState"

type AuthContextType = {
  user: UserType | null
  authToken: string | null
  refreshToken: string | null
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

const fakeUser: UserType = {
  id: "1",
  email: "example@example.com",
  name: "John Doe",
  avatarUri:
    "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541",
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [[isUserLoading, storedUser], setStoredUser] = useStorageState("user")
  const [[isAuthTokenLoading, storedAuthToken], setStoredAuthToken] = useStorageState("authToken")
  const [[isRefreshTokenLoading, storedRefreshToken], setStoredRefreshToken] =
    useStorageState("refreshToken")

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

  const signIn = async (email: string, password: string) => {
    // TODO: call backend here, mock for now
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

  const isLoading = isUserLoading || isAuthTokenLoading || isRefreshTokenLoading

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
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
  return {
    user: ctx.user,
    isLoading: ctx.isLoading,
    authToken: ctx.authToken,
    refreshToken: ctx.refreshToken,
  }
}
