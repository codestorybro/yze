import { BottomSheetContext } from "@/components/BottomSheetProvider"
import { useContext } from "react"

export const useBottomSheet = () => {
  const ctx = useContext(BottomSheetContext)
  if (!ctx) throw new Error("useBottomSheet must be used within BottomSheetProvider")
  return ctx
}
