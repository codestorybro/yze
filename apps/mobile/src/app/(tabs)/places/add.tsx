import { useLocalSearchParams } from "expo-router"

import { AddContentScreen } from "@/screens/AddContentScreen"

export default function AddContentRoute() {
  const params = useLocalSearchParams<{ placeId: string; placeName: string }>()
  return <AddContentScreen placeId={first(params.placeId)} placeName={first(params.placeName)} />
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : (value ?? "")
}
