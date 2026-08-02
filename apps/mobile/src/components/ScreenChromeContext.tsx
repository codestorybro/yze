import { createContext, Dispatch, PropsWithChildren, SetStateAction, useContext } from "react"

interface ScreenChromeContextValue {
  nativeTabs: boolean
  setNativeTabsHidden: Dispatch<SetStateAction<boolean>>
}

const noop = () => undefined
const ScreenChromeContext = createContext<ScreenChromeContextValue>({
  nativeTabs: false,
  setNativeTabsHidden: noop,
})

interface NativeTabsScreenChromeProviderProps extends PropsWithChildren {
  hidden?: boolean
  setHidden?: Dispatch<SetStateAction<boolean>>
}

export function NativeTabsScreenChromeProvider({
  children,
  hidden = false,
  setHidden = noop,
}: NativeTabsScreenChromeProviderProps) {
  return (
    <ScreenChromeContext.Provider value={{ nativeTabs: !hidden, setNativeTabsHidden: setHidden }}>
      {children}
    </ScreenChromeContext.Provider>
  )
}

export function useScreenChrome() {
  return useContext(ScreenChromeContext)
}
