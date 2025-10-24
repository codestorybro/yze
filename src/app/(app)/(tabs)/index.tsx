import { StyleSheet, View } from "react-native"

import { LoggedScreenWrapper, Text } from "@/components"

export default function Index() {
  return (
    <LoggedScreenWrapper>
      <View style={styles.screenWrapper}>
        <Text>Index</Text>
      </View>
    </LoggedScreenWrapper>
  )
}

const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1,
    position: "relative",
  },
})
