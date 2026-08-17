import { useCallback, useRef } from "react"
import { useFocusEffect } from "expo-router"

import { useScreenChrome } from "@/components/ScreenChromeContext"

import type { ContextualToolbarAction } from "./ContextualToolbar.types"

export function useNativeTabAccessory(actions: ContextualToolbarAction[]) {
  const { nativeTabs, setNativeTabAccessoryActions } = useScreenChrome()
  const actionsRef = useRef(actions)
  actionsRef.current = actions

  useFocusEffect(
    useCallback(() => {
      if (!nativeTabs) return
      const registered = actionsRef.current
      setNativeTabAccessoryActions(registered)
      return () => {
        setNativeTabAccessoryActions((current) => (current === registered ? [] : current))
      }
    }, [nativeTabs, setNativeTabAccessoryActions]),
  )

  return nativeTabs
}
