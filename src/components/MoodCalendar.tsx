import { useMemo } from "react"
import { View, Pressable, ViewStyle, TextStyle, StyleSheet } from "react-native"
import { useAppTheme } from "@/theme/context"
import { Text } from "./Text"
import { SvgIcon } from "./SvgIcon"
import { SvgIconPaths } from "./SvgIcon/svgsPaths"
import type { DayRating, MoodRating } from "@/types/ratingType"
import type { ThemedStyle } from "@/theme/types"

type MoodCalendarProps = {
  year: number
  month: number
  ratings: DayRating[]
  onDayPress: (date: string, rating?: DayRating) => void
  onPreviousMonth: () => void
  onNextMonth: () => void
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

const MOOD_COLORS: Record<MoodRating, string> = {
  happy: "#4CAF50",
  loving: "#E91E63",
  average: "#FFC107",
  bored: "#9E9E9E",
  sad: "#2196F3",
  angry: "#F44336",
}

const MOOD_ICONS: Record<MoodRating, string> = {
  happy: "😊",
  loving: "🥰",
  average: "😐",
  bored: "🥱",
  sad: "😢",
  angry: "😠",
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number): number {
  const day = new Date(year, month - 1, 1).getDay()
  // Convert Sunday = 0 to Sunday = 7 for Monday-first calendar
  return day === 0 ? 7 : day
}

function formatMonthYear(year: number, month: number): string {
  const date = new Date(year, month - 1, 1)
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
}

export function MoodCalendar({
  year,
  month,
  ratings,
  onDayPress,
  onPreviousMonth,
  onNextMonth,
}: MoodCalendarProps) {
  const {
    themed,
    theme: { colors, spacing },
  } = useAppTheme()

  const today = new Date()
  const todayStr = today.toISOString().split("T")[0]
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month

  const ratingsMap = useMemo(() => {
    const map = new Map<string, DayRating>()
    ratings.forEach((rating) => {
      map.set(rating.date, rating)
    })
    return map
  }, [ratings])

  const daysInMonth = getDaysInMonth(year, month)
  const firstDayOfWeek = getFirstDayOfMonth(year, month)
  const emptyCells = firstDayOfWeek - 1 // Monday = 1, so we need firstDay - 1 empty cells

  const calendarDays = useMemo(() => {
    const days: Array<{
      day: number
      dateStr: string
      rating?: DayRating
      isToday: boolean
      isFuture: boolean
    }> = []

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
      const dayDate = new Date(year, month - 1, day)
      const isFuture = dayDate > today

      days.push({
        day,
        dateStr,
        rating: ratingsMap.get(dateStr),
        isToday: dateStr === todayStr,
        isFuture,
      })
    }

    return days
  }, [year, month, daysInMonth, ratingsMap, todayStr, today])

  return (
    <View style={themed($container)}>
      {/* Month Navigation */}
      <View style={themed($header)}>
        <Pressable onPress={onPreviousMonth} style={themed($navButton)}>
          <SvgIcon
            pathData={SvgIconPaths.right_arrow}
            size={24}
            color={colors.text}
            containerStyle={{ transform: [{ rotate: "180deg" }] }}
          />
        </Pressable>

        <Text preset="bold" style={themed($monthTitle)}>
          {formatMonthYear(year, month)}
        </Text>

        <Pressable onPress={onNextMonth} style={themed($navButton)} disabled={isCurrentMonth}>
          <SvgIcon
            pathData={SvgIconPaths.right_arrow}
            size={24}
            color={isCurrentMonth ? colors.disabled : colors.text}
          />
        </Pressable>
      </View>

      {/* Weekday Headers */}
      <View style={styles.weekdaysRow}>
        {WEEKDAYS.map((day) => (
          <View key={day} style={styles.weekdayCell}>
            <Text style={themed($weekdayText)}>{day}</Text>
          </View>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={styles.calendarGrid}>
        {/* Empty cells for alignment */}
        {Array.from({ length: emptyCells }).map((_, index) => (
          <View key={`empty-${index}`} style={styles.dayCell} />
        ))}

        {/* Day cells */}
        {calendarDays.map(({ day, dateStr, rating, isToday, isFuture }) => (
          <Pressable
            key={dateStr}
            onPress={() => !isFuture && onDayPress(dateStr, rating)}
            disabled={isFuture}
            style={({ pressed }) => [
              styles.dayCell,
              themed($dayCellInner),
              isToday && themed($todayCell),
              pressed && !isFuture && styles.pressed,
            ]}
          >
            <Text
              style={[
                themed($dayNumber),
                isFuture && themed($futureDayNumber),
                isToday && themed($todayDayNumber),
              ]}
            >
              {day}
            </Text>

            {rating && (
              <Text style={[styles.moodEmoji, { color: MOOD_COLORS[rating.mood] }]}>
                {MOOD_ICONS[rating.mood]}
              </Text>
            )}
          </Pressable>
        ))}
      </View>
    </View>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.sm,
})

const $header: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingVertical: spacing.md,
})

const $navButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.xs,
})

const $monthTitle: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 18,
  color: colors.text,
})

const $weekdayText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 12,
  color: colors.textDim,
  textAlign: "center",
})

const $dayCellInner: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.cardBackground,
  borderRadius: 8,
  margin: 2,
  padding: spacing.xxs,
  alignItems: "center",
  justifyContent: "center",
  minHeight: 50,
})

const $todayCell: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderWidth: 2,
  borderColor: colors.primary,
})

const $dayNumber: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 14,
  color: colors.text,
})

const $futureDayNumber: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.disabled,
})

const $todayDayNumber: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.primary,
  fontWeight: "bold",
})

const styles = StyleSheet.create({
  weekdaysRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  weekdayCell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 4,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: "14.28%", // 100% / 7 days
  },
  pressed: {
    opacity: 0.7,
  },
  moodEmoji: {
    fontSize: 18,
    lineHeight: 24,
    marginTop: 2,
    textAlign: "center",
  },
})
