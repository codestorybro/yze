import { StyleSheet } from "react-native"
import { router } from "expo-router"

import { CircularSlider, Screen } from "@/components"

const mockedGroups = [
  {
    id: "1",
    imageUri: "https://cdn.pixabay.com/photo/2017/01/29/17/24/android-2018790_1280.jpg",
  },
  {
    id: "2",
    imageUri: "https://img.gallerix.com/product/5654_44487.jpg",
  },
  {
    id: "3",
    imageUri: "https://static.posters.cz/image/1300/71936.jpg",
  },
  {
    id: "4",
    imageUri: "https://label-magazine.com/images/article/2021/03-marzec-march/Renault_logo.png",
  },
]

export default function Index() {
  const onConfirmButtonPress = () => {
    router.navigate("/")
  }

  return (
    <Screen preset="fixed" style={styles.container}>
      <CircularSlider onConfirm={onConfirmButtonPress} items={mockedGroups} />
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
