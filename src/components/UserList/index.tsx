import React, { useState, useCallback } from "react"
import {
  ActivityIndicator,
  FlatList,
  ImageStyle,
  RefreshControl,
  TextStyle,
  ViewStyle,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native"
import Animated, {
  SlideInLeft,
  SlideOutLeft,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { Card, SkeletonImage, Text } from "@/components"
import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"
import { useGroup } from "@/store/group"
import { UserType } from "@/types/userType"

import { UserListCard } from "./UserListCard"
import { useModal } from "@/store/modal"

type Props = {
  users: UserType[]
}

const cryFace = require("@assets/images/cry.png")
const _pullThreshold = 200

export const UsersList: React.FC<Props> = ({ users }) => {
  const {
    themed,
    theme: { spacing, colors },
  } = useAppTheme()
  const { searchUserTerm, refreshMembersList, isMembersRefetching } = useGroup()
  const { openModal } = useModal()
  const { bottom, top } = useSafeAreaInsets()

  const [isRefreshingLocal, setIsRefreshingLocal] = useState(false)

  const activityIndicatorOpacity = useSharedValue(0)

  const filtered = users.filter((user) => user.name.includes(searchUserTerm))
  const showEmptyState = filtered.length === 0

  const listContentStyle = showEmptyState ? themed($emptyListContent) : undefined
  const showRefreshIndicator = (isRefreshingLocal || isMembersRefetching) && !showEmptyState

  const handleRefreshStart = useCallback(() => {
    setIsRefreshingLocal(true)
  }, [])

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetY = event.nativeEvent.contentOffset.y

      if (offsetY < 0 && !isRefreshingLocal && !isMembersRefetching) {
        const progress = Math.min(Math.abs(offsetY) / _pullThreshold, 1)
        activityIndicatorOpacity.value = withTiming(progress, { duration: 100 })
      } else if (!isRefreshingLocal && !isMembersRefetching) {
        activityIndicatorOpacity.value = withTiming(0, { duration: 100 })
      }
    },
    [isRefreshingLocal, isMembersRefetching, _pullThreshold, activityIndicatorOpacity],
  )

  const handleScrollEndDrag = useCallback(
    async (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (isRefreshingLocal && event.nativeEvent.contentOffset.y <= 0) {
        try {
          await refreshMembersList()
        } finally {
          setIsRefreshingLocal(false)
          activityIndicatorOpacity.value = withTiming(0, { duration: 200 })
        }
      }
    },
    [isRefreshingLocal, refreshMembersList, activityIndicatorOpacity],
  )

  const isRefreshing = isRefreshingLocal || isMembersRefetching

  const animatedActivityIndicatorStyle = useAnimatedStyle(() => ({
    opacity: activityIndicatorOpacity.value,
  }))

  return (
    <>
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
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onScrollEndDrag={handleScrollEndDrag}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefreshStart}
            tintColor={colors.text}
          />
        }
        renderItem={({ item: user, index }) => {
          const isAlreadyAppreciated = !!user.alreadyAppreciated

          const handlePress = isAlreadyAppreciated
            ? undefined
            : () => {
                openModal({
                  title: user.name,
                  description: "You have selected this user.",
                  onConfirmPress: () => {
                    console.log("User pressed!")
                  },
                })
              }

          return (
            <Animated.View
              entering={SlideInLeft.duration(250)}
              exiting={SlideOutLeft.duration(250)}
            >
              <Card
                onPress={handlePress}
                style={[
                  themed($cardStyle),
                  isAlreadyAppreciated && themed($cardAppreciatedStyle),
                  index === 0 && { marginTop: top * 2.2 },
                  index === filtered.length - 1 && {
                    marginBottom: bottom + spacing.xxxl + spacing.md,
                  },
                ]}
                ContentComponent={<UserListCard user={user} />}
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

      <Animated.View
        style={[
          themed($absoluteActivityIndicator),
          { top: top + spacing.xxl },
          animatedActivityIndicatorStyle,
        ]}
      >
        <ActivityIndicator color={colors.textDim} size="large" />
      </Animated.View>

      {showRefreshIndicator && (
        <ActivityIndicator
          color={colors.textDim}
          size="large"
          style={[themed($absoluteActivityIndicator), { top: top + spacing.xxl }]}
        />
      )}
    </>
  )
}

const $cardStyle: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.xs,
})

const $cardAppreciatedStyle: ThemedStyle<ViewStyle> = () => ({
  opacity: 0.5,
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

const $absoluteActivityIndicator: ThemedStyle<ViewStyle> = () => ({
  position: "absolute",
  left: 0,
  right: 0,
  alignItems: "center",
  zIndex: 1,
})
