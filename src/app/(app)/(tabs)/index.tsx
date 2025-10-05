import { useCallback, useEffect, useMemo, useState } from "react"
import { Pressable, StyleSheet, TextStyle, View, ViewStyle } from "react-native"
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated"
import { endOfWeek, format, startOfWeek, subMonths, subWeeks, subYears } from "date-fns"
import { enUS, pl as plLocale } from "date-fns/locale"
import { useTranslation } from "react-i18next"

import {
  Button,
  ElementsList,
  LoggedScreenWrapper,
  SkeletonImage,
  SvgIcon,
  Text,
} from "@/components"
import type { ButtonAccessoryProps } from "@/components/Button"
import { SvgIconPaths } from "@/components/SvgIcon/svgsPaths"
import { TxKeyPath } from "@/i18n"
import { useUser } from "@/store/auth"
import { useAttributes } from "@/store/attributes"
import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"
import { AttributesViewType } from "@/types/attributesViewType"

const _avatarSize = 150

type PeriodOption = {
  labelTx: TxKeyPath
  value: AttributesViewType
}

const createArrowAccessory = (direction: "left" | "right") =>
  function ArrowAccessory({ style }: ButtonAccessoryProps) {
    return (
      <View style={style}>
        <SvgIcon
          pathData={SvgIconPaths.right_arrow}
          size={18}
          containerStyle={{ transform: [{ rotate: direction === "left" ? "180deg" : "0deg" }] }}
        />
      </View>
    )
  }

const LeftArrowAccessory = createArrowAccessory("left")
const RightArrowAccessory = createArrowAccessory("right")

