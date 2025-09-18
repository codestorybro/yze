import React from "react"
import { StyleSheet, ViewStyle, View, FlatList } from "react-native"
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
    <View style={styles.wrapper}>
      <FlatList
        ref={listRef}
        data={dataResult}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        style={{ paddingTop: spacing.xl }}
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
                i === dataResult.length - 1 && {
                  marginBottom: bottom + spacing.xxxxl + spacing.sm,
                },
              ]}
              ContentComponent={<CardContent user={u} />}
            />
          )
        }}
      />
    </View>
  )
}

const $cardStyle: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginVertical: spacing.xs,
})

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
  },
})
