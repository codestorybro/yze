export type TokenPair = {
  accessToken: string
  refreshToken: string
}

let tokens: TokenPair | null = null
const listeners = new Set<(value: TokenPair | null) => void>()

export function getAccessToken() {
  return tokens?.accessToken ?? null
}

export function getRefreshToken() {
  return tokens?.refreshToken ?? null
}

export function setTokens(nextTokens: TokenPair) {
  tokens = { ...nextTokens }
  notifyListeners(tokens)
}

export function clearTokens() {
  tokens = null
  notifyListeners(tokens)
}

export function subscribe(listener: (value: TokenPair | null) => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function notifyListeners(value: TokenPair | null) {
  listeners.forEach((listener) => {
    try {
      listener(value)
    } catch (error) {
      console.error("tokenManager listener error", error)
    }
  })
}
