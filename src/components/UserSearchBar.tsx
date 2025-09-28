import { ComponentType, useMemo } from "react"
import { View, ViewStyle } from "react-native"

import { PressableIcon, TextField, TextFieldAccessoryProps } from "@/components"
import { useGroup } from "@/store/group"
import { useAppTheme } from "@/theme/context"

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
      placeholder="Search user..."
      value={searchUserTerm}
      onChangeText={setSearchUserTerm}
      RightAccessory={searchUserTerm !== "" ? SearchRightAccessory : undefined}
    />
  )
}
