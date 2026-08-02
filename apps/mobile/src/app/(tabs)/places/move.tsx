import { useLocalSearchParams } from "expo-router"

import { MoveContentScreen } from "@/screens/MoveContentScreen"

export default function MoveContentRoute() {
  const params = useLocalSearchParams<{
    currentPlaceId: string
    entityId: string
    kind: "item" | "place"
  }>()
  return (
    <MoveContentScreen
      currentPlaceId={first(params.currentPlaceId)}
      entityId={first(params.entityId)}
      kind={first(params.kind) === "place" ? "place" : "item"}
    />
  )
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : (value ?? "")
}
