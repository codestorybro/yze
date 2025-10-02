import React from "react"
import { ViewStyle, FlatList, Image } from "react-native"
import { UserType } from "@/types/userType"
import { Card } from "@/components"
import { translate } from "@/i18n/translate"
import { ThemedStyle } from "@/theme/types"
import { useAppTheme } from "@/theme/context"
import { useGroup } from "@/store/group"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { UserListCard } from "./UserListCard"
import isNewIos from "@/constants/isNewIos"

type Props = {
  users: UserType[]
}

const noResultsImage = Image.resolveAssetSource(require("../../../assets/images/user.png")).uri

export const UsersList: React.FC<Props> = ({ users }) => {
  const {
    themed,
    theme: { spacing },
  } = useAppTheme()
  const { searchUserTerm } = useGroup()
  const { bottom, top } = useSafeAreaInsets()

  const filtered = users.filter((user) => user.name.includes(searchUserTerm))

  return (
    <FlatList
      data={filtered}
      keyExtractor={(item) => item.id.toString()}
      showsVerticalScrollIndicator={false}
      automaticallyAdjustKeyboardInsets={false}
      contentInsetAdjustmentBehavior="never"
      keyboardShouldPersistTaps="handled"
      style={{ minHeight: "100%" }}
      renderItem={({ item: u, index: i }) => (
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
      )}
      ListEmptyComponent={
        <Card
          style={[themed($cardStyle), !isNewIos && { marginTop: top * 2.2 }]}
          ContentComponent={
            <UserListCard
              user={{
                id: "0",
                name: translate("searchScreen:noResults"),
                email: "",
                avatarUri: noResultsImage,
              }}
            />
          }
        />
      }
    />
  )
}

const $cardStyle: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.xs,
})
