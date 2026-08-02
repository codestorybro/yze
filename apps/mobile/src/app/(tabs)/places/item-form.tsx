import { useLocalSearchParams } from "expo-router"

import { ItemFormScreen } from "@/screens/ItemFormScreen"

export default function ItemFormRoute() {
  const params = useLocalSearchParams<{ itemId?: string; placeId?: string; placeName?: string }>()
  return (
    <ItemFormScreen
      itemId={first(params.itemId)}
      placeId={first(params.placeId)}
      placeName={first(params.placeName)}
    />
  )
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}
