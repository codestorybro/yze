import { createContext, useContext, useState, ReactNode } from "react"
import { useSharedValue } from "react-native-reanimated"

import { BottomSheet } from "@/components/BottomSheet"

type BottomSheetContextType = {
  openSheet: (content: ReactNode) => void
  closeSheet: () => void
}

const BottomSheetContext = createContext<BottomSheetContextType | undefined>(undefined)

export function BottomSheetProvider({ children }: { children: ReactNode }) {
  const isOpen = useSharedValue(false)
  const [content, setContent] = useState<ReactNode>(null)

  const toggleSheet = () => {
    isOpen.value = !isOpen.value
  }

  const openSheet = (c: ReactNode) => {
    setContent(c)
    if (!isOpen.value) {
      toggleSheet()
    }
  }

  const closeSheet = () => {
    if (isOpen.value) {
      toggleSheet()
    }
  }

  return (
    <BottomSheetContext.Provider value={{ openSheet, closeSheet }}>
      {children}
      <BottomSheet isOpen={isOpen} toggleSheet={toggleSheet}>
        {content}
      </BottomSheet>
    </BottomSheetContext.Provider>
  )
}

export function useBottomSheet() {
  const ctx = useContext(BottomSheetContext)
  if (!ctx) throw new Error("useBottomSheet must be used inside BottomSheetProvider")
  return ctx
}
