import React from "react"
import { ViewStyle, FlatList } from "react-native"
import { UserType } from "@/types/userType"
import { Card } from "@/components"
import { ThemedStyle } from "@/theme/types"
import { useAppTheme } from "@/theme/context"
import { useSearch, useVote } from "@/store/vote"
import { QuestionType } from "@/types/questionType"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { CardContent } from "./CardContent"

type Props = {
  users: UserType[]
  question: QuestionType
  onSubmit: () => void
  listRef: React.RefObject<FlatList<any> | null>
}

export const VotingList: React.FC<Props> = ({ users, listRef }) => {
  const {
    themed,
    theme: { spacing, colors },
  } = useAppTheme()
  const { selectedUsers, voteForUser } = useVote()
  const { searchTerm } = useSearch()
  const { bottom } = useSafeAreaInsets()

  const filtered = users.filter((user) => user.name.includes(searchTerm))
  const dataResult = filtered.length
    ? filtered
    : [
        {
          id: "0",
          name: "No Results",
          avatarUri: require("../../../assets/images/placeholder.png"),
        },
      ]

  return (
    <FlatList
      ref={listRef}
      data={dataResult}
      keyExtractor={(item) => item.id.toString()}
      showsVerticalScrollIndicator={false}
      renderItem={({ item: u, index: i }) => {
        const isSelected = !!selectedUsers?.find((su) => su.id === u.id)
        const isSelectedStyle = isSelected
          ? {
              backgroundColor: colors.palette.primaryTransparent10,
              borderColor: colors.primary,
            }
          : {}

        return (
          <Card
            onPress={() => voteForUser(u)}
            style={[
              themed($cardStyle),
              isSelectedStyle,
              i === 0 && { marginTop: spacing.sm },
              i === dataResult.length - 1 && {
                marginBottom: bottom + spacing.xxxl,
              },
            ]}
            ContentComponent={<CardContent user={u} />}
          />
        )
      }}
    />
  )
}

const $cardStyle: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.xs,
})
