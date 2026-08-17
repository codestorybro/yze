import { createContext, Dispatch, PropsWithChildren, SetStateAction, useContext } from "react"

import type { ContextualToolbarAction } from "@/components/navigation/ContextualToolbar.types"

interface ScreenChromeContextValue {
  nativeTabs: boolean
  setNativeTabAccessoryActions: Dispatch<SetStateAction<ContextualToolbarAction[]>>
  setNativeTabsHidden: Dispatch<SetStateAction<boolean>>
}

const noop = () => undefined
const ScreenChromeContext = createContext<ScreenChromeContextValue>({
  nativeTabs: false,
  setNativeTabAccessoryActions: noop,
  setNativeTabsHidden: noop,
})

interface NativeTabsScreenChromeProviderProps extends PropsWithChildren {
  hidden?: boolean
  setAccessoryActions?: Dispatch<SetStateAction<ContextualToolbarAction[]>>
  setHidden?: Dispatch<SetStateAction<boolean>>
}

export function NativeTabsScreenChromeProvider({
  children,
  hidden = false,
  setAccessoryActions = noop,
  setHidden = noop,
}: NativeTabsScreenChromeProviderProps) {
  return (
    <ScreenChromeContext.Provider
      value={{
        nativeTabs: !hidden,
        setNativeTabAccessoryActions: setAccessoryActions,
        setNativeTabsHidden: setHidden,
      }}
    >
      {children}
    </ScreenChromeContext.Provider>
  )
}

export function useScreenChrome() {
  return useContext(ScreenChromeContext)
}
