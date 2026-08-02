import { useLocalSearchParams } from "expo-router"

import { PlaceFormScreen } from "@/screens/PlaceFormScreen"

export default function PlaceFormRoute() {
  const params = useLocalSearchParams<{
    parentPlaceId?: string
    parentPlaceName?: string
    placeId?: string
  }>()

  return (
    <PlaceFormScreen
      parentPlaceId={first(params.parentPlaceId)}
      parentPlaceName={first(params.parentPlaceName)}
      placeId={first(params.placeId)}
    />
  )
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}
