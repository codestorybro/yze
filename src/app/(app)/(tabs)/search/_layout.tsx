import isNewIos from "@/constants/isNewIos"
import { translate } from "@/i18n/translate"
import { useGroup } from "@/store/group"
import { Stack } from "expo-router"

export default function SearchLayout() {
  const { setSearchUserTerm } = useGroup()

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
              placeholder: translate("searchScreen:searchForUser"),
              onChangeText: ({ nativeEvent }) => {
                setSearchUserTerm(nativeEvent.text)
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
