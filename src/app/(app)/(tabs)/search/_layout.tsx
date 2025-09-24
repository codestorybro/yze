import isNewIos from "@/constants/isNewIos"
import { useSearch } from "@/store/vote"
import { Stack } from "expo-router"

export default function SearchLayout() {
  const { setSearchTerm } = useSearch()

  if (isNewIos)
    return (
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            headerStyle: { backgroundColor: "transparent" },
            headerTitle: "",
            headerSearchBarOptions: {
              placement: "automatic",
              placeholder: "",
              onChangeText: ({ nativeEvent }) => {
                setSearchTerm(nativeEvent.text)
              },
            },
          }}
        />
      </Stack>
    )
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  )
}
