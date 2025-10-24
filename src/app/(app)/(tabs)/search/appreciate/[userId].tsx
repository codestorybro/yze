import React, { useState, useEffect, useCallback } from "react"
import { View, ViewStyle } from "react-native"
import { useLocalSearchParams, router } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"
import {
  Text,
  Button,
  AnimatedSelectableChip,
  SkeletonImage,
  LoggedScreenWrapper,
  TextField,
  Toggle,
} from "@/components"
import { fetchAllTraits } from "@/api/traits"
import { getGroupMembers } from "@/api/group"
import { useTranslation } from "react-i18next"
import { TwoStepAnimatedStepper } from "@/components/Stepper/TwoStepAnimatedStepper"
import { GradientSeparator } from "@/components/TabBar/GradientSeparator"
import { Switch } from "@/components/Toggle/Switch"

export default function AppreciateUserScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>()
  const {
    themed,
    theme: { spacing, colors },
  } = useAppTheme()
  const { bottom, top } = useSafeAreaInsets()
  const [step, setStep] = useState<1 | 2>(1)
  const { i18n, t } = useTranslation()
  const [traits, setTraits] = useState<{ id: string; label: string; archetypeId: string }[]>([])
  const [loadingTraits, setLoadingTraits] = useState(false)
  const [selectedTraits, setSelectedTraits] = useState<string[]>([])
  const [resolvedName, setResolvedName] = useState<string>("")
  const [comment, setComment] = useState<string>("")
  const [anonymous, setAnonymous] = useState<boolean>(false)
  const COMMENT_MAX = 300
  const canProceed = step === 1 ? selectedTraits.length > 0 : true

  useEffect(() => {
    if (step !== 1 || traits.length > 0 || loadingTraits) return
    setLoadingTraits(true)
    fetchAllTraits({ lang: i18n.language?.split("-")[0] }).then((data) => {
      setTraits(data)
      setLoadingTraits(false)
    })
  }, [step, traits.length, loadingTraits, i18n.language])

  useEffect(() => {
    let mounted = true
    getGroupMembers().then((members) => {
      if (!mounted) return
      const found = members.find((m) => m.id === userId)
      if (found?.name) {
        setResolvedName(found.name)
      }
    })
    return () => {
      mounted = false
    }
  }, [userId])

  const toggleTrait = useCallback((id: string) => {
    setSelectedTraits((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }, [])

  const goBackOrCancel = () => {
    if (step === 1) {
      router.back()
    } else {
      setStep(1)
    }
  }

  const goForwardOrAppreciate = () => {
    if (step === 1) {
      if (!canProceed) return
      setStep(2)
      return
    }
    // TODO: trigger appreciate action with selectedTraits
    console.log("Appreciate user", userId, {
      traits: selectedTraits,
      comment: comment.trim() || null,
      anonymous,
    })
    router.back()
  }

  return (
    <View style={themed($screen)}>
      <GradientSeparator
        style={[themed($titleWrapper), { paddingTop: top + spacing.md }]}
        heightMultiplier={3.5}
      >
        <TwoStepAnimatedStepper step={step} />
        {resolvedName && (
          <Text
            text={
              step === 1
                ? t("searchScreen:selectTraitsInstruction", { name: resolvedName })
                : t("searchScreen:commentTitle")
            }
            size="sm"
            preset="bold"
            style={{ margin: "auto" }}
          />
        )}
      </GradientSeparator>

      <LoggedScreenWrapper
        style={{ paddingTop: top + spacing.xxxl + spacing.md }}
        disableKeyboardAvoidingView
      >
        {step === 1 ? (
          <View style={{ flex: 1, width: "100%", gap: spacing.md }}>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.xs }}>
              {traits.map((trait) => (
                <AnimatedSelectableChip
                  key={trait.id}
                  label={trait.label}
                  selected={selectedTraits.includes(trait.id)}
                  onToggle={() => toggleTrait(trait.id)}
                  accentColor={colors.primary}
                />
              ))}
              {loadingTraits && traits.length === 0
                ? Array.from({ length: 20 }).map((_, i) => (
                    <View
                      key={`skeleton-${i}`}
                      style={{
                        width: 80,
                        height: 40,
                        paddingHorizontal: spacing.md,
                        paddingVertical: spacing.xs,
                      }}
                    >
                      <SkeletonImage height={40} width={80} infinityLoading />
                    </View>
                  ))
                : null}
            </View>
          </View>
        ) : (
          <View style={{ flex: 1, width: "100%", gap: spacing.lg }}>
            <TextField
              value={comment}
              onChangeText={(text) => {
                if (text.length <= COMMENT_MAX) {
                  setComment(text)
                } else {
                  setComment(text.slice(0, COMMENT_MAX))
                }
              }}
              placeholderTx="searchScreen:commentPlaceholder"
            />
            <Text
              tx="searchScreen:commentCharCounter"
              txOptions={{ count: comment.length, max: COMMENT_MAX }}
              size="xs"
              style={{
                alignSelf: "flex-end",
                marginTop: -spacing.sm,
                color:
                  comment.length > COMMENT_MAX * 0.95
                    ? colors.error
                    : comment.length > COMMENT_MAX * 0.9
                      ? colors.secondary
                      : colors.textDim,
              }}
            />
            <Switch
              value={anonymous}
              onValueChange={setAnonymous}
              labelPosition="left"
              labelTx="searchScreen:anonymousToggleLabel"
            />
          </View>
        )}
      </LoggedScreenWrapper>

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
          disabled={!canProceed}
          style={{ flex: 1 }}
        />
      </View>
    </View>
  )
}

const $titleWrapper: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  alignItems: "center",
  gap: spacing.xxs,
  paddingHorizontal: spacing.sm,
  paddingBottom: spacing.xxs,
  backgroundColor: colors.transparent,
  zIndex: 1,
  position: "absolute",
  left: 0,
  right: 0,
})

const $screen: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.mainBackground,
})

const $bottomActions: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  flexDirection: "row",
  position: "absolute",
  bottom: 0,
  gap: spacing.md,
  paddingHorizontal: spacing.md,
})
