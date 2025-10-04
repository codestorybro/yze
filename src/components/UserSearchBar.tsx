import { ComponentType, useMemo } from "react"
import { View, ViewStyle } from "react-native"

import { PressableIcon, TextField, TextFieldAccessoryProps } from "@/components"
import { useGroup } from "@/store/group"
import { useAppTheme } from "@/theme/context"
import { translate } from "@/i18n/translate"
import { ThemedStyle } from "@/theme/types"

export function UserSearchBar() {
  const { searchUserTerm, setSearchUserTerm } = useGroup()
  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  const SearchRightAccessory: ComponentType<TextFieldAccessoryProps> = useMemo(
    () =>
      function PasswordRightAccessory(props: TextFieldAccessoryProps) {
        return (
          <PressableIcon
            icon="x"
            color={colors.defaultReversed}
            containerStyle={props.style as ViewStyle}
            size={20}
            onPress={() => setSearchUserTerm("")}
          />
        )
      },
    [setSearchUserTerm, colors.defaultReversed],
  )

  return (
    <TextField
      inputWrapperStyle={themed($inputStyle)}
      placeholder={translate("searchScreen:searchForUser")}
      value={searchUserTerm}
      onChangeText={setSearchUserTerm}
      RightAccessory={searchUserTerm !== "" ? SearchRightAccessory : undefined}
    />
  )
}

const $inputStyle: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingVertical: spacing.xxs,
})
