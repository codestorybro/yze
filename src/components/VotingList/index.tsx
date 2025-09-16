import React from "react"
import { StyleSheet, ViewStyle, View, ScrollView, Platform } from "react-native"
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

  return (
    <>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ paddingTop: spacing.md, marginTop: -spacing.md }}
      >
        <View style={{ paddingBottom }}>
          {users.map((u) => {
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
                key={u.id}
                ContentComponent={<CardContent user={u} />}
              />
            )
          })}
        </View>
      </ScrollView>
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
