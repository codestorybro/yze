import { StyleSheet, TextStyle, View, ViewStyle } from "react-native"

import { Button, LoggedScreenWrapper, SvgIcon, Text } from "@/components"
import { LeaderboardUsersList } from "@/components/UserList/LeaderboardUsersList"
import { GradientSeparator } from "@/components/TabBar/GradientSeparator"
import { ThemedStyle } from "@/theme/types"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useGroup } from "@/store/group"
import { useAppTheme } from "@/theme/context"
import { useMemo, useState } from "react"
import { TxKeyPath } from "@/i18n"
import { SvgIconPaths } from "@/components/SvgIcon/svgsPaths"
import { capitalize } from "@/utils/capitalize"

type SortingOptionType = "mostAppreciative" | "guru" | "buddy" | "flow" | "rise"

export default function Index() {
  const [selectedSortingOption, setSelectedSortingOption] =
    useState<SortingOptionType>("mostAppreciative")
  const { membersList, hasLoadedMembers, isMembersLoading, membersError, groupDetails } = useGroup()
  const { top } = useSafeAreaInsets()
  const {
    themed,
    theme: { colors, spacing },
  } = useAppTheme()

  const sortingOptions = useMemo(
    () => [
      {
        labelTx: "userScreen:sortingSelector.mostAppreciative" as TxKeyPath,
        value: "mostAppreciative",
      },
      { labelTx: "userScreen:sortingSelector.flow" as TxKeyPath, value: "flow" },
      { labelTx: "userScreen:sortingSelector.buddy" as TxKeyPath, value: "buddy" },
      { labelTx: "userScreen:sortingSelector.rise" as TxKeyPath, value: "rise" },
      { labelTx: "userScreen:sortingSelector.guru" as TxKeyPath, value: "guru" },
    ],
    [],
  )

  if (!hasLoadedMembers && isMembersLoading) return null

  return (
    <View style={styles.flex}>
      <GradientSeparator heightMultiplier={4} style={[themed($titleWrapper), { paddingTop: top }]}>
        <Text
          preset="subheading"
          style={{
            margin: "auto",
          }}
          // text={groupDetails?.name}
          text="Auctane"
        />
        <Text
          preset="subheading"
          style={{
            margin: "auto",
          }}
          tx={`homeScreen:sortingSelector.${selectedSortingOption}` as TxKeyPath}
        />
        <View style={{ flexDirection: "row", gap: spacing.sm }}>
          {sortingOptions.map((option) => (
            <Button
              preset="navigation"
              key={option.value}
              onPress={() => setSelectedSortingOption(option.value as SortingOptionType)}
              style={
                selectedSortingOption === option.value
                  ? {
                      backgroundColor:
                        colors[`attribute${capitalize(option.value)}` as keyof typeof colors],
                    }
                  : themed($selectorButton)
              }
            >
              <SvgIcon pathData={SvgIconPaths[option.value as keyof typeof SvgIconPaths]} />
            </Button>
          ))}
        </View>
      </GradientSeparator>

      <LoggedScreenWrapper preset="fixed" disableKeyboardAvoidingView>
        {membersError ? (
          <View style={themed($errorWrapper)}>
            <Text preset="subheading" text={membersError} style={themed($errorText)} />
          </View>
        ) : membersList ? (
          <LeaderboardUsersList
            users={membersList}
            onUserPress={() => console.log("User pressed!")}
          />
        ) : null}
      </LoggedScreenWrapper>
    </View>
  )
}

const $titleWrapper: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
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

const $errorWrapper: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  paddingHorizontal: spacing.lg,
})

const $errorText: ThemedStyle<TextStyle> = () => ({
  textAlign: "center",
})

const $selectorButton: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.cardBackground,
})

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
})
