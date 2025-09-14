import { View, ViewStyle } from "react-native"
import * as Application from "expo-application"

import { Card, Text } from "@/components"
import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"

import { ListItem } from "./ListItem"

const usingHermes = typeof HermesInternal === "object" && HermesInternal !== null

export function DevSection() {
  const { themed } = useAppTheme()

  return (
    <Card
      HeadingComponent={<Text preset="bold" size="lg" tx="devSection:title" />}
      ContentComponent={
        <>
          <ListItem
            LeftComponent={
              <View style={themed($item)}>
                <Text preset="bold">App Id</Text>
                <Text>{Application.applicationId}</Text>
              </View>
            }
          />
          <ListItem
            LeftComponent={
              <View style={themed($item)}>
                <Text preset="bold">App Name</Text>
                <Text>{Application.applicationName}</Text>
              </View>
            }
          />
          <ListItem
            LeftComponent={
              <View style={themed($item)}>
                <Text preset="bold">App Version</Text>
                <Text>{Application.nativeApplicationVersion}</Text>
              </View>
            }
          />
          <ListItem
            LeftComponent={
              <View style={themed($item)}>
                <Text preset="bold">App Build Version</Text>
                <Text>{Application.nativeBuildVersion}</Text>
              </View>
            }
          />
          <ListItem
            LeftComponent={
              <View style={themed($item)}>
                <Text preset="bold">Hermes Enabled</Text>
                <Text>{String(usingHermes)}</Text>
              </View>
            }
          />
        </>
      }
    />
  )
}

const $item: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
})
