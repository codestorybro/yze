import { View } from "react-native"

import { TextField } from "@/components"
import { useSearch } from "@/store/vote"

import { _imageWidth } from "."

export function UserSearchBar() {
  const { searchTerm, setSearchTerm } = useSearch()

  return (
    <View style={{ width: _imageWidth }}>
      <TextField placeholder="Search user..." value={searchTerm} onChangeText={setSearchTerm} />
    </View>
  )
}
