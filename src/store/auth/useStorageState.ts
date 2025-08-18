// session/useStorageState.ts
import { useEffect, useCallback, useReducer } from "react"
import { Platform } from "react-native"
import * as SecureStore from "expo-secure-store"

type UseStateHook<T> = [T | null, (value: T | null) => void]

function useAsyncState<T>(initialValue: T | null = null): UseStateHook<T> {
  return useReducer(
    (_: T | null, action: T | null = null) => action,
    initialValue,
  ) as UseStateHook<T>
}

export async function setStorageItemAsync(key: string, value: string | null) {
  if (process.env.EXPO_OS === "web") {
    if (value === null) {
      localStorage.removeItem(key)
    } else {
      localStorage.setItem(key, value)
    }
  } else {
    if (value == null) {
      await SecureStore.deleteItemAsync(key)
    } else {
      await SecureStore.setItemAsync(key, value)
    }
  }
}

export function useStorageState(key: string): UseStateHook<string> {
  const [state, setState] = useAsyncState<string>()

  useEffect(() => {
    if (Platform.OS === "web") {
      try {
        if (typeof localStorage !== "undefined") {
          setState(localStorage.getItem(key))
        }
      } catch (e) {
        console.error("Local storage is unavailable:", e)
      }
    } else {
      SecureStore.getItemAsync(key).then((value) => setState(value))
    }
  }, [key])

  const setValue = useCallback(
    (value: string | null) => {
      setState(value)
      setStorageItemAsync(key, value)
    },
    [key],
  )

  return [state, setValue]
}
