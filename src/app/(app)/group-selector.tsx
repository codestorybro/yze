import { StyleSheet } from "react-native"
import { router } from "expo-router"

import { CircularSlider, Screen } from "@/components"

export default function Index() {
  const onConfirmButtonPress = () => {
    router.navigate("/")
  }

  return (
    <Screen preset="fixed" style={styles.container}>
      <CircularSlider onConfirm={onConfirmButtonPress} />
    </Screen>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
})
