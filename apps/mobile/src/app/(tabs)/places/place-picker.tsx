import { useLocalSearchParams } from "expo-router"

import { PlacePickerScreen } from "@/screens/PlacePickerScreen"

export default function PlacePickerRoute() {
  const params = useLocalSearchParams<{
    destinationPlaceId?: string
    destinationPlaceName?: string
    mode?: "attach" | "manage"
  }>()

  return (
    <PlacePickerScreen
      destinationPlaceId={first(params.destinationPlaceId)}
      destinationPlaceName={first(params.destinationPlaceName)}
      mode={first(params.mode) === "attach" ? "attach" : "manage"}
    />
  )
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}
