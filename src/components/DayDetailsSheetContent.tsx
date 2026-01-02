import { View, ViewStyle, TextStyle, StyleSheet } from "react-native"
import { useTranslation } from "react-i18next"
import { useAppTheme } from "@/theme/context"
import { Text } from "./Text"
import { Button } from "./Button"
import type { DayRating, MoodRating } from "@/types/ratingType"
import type { ThemedStyle } from "@/theme/types"
import type { TxKeyPath } from "@/i18n"

type DayDetailsSheetContentProps = {
  date: string
  rating?: DayRating
  partnerName: string
  onClose: () => void
}

const MOOD_DISPLAY: Record<MoodRating, { emoji: string; labelTx: TxKeyPath; color: string }> = {
  happy: { emoji: "😊", labelTx: "homeScreen:moods.happy", color: "#4CAF50" },
  loving: { emoji: "🥰", labelTx: "homeScreen:moods.loving", color: "#E91E63" },
  average: { emoji: "😐", labelTx: "homeScreen:moods.average", color: "#FFC107" },
  bored: { emoji: "🥱", labelTx: "homeScreen:moods.bored", color: "#9E9E9E" },
  sad: { emoji: "😢", labelTx: "homeScreen:moods.sad", color: "#2196F3" },
  angry: { emoji: "😠", labelTx: "homeScreen:moods.angry", color: "#F44336" },
}

export function DayDetailsSheetContent({
  date,
  rating,
  partnerName,
  onClose,
}: DayDetailsSheetContentProps) {
  const {
    themed,
    theme: { colors },
  } = useAppTheme()
  const { t, i18n } = useTranslation()

  const formatDate = (dateStr: string): string => {
    const dateObj = new Date(dateStr)
    return dateObj.toLocaleDateString(i18n.language, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <View style={themed($container)}>
      <Text preset="heading" style={themed($title)}>
        {formatDate(date)}
      </Text>

      {rating ? (
        <>
          <View style={[styles.moodContainer, themed($moodContainer)]}>
            <Text style={styles.moodEmoji}>{MOOD_DISPLAY[rating.mood].emoji}</Text>
            <Text style={[themed($moodLabel), { color: MOOD_DISPLAY[rating.mood].color }]}>
              {t("homeScreen:feltMood", {
                name: partnerName,
                mood: t(MOOD_DISPLAY[rating.mood].labelTx).toLowerCase(),
              })}
            </Text>
          </View>

          {rating.comment && (
            <View style={themed($commentContainer)}>
              <Text tx="homeScreen:comment" style={themed($commentLabel)} />
              <Text style={themed($commentText)}>{rating.comment}</Text>
            </View>
          )}
        </>
      ) : (
        <View style={themed($noRatingContainer)}>
          <Text style={styles.noRatingEmoji}>📅</Text>
          <Text tx="homeScreen:noRating" style={themed($noRatingText)} />
          <Text style={themed($noRatingSubtext)}>
            {t("homeScreen:noRatingSubtext", { name: partnerName })}
          </Text>
        </View>
      )}

      <Button preset="default" tx="common:close" onPress={onClose} style={styles.closeButton} />
    </View>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.md,
})

const $title: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.text,
  marginBottom: spacing.lg,
  textAlign: "center",
})

const $moodContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.cardBackground,
  borderRadius: 16,
  padding: spacing.lg,
  alignItems: "center",
  marginBottom: spacing.lg,
})

const $moodLabel: ThemedStyle<TextStyle> = ({ spacing }) => ({
  fontSize: 18,
  fontWeight: "600",
  marginTop: spacing.sm,
})

const $commentContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.cardBackground,
  borderRadius: 12,
  padding: spacing.md,
  marginBottom: spacing.lg,
})

const $commentLabel: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.textDim,
  fontSize: 12,
  marginBottom: spacing.xs,
})

const $commentText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
  fontSize: 16,
  lineHeight: 24,
})

const $noRatingContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  paddingVertical: spacing.xl,
})

const $noRatingText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.text,
  fontSize: 18,
  fontWeight: "600",
  marginTop: spacing.md,
})

const $noRatingSubtext: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.textDim,
  fontSize: 14,
  marginTop: spacing.xs,
  marginBottom: spacing.lg,
})

const styles = StyleSheet.create({
  moodContainer: {
    alignItems: "center",
  },
  moodEmoji: {
    fontSize: 64,
    lineHeight: 80,
    textAlign: "center",
  },
  noRatingEmoji: {
    fontSize: 48,
    lineHeight: 60,
    textAlign: "center",
  },
  closeButton: {
    marginTop: 8,
  },
})
