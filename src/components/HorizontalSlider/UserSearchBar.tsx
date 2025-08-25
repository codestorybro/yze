import { ComponentType, useMemo } from "react"
import { View, ViewStyle } from "react-native"

import { PressableIcon, TextField, TextFieldAccessoryProps } from "@/components"
import { useSearch } from "@/store/vote"
import { useAppTheme } from "@/theme/context"

import { _imageWidth } from "."

export function UserSearchBar() {
  const { searchTerm, setSearchTerm } = useSearch()
  const {
    theme: { colors },
  } = useAppTheme()

  const SearchRightAccessory: ComponentType<TextFieldAccessoryProps> = useMemo(
    () =>
      function PasswordRightAccessory(props: TextFieldAccessoryProps) {
        return (
          <PressableIcon
            icon="x"
            color={colors.palette.neutral800}
            containerStyle={props.style as ViewStyle}
            size={20}
            onPress={() => setSearchTerm("")}
          />
        )
      },
    [setSearchTerm, colors.palette.neutral800],
  )

  return (
    <View style={{ width: _imageWidth }}>
      <TextField
        placeholder="Search user..."
        value={searchTerm}
        onChangeText={setSearchTerm}
        RightAccessory={searchTerm !== "" ? SearchRightAccessory : undefined}
      />
    </View>
  )
}
