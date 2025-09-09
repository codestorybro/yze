import { useContext } from "react"

import { BottomSheetContext } from "@/components/BottomSheet/BottomSheetProvider"

export function useBottomSheet() {
  const ctx = useContext(BottomSheetContext)
  if (!ctx) throw new Error("useBottomSheet must be used inside BottomSheetProvider")
  return ctx
}
