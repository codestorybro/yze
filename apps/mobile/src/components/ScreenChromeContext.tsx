import { createContext, PropsWithChildren, useContext } from "react"

interface ScreenChromeContextValue {
  nativeTabs: boolean
}

const ScreenChromeContext = createContext<ScreenChromeContextValue>({ nativeTabs: false })

export function NativeTabsScreenChromeProvider({ children }: PropsWithChildren) {
  return (
    <ScreenChromeContext.Provider value={{ nativeTabs: true }}>
      {children}
    </ScreenChromeContext.Provider>
  )
}

export function useScreenChrome() {
  return useContext(ScreenChromeContext)
}
