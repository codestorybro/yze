import React, { useEffect } from "react"
import { ViewStyle, FlatList, View, TextStyle } from "react-native"
import Animated, {
  Easing,
  SlideInLeft,
  SlideOutLeft,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { Card, Text } from "@/components"
import isNewIos from "@/constants/isNewIos"
import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"
import { useGroup } from "@/store/group"
import { UserType } from "@/types/userType"

import { UserListCard } from "./UserListCard"

type Props = {
  users: UserType[]
}

export const UsersList: React.FC<Props> = ({ users }) => {
  const {
    themed,
    theme: { spacing },
  } = useAppTheme()
  const { searchUserTerm, isSearchBarFocused } = useGroup()
  const { bottom, top } = useSafeAreaInsets()

  const iosSearchInset = spacing.xxl
  const searchBarInset = useSharedValue(0)
  const baseTopInset = top + spacing.lg

  const filtered = users.filter((user) => user.name.includes(searchUserTerm))
  const showEmptyState = filtered.length === 0

  useEffect(() => {
    if (!isNewIos) return

    searchBarInset.value = withTiming(isSearchBarFocused ? iosSearchInset : 0, {
      duration: 1000,
      easing: Easing.out(Easing.cubic),
    })
  }, [isSearchBarFocused, iosSearchInset, searchBarInset])

  const animatedHeaderSpacerStyle = useAnimatedStyle(() => {
    if (!isNewIos || showEmptyState) return { height: 0 }

    return {
      height: searchBarInset.value,
    }
  }, [showEmptyState])

  const animatedEmptyStateStyle = useAnimatedStyle(() => {
    if (!isNewIos) return {}

    return {
      marginTop: baseTopInset + searchBarInset.value,
    }
  }, [baseTopInset])

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
      ListHeaderComponent={isNewIos ? <Animated.View style={animatedHeaderSpacerStyle} /> : null}
      renderItem={({ item: u, index: i }) => {
        return (
          <Animated.View entering={SlideInLeft.duration(250)} exiting={SlideOutLeft.duration(250)}>
            <Card
              onPress={() => console.log("User pressed!")}
              style={[
                themed($cardStyle),
                !isNewIos && i === 0 && { marginTop: top * 2.2 },
                !isNewIos &&
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
        <Animated.View
          style={[
            animatedEmptyStateStyle,
            themed($emptyStateWrapper),
            !isNewIos && { marginTop: top * 2.2 },
          ]}
        >
          <View style={themed($emptyIllustrationPlaceholder)} />
          <Text preset="heading" style={themed($emptyHeading)} text="Brak rezultatów" />
          <Text
            preset="subheading"
            style={themed($emptyDescription)}
            text="Sprawdź czy tekst jest poprawny, lub spróbuj szukać po innych frazach"
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

const $emptyIllustrationPlaceholder: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  width: spacing.xxxl,
  height: spacing.xxxl,
  borderRadius: spacing.md,
  backgroundColor: colors.separator,
  marginBottom: spacing.sm,
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
