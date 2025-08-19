import { useMemo } from "react"
import { View, ViewStyle } from "react-native"
import * as Application from "expo-application"

import { Button, Text } from "@/components"
import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"

import { ListItem } from "./ListItem"

const usingHermes = typeof HermesInternal === "object" && HermesInternal !== null

export function DevSection() {
  const { themed } = useAppTheme()

  const reactotronDisplay = useMemo(
    () => async () => {
      if (__DEV__) {
        console.tron.display({
          name: "DISPLAY",
          value: {
            appId: Application.applicationId,
            appName: Application.applicationName,
            appVersion: Application.nativeApplicationVersion,
            appBuildVersion: Application.nativeBuildVersion,
            hermesEnabled: usingHermes,
          },
          important: true,
        })
      }
    },
    [],
  )

  return (
    <View style={themed($itemsInnerContainer)}>
      <Text preset="bold" size="lg" tx="devSection:title" />
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
      <Button tx="devSection:reactotron" onPress={reactotronDisplay} />
    </View>
  )
}

const $item: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
})

const $itemsInnerContainer: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  borderColor: colors.secondary,
  borderWidth: 1,
  borderRadius: spacing.lg,
  padding: spacing.md,
})
