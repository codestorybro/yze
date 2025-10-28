import React, { useState, useCallback } from "react"
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
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

import { Card } from "@/components"
import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"
import { useGroup } from "@/store/group"
import { UserType } from "@/types/userType"

import { LeaderboardUserListCard } from "@/components/UserList/LeaderboardUserListCard"
import { useUser } from "@/store/auth"

type Props = {
  users: UserType[]
  onUserPress?: (user: UserType) => void
}

const _pullThreshold = 200

export const LeaderboardUsersList: React.FC<Props> = ({ users, onUserPress }) => {
  const {
    themed,
    theme: { spacing, colors },
  } = useAppTheme()
  const { searchUserTerm, refreshMembersList, isMembersRefetching } = useGroup()
  const { user: currentUser } = useUser()
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

  const getLeaderboardFrameColor = (position: number) => {
    switch (position) {
      case 1:
        return colors.gold
      case 2:
        return colors.silver
      case 3:
        return colors.bronze
      default:
        return undefined
    }
  }

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
          const position = index + 1
          const isCurrentUser = currentUser?.id === user.id
          const frameColor = getLeaderboardFrameColor(position)

          const handlePress = () => {
            if (onUserPress) {
              onUserPress(user)
            }
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
                  frameColor && {
                    borderWidth: 3,
                    borderColor: frameColor,
                  },
                  isCurrentUser && themed($currentUserCardStyle),
                  index === 0 && { marginTop: top * 3.8 },
                  index === filtered.length - 1 && {
                    marginBottom: bottom + spacing.xxxl + spacing.md,
                  },
                ]}
                ContentComponent={
                  <LeaderboardUserListCard
                    user={user}
                    position={position}
                    isCurrentUser={isCurrentUser}
                  />
                }
              />
            </Animated.View>
          )
        }}
      />

      <Animated.View
        style={[
          themed($absoluteActivityIndicator),
          { top: top * 3.8 },
          animatedActivityIndicatorStyle,
        ]}
      >
        <ActivityIndicator color={colors.textDim} size="large" />
      </Animated.View>

      {showRefreshIndicator && (
        <ActivityIndicator
          color={colors.textDim}
          size="large"
          style={[themed($absoluteActivityIndicator), { top: top * 3.8 }]}
        />
      )}
    </>
  )
}

const $cardStyle: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.xs,
})

const $currentUserCardStyle: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.primary + "20",
})

const $emptyListContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexGrow: 1,
  paddingHorizontal: spacing.lg,
  paddingBottom: spacing.xxxl,
})

const $absoluteActivityIndicator: ThemedStyle<ViewStyle> = () => ({
  position: "absolute",
  left: 0,
  right: 0,
  alignItems: "center",
  zIndex: 1,
})
