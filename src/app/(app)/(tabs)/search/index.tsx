import { useEffect } from "react"
import { View, ViewStyle, StyleSheet } from "react-native"
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

const mockedUsers = [
  {
    id: "1",
    name: "John Doe",
    avatarUri: "https://avatar.iran.liara.run/public/40",
  },
  {
    id: "2",
    name: "Jane Smith",
    avatarUri: "https://avatar.iran.liara.run/public/16",
  },
  {
    id: "3",
    name: "Alice Johnson",
    avatarUri: "https://avatar.iran.liara.run/public/33",
  },
  {
    id: "4",
    name: "Bob Brown",
    avatarUri: "https://avatar.iran.liara.run/public/32",
  },
  {
    id: "5",
    name: "Charlie Davis",
    avatarUri: "https://avatar.iran.liara.run/public/39",
  },
  { id: "13", name: "No avataro alvaro", avatarUri: "" },
  {
    id: "6",
    name: "David Wilson",
    avatarUri: "https://avatar.iran.liara.run/public/21",
  },
  {
    id: "7",
    name: "Emma Thompson",
    avatarUri: "https://avatar.iran.liara.run/public/3",
  },
  {
    id: "8",
    name: "Frank Miller",
    avatarUri: "https://avatar.iran.liara.run/public/48",
  },
  {
    id: "9",
    name: "Grace Lee",
    avatarUri: "https://avatar.iran.liara.run/public/36",
  },
  {
    id: "10",
    name: "Hannah White",
    avatarUri: "https://avatar.iran.liara.run/public/12",
  },
  { id: "14", name: "Blah bala" },
  {
    id: "11",
    name: "Ian Harris",
    avatarUri: "https://avatar.iran.liara.run/public/27",
  },
  {
    id: "12",
    name: "Jack Clark",
    avatarUri: "https://avatar.iran.liara.run/public/23",
  },
  { id: "15", name: "Lorem ipsum" },
  {
    id: "16",
    name: "Tony Williams",
    avatarUri: "https://avatar.iran.liara.run/public/16",
  },
  {
    id: "17",
    name: "Stephen Clark",
    avatarUri: "https://avatar.iran.liara.run/public/17",
  },
  {
    id: "18",
    name: "Johny Bravo",
    avatarUri: "https://avatar.iran.liara.run/public/23",
  },
]

export default function Voting() {
  const { membersList, setMembersList } = useGroup()
  const { top, bottom } = useSafeAreaInsets()
  const {
    themed,
    theme: { colors, spacing },
  } = useAppTheme()

  useEffect(() => {
    setMembersList(mockedUsers)
  }, [])

  if (!membersList) return null

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
        <UsersList users={membersList} />
      </LoggedScreenWrapper>

      <KeyboardResponsiveView
        style={[themed($actionContentWrapper), { bottom }]}
        extraShift={spacing.lg}
      >
        <Button preset="floating" onPress={() => router.back()}>
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

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
})
