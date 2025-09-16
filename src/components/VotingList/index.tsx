import React, { useRef } from "react"
import { StyleSheet, ViewStyle, View, Platform, FlatList } from "react-native"
import { UserType } from "@/types/userType"
import { Text, Card, Button, SvgIcon } from "@/components"
import { ThemedStyle } from "@/theme/types"
import { useAppTheme } from "@/theme/context"
import { useSearch, useVote } from "@/store/vote"
import { useBottomSheet } from "@/utils/useBottomSheet"
import { QuestionType } from "@/types/questionType"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { SvgIconPaths } from "../SvgIcon/svgsPaths"
import { CardContent } from "./CardContent"

type Props = {
  users: UserType[]
  question: QuestionType
  onSubmit: () => void
}

export const VotingList: React.FC<Props> = ({ users, onSubmit, question }) => {
  const {
    themed,
    theme: { spacing, colors },
  } = useAppTheme()
  const listRef = useRef<FlatList>(null)
  const { selectedUsers, resetUsers, isVoted, voteForUser } = useVote()
  const { searchTerm, setSearchTerm } = useSearch()
  const { openSheet, closeSheet } = useBottomSheet()
  const { bottom } = useSafeAreaInsets()
  const paddingBottom =
    Platform.OS === "ios" ? bottom + spacing.xxxxl + spacing.xxl : spacing.xxxxl + spacing.md
  const actionsPaddingBottom =
    Platform.OS === "ios" ? bottom + spacing.xxxxl + spacing.xl : spacing.xxxxl + spacing.lg
  const isButtonDisabled = isVoted || !selectedUsers || selectedUsers?.length === 0

  const handleResetButtonPress = () => {
    setSearchTerm("")
    resetUsers()
    listRef.current?.scrollToOffset({ offset: 0, animated: true })
  }

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
    <>
      <FlatList
        ref={listRef}
        data={dataResult}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        style={{ paddingTop: spacing.md, marginTop: -spacing.md }}
        contentContainerStyle={{ paddingBottom }}
        renderItem={({ item: u }) => {
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
              style={[themed($selectedCardStyle), isSelectedStyle]}
              ContentComponent={<CardContent user={u} />}
            />
          )
        }}
      />
      <View style={[themed($actionButtonsContentWrapper), { bottom: actionsPaddingBottom }]}>
        {isVoted ? (
          <Button disabled preset="no-border" style={styles.votedButton}>
            <Text preset="bold">Already voted, nice!</Text>
          </Button>
        ) : (
          <>
            <Button
              preset="no-border"
              disabled={isButtonDisabled}
              onPress={handleSubmitButtonPress}
              style={themed($button)}
            >
              {isVoted ? (
                "Voted already!"
              ) : (
                <SvgIcon
                  pathData={SvgIconPaths.check}
                  color={isButtonDisabled ? colors.disabled : colors.confirmation}
                />
              )}
            </Button>
            <Button preset="no-border" onPress={handleResetButtonPress} style={themed($button)}>
              <SvgIcon pathData={SvgIconPaths.reset} color={colors.secondary} />
            </Button>
          </>
        )}
      </View>
    </>
  )
}

const $actionButtonsContentWrapper: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  position: "absolute",
  marginHorizontal: spacing.xxxl,
  left: 0,
  right: 0,
  borderRadius: spacing.xl,
  flexDirection: "row",
  justifyContent: "space-between",
  backgroundColor: colors.tabBarBackground,
  paddingHorizontal: spacing.xxs,
  borderWidth: 1,
  borderColor: colors.border,
})

const $selectedCardStyle: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginVertical: spacing.xs,
})

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  votedButton: {
    marginHorizontal: "auto",
  },
})

const $button: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  marginVertical: spacing.xxs,
})
