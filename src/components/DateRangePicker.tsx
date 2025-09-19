import { useState, useMemo } from "react"
import { View, ViewStyle, StyleSheet } from "react-native"
import { Calendar } from "react-native-calendars"

import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"
import { useBottomSheet } from "@/utils/useBottomSheet"

import { Button } from "./Button"

const _minDate = "2025-01-01"

function formatDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`
}

function getDatesInRange(start: string, end: string) {
  const range: string[] = []
  const current = new Date(start)
  const last = new Date(end)

  while (current <= last) {
    range.push(formatDate(current))
    current.setDate(current.getDate() + 1)
  }

  return range
}

export function DateRangePicker() {
  const {
    themed,
    theme: { colors },
    themeContext,
  } = useAppTheme()
  const { closeSheet } = useBottomSheet()

  const [startDate, setStartDate] = useState<string | null>(formatDate(new Date(_minDate)))
  const [endDate, setEndDate] = useState<string | null>(formatDate(new Date()))
  const [startMonthYear, setStartMonthYear] = useState<{ month: number; year: number }>({
    month: startDate ? new Date(startDate).getMonth() + 1 : new Date().getMonth() + 1,
    year: startDate ? new Date(startDate).getFullYear() : new Date().getFullYear(),
  })
  const [endMonthYear, setEndMonthYear] = useState<{ month: number; year: number }>({
    month: endDate ? new Date(endDate).getMonth() + 1 : new Date().getMonth() + 1,
    year: endDate ? new Date(endDate).getFullYear() : new Date().getFullYear(),
  })

  const today = new Date()
  const formattedToday = formatDate(today)
  const currentMonthYear = {
    month: today.getMonth() + 1,
    year: today.getFullYear(),
  }
  const minDateMonthYear = {
    month: new Date(_minDate).getMonth() + 1,
    year: new Date(_minDate).getFullYear(),
  }

  const calendarTheme = {
    backgroundColor: colors.cardBackground,
    todayTextColor: colors.secondary,
    calendarBackground: colors.cardBackground,
    dayTextColor: colors.text,
    monthTextColor: colors.text,
    arrowColor: colors.primary,
    textDisabledColor: colors.disabled,
    disabledArrowColor: colors.disabled,
  }

  const markedDates = useMemo(() => {
    if (!startDate) return {}

    if (!endDate) {
      return {
        [startDate]: {
          startingDay: true,
          endingDay: true,
          color: colors.primary,
          textColor: "#fff",
        },
      }
    }

    const dates = getDatesInRange(startDate, endDate)
    const marked: Record<string, any> = {}

    dates.forEach((date, idx) => {
      if (idx === 0) {
        marked[date] = { startingDay: true, color: colors.primary, textColor: "#fff" }
      } else if (idx === dates.length - 1) {
        marked[date] = { endingDay: true, color: colors.primary, textColor: "#fff" }
      } else {
        marked[date] = { color: colors.primary, textColor: "#fff" }
      }
    })

    return marked
  }, [startDate, endDate, colors.primary])

  return (
    <>
      <Calendar
        key={`start-${themeContext}`}
        style={themed($calendarStyles)}
        theme={calendarTheme}
        markingType="period"
        markedDates={markedDates}
        maxDate={formattedToday}
        current={`${startMonthYear.year}-${String(startMonthYear.month).padStart(2, "0")}-01`}
        onDayPress={(day) => {
          setStartDate(day.dateString)
          setEndDate(null)
        }}
        onMonthChange={({ month, year }) => {
          setStartMonthYear({ month, year })
        }}
        disableArrowRight={
          startMonthYear.month === currentMonthYear.month &&
          startMonthYear.year === currentMonthYear.year
        }
        disableArrowLeft={
          startMonthYear.month === minDateMonthYear.month &&
          startMonthYear.year === minDateMonthYear.year
        }
      />

      <Calendar
        key={`end-${themeContext}`}
        style={themed($calendarStyles)}
        theme={calendarTheme}
        markingType="period"
        markedDates={markedDates}
        maxDate={formattedToday}
        current={`${endMonthYear.year}-${String(endMonthYear.month).padStart(2, "0")}-01`}
        onDayPress={(day) => {
          if (startDate && new Date(day.dateString) >= new Date(startDate)) {
            setEndDate(day.dateString)
          }
        }}
        onMonthChange={({ month, year }) => {
          setEndMonthYear({ month, year })
        }}
        disableArrowRight={
          endMonthYear.month === currentMonthYear.month &&
          endMonthYear.year === currentMonthYear.year
        }
        disableArrowLeft={
          endMonthYear.month === minDateMonthYear.month &&
          endMonthYear.year === minDateMonthYear.year
        }
      />
      <View style={themed($actionSectionStyles)}>
        <Button
          style={styles.flex}
          onPress={() => {
            console.log("Selected Start Date:", startDate)
            console.log("Selected End Date:", endDate)
            closeSheet()
          }}
        >
          Confirm
        </Button>
        <Button preset="error" style={styles.flex} onPress={closeSheet}>
          Cancel
        </Button>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
})

const $calendarStyles: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.cardBackground,
  height: 350,
})

const $actionSectionStyles: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  gap: spacing.xs,
  justifyContent: "space-between",
  marginTop: spacing.lg,
})
