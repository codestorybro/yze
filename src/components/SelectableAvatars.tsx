import React, { useEffect, useState } from "react"
import { TouchableOpacity, StyleSheet, ViewStyle } from "react-native"
import { MotiView, AnimatePresence } from "moti"
import { UserType } from "@/types/userType"
import { Text, Card, SkeletonImage, Button } from "@/components"
import { ThemedStyle } from "@/theme/types"
import { useAppTheme } from "@/theme/context"
import { useSearch, useVote } from "@/store/vote"
import { useBottomSheet } from "@/utils/useBottomSheet"
import { QuestionType } from "@/types/questionType"

type Props = {
  users: UserType[]
  question: QuestionType
  onSubmit: () => void
}

const _imageSize = 80

export const SelectableAvatars: React.FC<Props> = ({ users, onSubmit, question }) => {
  const { themed } = useAppTheme()
  const [available, setAvailable] = useState<UserType[]>(users)
  const { voteForUser, selectedUsers, resetUsers, isVoted } = useVote()
  const { searchTerm, setSearchTerm } = useSearch()
  const { openSheet, closeSheet } = useBottomSheet()

  const moveToSelected = (user: UserType) => {
    voteForUser(user)
    setAvailable((prev) => (prev ? prev.filter((u) => u.id !== user.id) : []))
  }

  const moveToAvailable = (user: UserType) => {
    voteForUser(user)
    setAvailable((prev) => [...(prev ?? []), user])
  }

  const handleResetButtonPress = () => {
    setSearchTerm("")
    resetUsers()
  }

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setAvailable(users.filter((u) => !(selectedUsers ?? []).find((s) => s.id === u.id)))
    } else {
      const lowerSearchTerm = searchTerm.toLowerCase()
      setAvailable(
        users.filter(
          (u) =>
            u.name.toLowerCase().includes(lowerSearchTerm) &&
            !(selectedUsers ?? []).find((s) => s.id === u.id),
        ),
      )
    }
  }, [searchTerm, users, selectedUsers])

  const handleSubmitButtonPress = () => {
    openSheet({
      title: "Are you sure?",
      description: "This action cannot be undone.",
      actionSection: (
        <>
          <Button
            style={styles.flex}
            onPress={() => {
              onSubmit()
              closeSheet()
            }}
          >
            Continue
          </Button>
          <Button preset="error" style={styles.flex} onPress={closeSheet}>
            Cancel
          </Button>
        </>
      ),
    })
  }

  const renderAvatar = (user: UserType, from: "available" | "selected") => (
    <AnimatePresence key={user.id}>
      <MotiView
        from={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5 }}
        transition={{ type: "timing", duration: 250 }}
        style={styles.avatarWrapper}
      >
        <TouchableOpacity
          onPress={() => (from === "available" ? moveToSelected(user) : moveToAvailable(user))}
        >
          <SkeletonImage
            size={_imageSize}
            source={
              user.avatarUri
                ? { uri: user.avatarUri }
                : require("../../assets/images/placeholder.png")
            }
            height={_imageSize}
            width={_imageSize}
            style={{ borderRadius: _imageSize / 2 }}
          />
        </TouchableOpacity>
      </MotiView>
    </AnimatePresence>
  )

  return (
    <>
      {users.map((u) => (
        <Card
          style={themed($selectedCardStyle)}
          key={u.id}
          ContentComponent={<Text>{u.name}</Text>}
        />
      ))}
      <Button
        onPress={handleResetButtonPress}
        preset="reverse"
        disabled={isVoted || !selectedUsers || selectedUsers?.length === 0}
        style={themed($button)}
      >
        Reset
      </Button>
      <Button
        disabled={isVoted || !selectedUsers || selectedUsers?.length === 0}
        onPress={handleSubmitButtonPress}
        style={themed($button)}
      >
        {isVoted ? "Voted already!" : "Submit"}
      </Button>
    </>
  )
}

const $button: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginVertical: spacing.xxs,
})

const $selectedCardStyle: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginVertical: spacing.xs,
})

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  avatarWrapper: {
    margin: 4,
  },
})
