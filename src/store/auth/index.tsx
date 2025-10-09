import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type PropsWithChildren,
} from "react"

import { login, logout } from "@/api/auth"
import { clearTokens, setTokens, subscribe } from "@/api/tokenManager"

import { UserType } from "@/types/userType"

import { useStorageState } from "./useStorageState"

type AuthContextType = {
  user: UserType | null
  authToken: string | null
  refreshToken: string | null
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: PropsWithChildren) {
  const [[isUserLoading, storedUser], setStoredUser] = useStorageState("user")
  const [[isAuthTokenLoading, storedAuthToken], setStoredAuthToken] = useStorageState("authToken")
  const [[isRefreshTokenLoading, storedRefreshToken], setStoredRefreshToken] =
    useStorageState("refreshToken")

  const parseUser = useCallback((raw: string | null): UserType | null => {
    if (!raw) return null
    try {
      return JSON.parse(raw) as UserType
    } catch (err) {
      console.warn("Invalid stored user data", err)
      return null
    }
  }, [])

  const user = useMemo(() => parseUser(storedUser), [parseUser, storedUser])

  useEffect(() => {
    if (isAuthTokenLoading || isRefreshTokenLoading) return

    if (storedAuthToken && storedRefreshToken) {
      setTokens({ accessToken: storedAuthToken, refreshToken: storedRefreshToken })
    } else {
      clearTokens()
    }
  }, [isAuthTokenLoading, isRefreshTokenLoading, storedAuthToken, storedRefreshToken])

  useEffect(() => {
    const unsubscribe = subscribe((tokenPair) => {
      if (!tokenPair) {
        setStoredAuthToken(null)
        setStoredRefreshToken(null)
        setStoredUser(null)
        return
      }

      setStoredAuthToken(tokenPair.accessToken)
      setStoredRefreshToken(tokenPair.refreshToken)
    })

    return unsubscribe
  }, [setStoredAuthToken, setStoredRefreshToken, setStoredUser])

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { user: authenticatedUser, tokens } = await login({ email, password })

      setStoredUser(JSON.stringify(authenticatedUser))
      setStoredAuthToken(tokens.accessToken)
      setStoredRefreshToken(tokens.refreshToken)
      setTokens(tokens)
    },
    [setStoredAuthToken, setStoredRefreshToken, setStoredUser],
  )

  const signOut = useCallback(async () => {
    try {
      await logout()
    } catch (error) {
      console.warn("Failed to notify backend about sign out", error)
    } finally {
      setStoredUser(null)
      setStoredAuthToken(null)
      setStoredRefreshToken(null)
      clearTokens()
    }
  }, [setStoredAuthToken, setStoredRefreshToken, setStoredUser])

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
