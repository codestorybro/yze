import { View, ViewStyle, TextStyle, StyleSheet, Platform } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { Button, KeyboardResponsiveView, LoggedScreenWrapper, SvgIcon, Text } from "@/components"
import { useGroup } from "@/store/group"
import { UsersList } from "@/components"
import { UserSearchBar } from "@/components/UserSearchBar"
import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"
import { SvgIconPaths } from "@/components/SvgIcon/svgsPaths"
import { GradientSeparator } from "@/components/TabBar/GradientSeparator"
import { router } from "expo-router"

export default function Voting() {
  const { membersList, hasLoadedMembers, isMembersLoading, membersError } = useGroup()
  const { top, bottom } = useSafeAreaInsets()
  const {
    themed,
    theme: { colors, spacing },
  } = useAppTheme()

  if (!hasLoadedMembers && isMembersLoading) return null

  return (
    <View style={styles.flex}>
      <GradientSeparator style={[themed($titleWrapper), { paddingTop: top }]}>
        <Text
          preset="subheading"
          style={{
            margin: "auto",
          }}
          tx="searchScreen:whoToAppreciate"
        />
      </GradientSeparator>

      <LoggedScreenWrapper preset="fixed" disableKeyboardAvoidingView>
        {membersError ? (
          <View style={themed($errorWrapper)}>
            <Text preset="subheading" text={membersError} style={themed($errorText)} />
          </View>
        ) : membersList ? (
          <UsersList users={membersList} />
        ) : null}
      </LoggedScreenWrapper>

      <KeyboardResponsiveView
        style={[themed($actionContentWrapper), { bottom }]}
        extraShift={Platform.OS === "ios" ? spacing.xxs : spacing.xl}
      >
        <Button preset="floating" onPress={() => router.back()} style={{ height: 62, width: 62 }}>
          <SvgIcon pathData={SvgIconPaths.index} color={colors.text} />
        </Button>
        <View style={themed($searchBarWrapper)}>
          <UserSearchBar />
        </View>
      </KeyboardResponsiveView>
    </View>
  )
}

const $titleWrapper: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xxs,
  paddingHorizontal: spacing.sm,
  paddingBottom: spacing.xxs,
  backgroundColor: colors.transparent,
  zIndex: 1,
  position: "absolute",
  left: 0,
  right: 0,
})

const $searchBarWrapper: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
})

const $actionContentWrapper: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  position: "absolute",
  marginHorizontal: spacing.lg + spacing.xxxs,

  gap: spacing.xs,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
})

const $errorWrapper: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  paddingHorizontal: spacing.lg,
})

const $errorText: ThemedStyle<TextStyle> = () => ({
  textAlign: "center",
})

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
})
