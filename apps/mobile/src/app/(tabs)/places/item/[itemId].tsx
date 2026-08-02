import { useState } from "react"
import { Alert } from "react-native"
import { Href, router, useLocalSearchParams } from "expo-router"

import { useToast } from "@/components/feedback/ToastProvider"
import { ContextualToolbar } from "@/components/navigation/ContextualToolbar"
import { FloatingBackButton } from "@/components/navigation/FloatingBackButton"
import { ItemDetailsScreen } from "@/screens/ItemDetailsScreen"
import { deleteItem, getItem } from "@/services/api"
import { apiFailureMessage } from "@/services/api/problemMessage"
import { notifySuccess } from "@/utils/safeHaptics"

export default function ItemDetailsRoute() {
  const { itemId } = useLocalSearchParams<{ itemId: string }>()
  const id = first(itemId)
  const { showToast } = useToast()
  const [deleting, setDeleting] = useState(false)

  const edit = () => router.push(`/places/item-form?itemId=${id}` as Href)

  const move = async () => {
    const result = await getItem(id)
    if (result.kind !== "ok") {
      showToast({ message: apiFailureMessage(result), tone: "error" })
      return
    }
    router.push(
      `/places/move?kind=item&entityId=${id}&currentPlaceId=${result.data.placeId}` as Href,
    )
  }

  const remove = async () => {
    if (deleting) return
    setDeleting(true)
    const itemResult = await getItem(id)
    const result = await deleteItem(id)
    setDeleting(false)

    if (result.kind === "ok") {
      showToast("Item deleted")
      void notifySuccess()
      router.dismissTo(
        (itemResult.kind === "ok" ? `/places/${itemResult.data.placeId}` : "/places") as Href,
      )
      return
    }

    showToast({ message: apiFailureMessage(result), tone: "error" })
  }

  const confirmDelete = () => {
    Alert.alert(
      "Delete this Item?",
      "This removes it from Yze. The Place itself stays unchanged.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => void remove() },
      ],
    )
  }

  return (
    <>
      <FloatingBackButton />
      <ItemDetailsScreen itemId={id} />
      <ContextualToolbar
        actions={[
          {
            accessibilityLabel: "Delete Item",
            destructive: true,
            disabled: deleting,
            fallback: "D",
            icon: { ios: "trash", android: "delete", web: "delete" },
            onPress: confirmDelete,
          },
          {
            accessibilityLabel: "Move Item",
            disabled: deleting,
            fallback: "M",
            icon: {
              ios: "arrow.up.and.down.and.arrow.left.and.right",
              android: "drive_file_move",
              web: "drive_file_move",
            },
            onPress: () => void move(),
          },
          {
            accessibilityLabel: "Edit Item",
            disabled: deleting,
            fallback: "E",
            icon: { ios: "pencil", android: "edit", web: "edit" },
            onPress: edit,
          },
        ]}
      />
    </>
  )
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : (value ?? "")
}
