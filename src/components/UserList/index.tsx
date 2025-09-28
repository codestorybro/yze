import React from "react"
import { ViewStyle, FlatList } from "react-native"
import { UserType } from "@/types/userType"
import { Card } from "@/components"
import { ThemedStyle } from "@/theme/types"
import { useAppTheme } from "@/theme/context"
import { useGroup } from "@/store/group"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { UserListCard } from "./UserListCard"
import isNewIos from "@/constants/isNewIos"

type Props = {
  users: UserType[]
}

export const UsersList: React.FC<Props> = ({ users }) => {
  const {
    themed,
    theme: { spacing, colors },
  } = useAppTheme()
  const { searchUserTerm } = useGroup()
  const { bottom } = useSafeAreaInsets()

  const filtered = users.filter((user) => user.name.includes(searchUserTerm))
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
    <FlatList
      data={dataResult}
      keyExtractor={(item) => item.id.toString()}
      showsVerticalScrollIndicator={false}
      style={{ minHeight: "100%" }}
      renderItem={({ item: u, index: i }) => {
        return (
          <Card
            onPress={() => {
              console.log("User pressed!")
            }}
            style={[
              themed($cardStyle),
              i === 0 && { marginTop: spacing.xl },
              !isNewIos &&
                i === dataResult.length - 1 && {
                  marginBottom: bottom + spacing.xxxl,
                },
            ]}
            ContentComponent={<UserListCard user={u} />}
          />
        )
      }}
    />
  )
}

const $cardStyle: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.xs,
})
