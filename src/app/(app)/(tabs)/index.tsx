import { useState, useCallback } from "react"
import { View, ViewStyle, TextStyle } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useTranslation } from "react-i18next"

import { Screen, Text } from "@/components"
import { Avatar } from "@/components/Avatar"
import { MoodCalendar } from "@/components/MoodCalendar"
import { RatingSheetContent } from "@/components/RatingSheetContent"
import { DayDetailsSheetContent } from "@/components/DayDetailsSheetContent"
import { AnimatedSvgIcon } from "@/components/AnimatedSvgIcon"
import { SvgIconPaths } from "@/components/SvgIcon/svgsPaths"
import { useBottomSheet } from "@/store/bottomSheet"
import { usePartner } from "@/store/partner"
import { useUser } from "@/store/auth"
import { useAppTheme } from "@/theme/context"
import type { DayRating } from "@/types/ratingType"
import type { ThemedStyle } from "@/theme/types"

export default function HomeScreen() {
  const { top } = useSafeAreaInsets()
  const {
    themed,
    theme: { colors, spacing },
  } = useAppTheme()
  const { t } = useTranslation()

  const { user } = useUser()
  const { partner, ratings, selectedMonth, setSelectedMonth, submitRating, isSubmitting } =
    usePartner()
  const { openSheet, closeSheet } = useBottomSheet()

  const handlePartnerAvatarPress = useCallback(() => {
    if (!partner) return

    openSheet(
      <RatingSheetContent
        partnerName={partner.name}
        onSubmit={submitRating}
        onClose={closeSheet}
        isSubmitting={isSubmitting}
      />,
    )
  }, [partner, openSheet, closeSheet, submitRating, isSubmitting])

  const handleDayPress = useCallback(
    (date: string, rating?: DayRating) => {
      if (!partner) return

      openSheet(
        <DayDetailsSheetContent
          date={date}
          rating={rating}
          partnerName={partner.name}
          onClose={closeSheet}
        />,
      )
    },
    [partner, openSheet, closeSheet],
  )

  const handlePreviousMonth = useCallback(() => {
    const newMonth = selectedMonth.month === 1 ? 12 : selectedMonth.month - 1
    const newYear = selectedMonth.month === 1 ? selectedMonth.year - 1 : selectedMonth.year
    setSelectedMonth(newYear, newMonth)
  }, [selectedMonth, setSelectedMonth])

  const handleNextMonth = useCallback(() => {
    const today = new Date()
    const currentYear = today.getFullYear()
    const currentMonth = today.getMonth() + 1

    // Don't go beyond current month
    if (selectedMonth.year === currentYear && selectedMonth.month === currentMonth) {
      return
    }

    const newMonth = selectedMonth.month === 12 ? 1 : selectedMonth.month + 1
    const newYear = selectedMonth.month === 12 ? selectedMonth.year + 1 : selectedMonth.year
    setSelectedMonth(newYear, newMonth)
  }, [selectedMonth, setSelectedMonth])

  return (
    <Screen preset="scroll" contentContainerStyle={{ paddingTop: top }}>
      {/* Header with avatars and logo */}
      <View style={themed($header)}>
        <Avatar uri={user?.avatarUri} size={56} />

        <AnimatedSvgIcon pathData={SvgIconPaths.logo} color={colors.text} size={48} />

        <Avatar uri={partner?.avatarUri} size={56} onPress={handlePartnerAvatarPress} />
      </View>

      {/* Partner name hint */}
      <Text style={themed($partnerHint)}>
        {t("homeScreen:tapToRate", { name: partner?.name || "partner" })}
      </Text>

      {/* Calendar */}
      <MoodCalendar
        year={selectedMonth.year}
        month={selectedMonth.month}
        ratings={ratings}
        onDayPress={handleDayPress}
        onPreviousMonth={handlePreviousMonth}
        onNextMonth={handleNextMonth}
      />
    </Screen>
  )
}

const $header: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.md,
})

const $partnerHint: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  textAlign: "center",
  color: colors.textDim,
  fontSize: 14,
  marginBottom: spacing.md,
})
