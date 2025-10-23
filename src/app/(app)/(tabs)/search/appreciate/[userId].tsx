import React from "react"
import { View, ViewStyle } from "react-native"
import { useLocalSearchParams, router } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"
import { Text, Button } from "@/components"
import { TwoStepAnimatedStepper } from "@/components/Stepper/TwoStepAnimatedStepper"

export default function AppreciateUserScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>()
  const {
    themed,
    theme: { spacing },
  } = useAppTheme()
  const { bottom, top } = useSafeAreaInsets()
  const [step, setStep] = React.useState<1 | 2>(1)

  const goBackOrCancel = () => {
    if (step === 1) {
      router.back()
    } else {
      setStep(1)
    }
  }

  const goForwardOrAppreciate = () => {
    if (step === 2) {
      // TODO: trigger appreciate action
      console.log("Appreciate user", userId)
      router.back()
    } else {
      setStep(2)
    }
  }

  return (
    <View style={themed($screen)}>
      <View style={[themed($stepperWrapper), { paddingTop: top + spacing.md }]}>
        <TwoStepAnimatedStepper step={step} />
      </View>

      <View style={themed($content)}>
        <Text>Blah blah blah</Text>
      </View>

      <View style={[themed($bottomActions), { paddingBottom: bottom + spacing.md }]}>
        <Button
          preset="default"
          onPress={goBackOrCancel}
          tx={step === 1 ? "searchScreen:cancel" : "searchScreen:back"}
          style={{ flex: 1 }}
        />
        <Button
          preset="default"
          onPress={goForwardOrAppreciate}
          tx={step === 2 ? "searchScreen:appreciate" : "searchScreen:next"}
          style={{ flex: 1 }}
        />
      </View>
    </View>
  )
}

const $screen: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.mainBackground,
})

const $stepperWrapper: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.md,
})

const $content: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  paddingHorizontal: spacing.lg,
  justifyContent: "center",
  alignItems: "center",
})

const $bottomActions: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  flexDirection: "row",
  gap: spacing.md,
  paddingHorizontal: spacing.md,
})
