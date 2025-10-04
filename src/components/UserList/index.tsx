import React from "react"
import { ViewStyle, FlatList, TextStyle, ImageStyle } from "react-native"
import Animated, { SlideInLeft, SlideOutLeft } from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { Card, SkeletonImage, Text } from "@/components"
import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"
import { useGroup } from "@/store/group"
import { UserType } from "@/types/userType"

import { UserListCard } from "./UserListCard"

type Props = {
  users: UserType[]
}

const cryFace = require("@assets/images/cry.png")

export const UsersList: React.FC<Props> = ({ users }) => {
  const {
    themed,
    theme: { spacing },
  } = useAppTheme()
  const { searchUserTerm } = useGroup()
  const { bottom, top } = useSafeAreaInsets()

  const filtered = users.filter((user) => user.name.includes(searchUserTerm))
  const showEmptyState = filtered.length === 0

  const listContentStyle = showEmptyState ? themed($emptyListContent) : undefined

  return (
    <FlatList
      data={filtered}
      keyExtractor={(item) => item.id.toString()}
      showsVerticalScrollIndicator={false}
      automaticallyAdjustKeyboardInsets={false}
      contentInsetAdjustmentBehavior="never"
      keyboardShouldPersistTaps="handled"
      style={{ minHeight: "100%" }}
      contentContainerStyle={listContentStyle}
      scrollEnabled={!showEmptyState}
      renderItem={({ item: u, index: i }) => {
        return (
          <Animated.View entering={SlideInLeft.duration(250)} exiting={SlideOutLeft.duration(250)}>
            <Card
              onPress={() => console.log("User pressed!")}
              style={[
                themed($cardStyle),
                i === 0 && { marginTop: top * 2.2 },
                i === filtered.length - 1 && {
                  marginBottom: bottom + spacing.xxxl,
                },
              ]}
              ContentComponent={<UserListCard user={u} />}
            />
          </Animated.View>
        )
      }}
      ListEmptyComponent={
        <Animated.View style={[themed($emptyStateWrapper), { marginTop: top * 2.2 }]}>
          <SkeletonImage
            source={cryFace}
            size={128}
            style={themed($emptyIllustrationPlaceholder)}
          />

          <Text preset="heading" style={themed($emptyHeading)} tx="searchScreen:noResults" />
          <Text
            preset="subheading"
            style={themed($emptyDescription)}
            tx="searchScreen:suggestion"
          />
        </Animated.View>
      }
    />
  )
}

const $cardStyle: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.xs,
})

const $emptyListContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexGrow: 1,
  paddingHorizontal: spacing.lg,
  paddingBottom: spacing.xxxl,
})

const $emptyStateWrapper: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  gap: spacing.xs,
})

const $emptyIllustrationPlaceholder: ThemedStyle<ImageStyle> = ({ spacing }) => ({
  marginTop: -spacing.lg,
})

const $emptyHeading: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
  textAlign: "center",
})

const $emptyDescription: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.textDim,
  textAlign: "center",
  maxWidth: 280,
  marginHorizontal: spacing.sm,
})