export default function Index() {
  const { themed } = useAppTheme()
  const { user } = useUser()
  const { normalizedAttributes, refreshAttributes } = useAttributes()
  const { t, i18n } = useTranslation()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [selectedView, setSelectedView] = useState<AttributesViewType>("overall")
  const [periodOffset, setPeriodOffset] = useState(0)
  const avatarUri = user?.avatarUri
    ? { uri: user.avatarUri }
    : require("../../../../assets/images/user.png")

  const languageCode = useMemo(() => i18n.language?.split("-")[0] ?? "en", [i18n.language])
  const dateLocale = useMemo(() => (languageCode === "pl" ? plLocale : enUS), [languageCode])

  const capitalize = useCallback(
    (value: string) => {
      if (!value) return value
      const [firstChar, ...rest] = value
      return firstChar.toLocaleUpperCase(i18n.language ?? undefined) + rest.join("")
    },
    [i18n.language],
  )

  const periodOptions = useMemo<PeriodOption[]>(
    () => [
      { labelTx: "homeScreen:periodSelector.weekly" as TxKeyPath, value: "weekly" },
      { labelTx: "homeScreen:periodSelector.monthly" as TxKeyPath, value: "monthly" },
      { labelTx: "homeScreen:periodSelector.yearly" as TxKeyPath, value: "yearly" },
      { labelTx: "homeScreen:periodSelector.overall" as TxKeyPath, value: "overall" },
    ],
    [],
  )

  const currentOption = useMemo(
    () => periodOptions.find((option) => option.value === selectedView) ?? periodOptions[0],
    [periodOptions, selectedView],
  )

  const canNavigateBack = selectedView !== "overall"
  const canNavigateForward = selectedView !== "overall" && periodOffset > 0

  const rangeLabel = useMemo(() => {
    const now = new Date()

    if (selectedView === "overall") {
      return t("homeScreen:periodSelector.range.overall")
    }

    if (selectedView === "weekly") {
      if (periodOffset === 0) {
        return t("homeScreen:periodSelector.range.weekCurrent")
      }

      const targetDate = subWeeks(now, periodOffset)
      const weekStart = startOfWeek(targetDate, { weekStartsOn: 1 })
      const weekEnd = endOfWeek(targetDate, { weekStartsOn: 1 })
      const sameYear = weekStart.getFullYear() === weekEnd.getFullYear()
      const startFormat = sameYear ? "d MMM" : "d MMM yyyy"
      const startLabel = capitalize(format(weekStart, startFormat, { locale: dateLocale }))
      const endLabel = capitalize(format(weekEnd, "d MMM yyyy", { locale: dateLocale }))

      return `${startLabel} – ${endLabel}`
    }

    if (selectedView === "monthly") {
      if (periodOffset === 0) {
        return t("homeScreen:periodSelector.range.monthCurrent")
      }

      const targetDate = subMonths(now, periodOffset)
      return capitalize(format(targetDate, "LLLL yyyy", { locale: dateLocale }))
    }

    if (selectedView === "yearly") {
      if (periodOffset === 0) {
        return t("homeScreen:periodSelector.range.yearCurrent")
      }

      const targetDate = subYears(now, periodOffset)
      return format(targetDate, "yyyy", { locale: dateLocale })
    }

    return t("homeScreen:periodSelector.range.overall")
  }, [capitalize, dateLocale, periodOffset, selectedView, t])

  useEffect(() => {
    refreshAttributes({ view: selectedView, offset: periodOffset })
  }, [periodOffset, refreshAttributes, selectedView])

  const handleSelectView = useCallback((value: AttributesViewType) => {
    setSelectedView(value)
    setPeriodOffset(0)
    setIsDropdownOpen(false)
  }, [])

  const handleNavigateBack = useCallback(() => {
    if (!canNavigateBack) return
    setPeriodOffset((prev) => prev + 1)
  }, [canNavigateBack])

  const handleNavigateForward = useCallback(() => {
    if (!canNavigateForward) return
    setPeriodOffset((prev) => Math.max(0, prev - 1))
  }, [canNavigateForward])

  return (
    <LoggedScreenWrapper>
      <View style={styles.screenWrapper}>
        {isDropdownOpen && (
          <Pressable style={styles.dropdownOverlay} onPress={() => setIsDropdownOpen(false)} />
        )}

        <Animated.View
          entering={FadeInUp.delay(200).duration(1000).springify()}
          style={themed($avatarWrapper)}
        >
          <SkeletonImage
            size={_avatarSize}
            source={avatarUri}
            width={_avatarSize}
            height={_avatarSize}
            style={[styles.avatar, { borderRadius: _avatarSize / 2 }]}
          />
        </Animated.View>

        <Animated.Text
          entering={FadeInDown.delay(400).duration(1000).springify()}
          style={themed($nameText)}
        >
          {user?.name}
        </Animated.Text>

        <View style={styles.controlsWrapper}>
          <View style={styles.dropdownWrapper}>
            <Pressable
              onPress={() => setIsDropdownOpen((prev) => !prev)}
              style={themed($selectorButton)}
            >
              <Text
                preset="subheading"
                style={themed($selectorLabel)}
                numberOfLines={1}
                tx={currentOption.labelTx}
              />
              <SvgIcon
                pathData={SvgIconPaths.right_arrow}
                size={16}
                containerStyle={{ transform: [{ rotate: isDropdownOpen ? "90deg" : "0deg" }] }}
              />
            </Pressable>
            {isDropdownOpen && (
              <View style={themed($dropdownContainer)}>
                {periodOptions.map((option) => (
                  <Pressable
                    key={option.value}
                    onPress={() => handleSelectView(option.value)}
                    style={({ pressed }) => [
                      themed($dropdownItem),
                      option.value === selectedView && themed($dropdownItemActive),
                      pressed && themed($dropdownItemPressed),
                    ]}
                  >
                    <Text
                      preset="default"
                      style={[
                        themed($dropdownItemText),
                        option.value === selectedView && themed($dropdownItemTextActive),
                      ]}
                      tx={option.labelTx}
                    />
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          {normalizedAttributes.length > 0 && <ElementsList items={normalizedAttributes} />}

          <View style={[styles.navigationWrapper, selectedView === "overall" && { opacity: 0 }]}>
            <Button
              preset="floating"
              onPress={handleNavigateBack}
              disabled={!canNavigateBack}
              LeftAccessory={LeftArrowAccessory}
              text=""
              textStyle={styles.floatingButtonText}
              pressedTextStyle={styles.floatingButtonText}
              disabledTextStyle={styles.floatingButtonText}
              accessibilityLabel={t("homeScreen:periodSelector.range.navigatePrevious")}
            />
            <View style={styles.rangeLabelWrapper}>
              <Text
                preset="default"
                style={themed($rangeLabel)}
                numberOfLines={1}
                text={rangeLabel}
              />
            </View>
            <Button
              preset="floating"
              onPress={handleNavigateForward}
              disabled={!canNavigateForward}
              LeftAccessory={RightArrowAccessory}
              text=""
              textStyle={styles.floatingButtonText}
              pressedTextStyle={styles.floatingButtonText}
              disabledTextStyle={styles.floatingButtonText}
              accessibilityLabel={t("homeScreen:periodSelector.range.navigateNext")}
            />
          </View>
        </View>
      </View>
    </LoggedScreenWrapper>
  )
}

const $nameText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.text,
  fontSize: spacing.md,
  fontWeight: "bold",
  marginBottom: spacing.xl,
  textAlign: "center",
})

const $avatarWrapper: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  marginBottom: spacing.xs,
})

const $selectorButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  alignItems: "center",
  backgroundColor: colors.cardBackground,
  borderColor: colors.border,
  borderRadius: spacing.md,
  borderWidth: 1,
  flexDirection: "row",
  justifyContent: "space-between",
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.xs,
})

const $selectorLabel: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
  flex: 1,
  marginRight: 12,
})

const $dropdownContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  position: "absolute",
  top: spacing.md + spacing.xxs,
  left: 0,
  right: 0,
  backgroundColor: colors.cardBackground,
  borderColor: colors.border,
  borderRadius: spacing.sm,
  borderWidth: 1,
  elevation: 4,
  paddingVertical: spacing.xxs,
  shadowColor: colors.shadow,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.12,
  shadowRadius: 12,
  zIndex: 10,
})

const $dropdownItem: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
})

const $dropdownItemPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.touchHighlight,
})

const $dropdownItemActive: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.separator,
})

const $dropdownItemText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
})

const $dropdownItemTextActive: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.primary,
  fontWeight: "600",
})

const $rangeLabel: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
  textAlign: "center",
})

const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1,
    position: "relative",
  },
  dropdownOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 5,
  },
  avatar: {
    alignSelf: "center",
    justifyContent: "center",
  },
  controlsWrapper: {
    alignSelf: "stretch",
    marginBottom: 16,
    gap: 12,
  },
  dropdownWrapper: {
    position: "relative",
    zIndex: 10,
  },
  navigationWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rangeLabelWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  rangeLabelStandalone: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    paddingHorizontal: 8,
  },
  floatingButtonText: {
    display: "none",
  },
})
