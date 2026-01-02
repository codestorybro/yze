import { useState } from "react"
import { View, Pressable, ViewStyle, TextStyle, StyleSheet } from "react-native"
import { useTranslation } from "react-i18next"
import { useAppTheme } from "@/theme/context"
import { Text } from "./Text"
import { Button } from "./Button"
import { TextField } from "./TextField"
import type { MoodRating } from "@/types/ratingType"
import type { ThemedStyle } from "@/theme/types"
import type { TxKeyPath } from "@/i18n"

type RatingSheetContentProps = {
  partnerName: string
  onSubmit: (mood: MoodRating, comment?: string) => Promise<void>
  onClose: () => void
  isSubmitting: boolean
}

const MOODS: Array<{ value: MoodRating; emoji: string; labelTx: TxKeyPath; color: string }> = [
  { value: "happy", emoji: "😊", labelTx: "homeScreen:moods.happy", color: "#4CAF50" },
  { value: "loving", emoji: "🥰", labelTx: "homeScreen:moods.loving", color: "#E91E63" },
  { value: "average", emoji: "😐", labelTx: "homeScreen:moods.average", color: "#FFC107" },
  { value: "bored", emoji: "🥱", labelTx: "homeScreen:moods.bored", color: "#9E9E9E" },
  { value: "sad", emoji: "😢", labelTx: "homeScreen:moods.sad", color: "#2196F3" },
  { value: "angry", emoji: "😠", labelTx: "homeScreen:moods.angry", color: "#F44336" },
]

export function RatingSheetContent({
  partnerName,
  onSubmit,
  onClose,
  isSubmitting,
}: RatingSheetContentProps) {
  const {
    themed,
    theme: { colors, spacing },
  } = useAppTheme()
  const { t } = useTranslation()

  const [selectedMood, setSelectedMood] = useState<MoodRating | null>(null)
  const [comment, setComment] = useState("")

  const handleSubmit = async () => {
    if (!selectedMood) return
    await onSubmit(selectedMood, comment.trim() || undefined)
    onClose()
  }

  return (
    <View style={themed($container)}>
      <Text preset="heading" style={themed($title)}>
        {t("homeScreen:howWasYourDay", { name: partnerName })}
      </Text>

      <Text tx="homeScreen:rateYourDay" style={themed($subtitle)} />

      <View style={styles.moodRow}>
        {MOODS.map((mood) => (
          <Pressable
            key={mood.value}
            onPress={() => setSelectedMood(mood.value)}
            style={[
              styles.moodButton,
              themed($moodButton),
              selectedMood === mood.value && {
                borderColor: mood.color,
                borderWidth: 3,
              },
            ]}
          >
            <Text style={styles.moodEmoji}>{mood.emoji}</Text>
            <Text
              tx={mood.labelTx}
              style={[themed($moodLabel), selectedMood === mood.value && { color: mood.color }]}
            />
          </Pressable>
        ))}
      </View>

      <Text tx="homeScreen:addComment" style={themed($commentLabel)} />

      <TextField
        value={comment}
        onChangeText={setComment}
        placeholderTx="homeScreen:commentPlaceholder"
        multiline
        containerStyle={themed($textField)}
        style={styles.textInput}
      />

      <View style={styles.buttonRow}>
        <Button
          preset="reverse"
          tx="common:cancel"
          onPress={onClose}
          style={[styles.button, themed($cancelButton)]}
        />
        <Button
          preset="default"
          tx="common:submit"
          onPress={handleSubmit}
          disabled={!selectedMood || isSubmitting}
          style={styles.button}
        />
      </View>
    </View>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.md,
})

const $title: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.text,
  marginBottom: spacing.xs,
  textAlign: "center",
})

const $subtitle: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.textDim,
  textAlign: "center",
  marginBottom: spacing.lg,
})

const $moodButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.cardBackground,
  borderRadius: 12,
  padding: spacing.md,
  alignItems: "center",
  borderWidth: 2,
  borderColor: colors.separator,
})

const $moodLabel: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 12,
  color: colors.textDim,
  marginTop: 4,
})

const $commentLabel: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.text,
  marginBottom: spacing.xs,
  marginTop: spacing.lg,
})

const $textField: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.lg,
})

const $cancelButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginRight: spacing.sm,
})

const styles = StyleSheet.create({
  moodRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  moodButton: {
    width: "30%",
    marginHorizontal: 4,
    marginVertical: 8,
  },
  moodEmoji: {
    fontSize: 32,
    lineHeight: 40,
    textAlign: "center",
  },
  textInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
  },
  button: {
    flex: 1,
  },
})
