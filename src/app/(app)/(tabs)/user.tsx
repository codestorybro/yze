import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Pressable, StyleSheet, TextStyle, View, ViewStyle } from "react-native"
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated"
import { endOfWeek, format, startOfWeek, subMonths, subWeeks, subYears } from "date-fns"
import { enUS, pl as plLocale } from "date-fns/locale"
import { useTranslation } from "react-i18next"

import {
  ArchetypesSheetContent,
  Button,
  ElementsList,
  ElementsListSkeleton,
  LoggedScreenWrapper,
  SkeletonImage,
  SvgIcon,
  Text,
} from "@/components"
import { Dropdown, type DropdownOption } from "@/components/Dropdown"
import type { ButtonAccessoryProps } from "@/components/Button"
import { SvgIconPaths } from "@/components/SvgIcon/svgsPaths"
import { TxKeyPath } from "@/i18n"
import { useUser } from "@/store/auth"
import { useAttributes } from "@/store/attributes"
import { useBottomSheet } from "@/store/bottomSheet"
import { useAppTheme } from "@/theme/context"
import { ThemedStyle } from "@/theme/types"
import { AttributesViewType } from "@/types/attributesViewType"
import { useNormalizeAttributes } from "@/utils/useNormalizeAttributes"
import { useFocusEffect } from "@react-navigation/native"

const _avatarSize = 150

type PeriodOption = DropdownOption<AttributesViewType>

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

export default function User() {
  const { themed } = useAppTheme()
  const { user } = useUser()
  const {
    attributes,
    refreshAttributes,
    isLoading: isAttributesLoading,
    currentView,
    currentOffset,
    maxOffset,
  } = useAttributes()
  const { openSheet } = useBottomSheet()
  const { t, i18n } = useTranslation()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
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
      { labelTx: "userScreen:periodSelector.weekly" as TxKeyPath, value: "weekly" },
      { labelTx: "userScreen:periodSelector.monthly" as TxKeyPath, value: "monthly" },
      { labelTx: "userScreen:periodSelector.yearly" as TxKeyPath, value: "yearly" },
      { labelTx: "userScreen:periodSelector.overall" as TxKeyPath, value: "overall" },
    ],
    [],
  )

  const refreshAttributesRef = useRef(refreshAttributes)

  useEffect(() => {
    refreshAttributesRef.current = refreshAttributes
  }, [refreshAttributes])

  const hasHistoricalData = maxOffset > 0
  const canNavigateBack =
    currentView !== "overall" && hasHistoricalData && currentOffset < maxOffset
  const canNavigateForward = currentView !== "overall" && currentOffset > 0

  const rangeLabel = useMemo(() => {
    const now = new Date()

    if (currentView === "overall") {
      return t("userScreen:periodSelector.range.overall")
    }

    if (currentView === "weekly") {
      if (currentOffset === 0) {
        return t("userScreen:periodSelector.range.weekCurrent")
      }

      const targetDate = subWeeks(now, currentOffset)
      const weekStart = startOfWeek(targetDate, { weekStartsOn: 1 })
      const weekEnd = endOfWeek(targetDate, { weekStartsOn: 1 })
      const sameYear = weekStart.getFullYear() === weekEnd.getFullYear()
      const startFormat = sameYear ? "d MMM" : "d MMM yyyy"
      const startLabel = capitalize(format(weekStart, startFormat, { locale: dateLocale }))
      const endLabel = capitalize(format(weekEnd, "d MMM yyyy", { locale: dateLocale }))

      return `${startLabel} – ${endLabel}`
    }

    if (currentView === "monthly") {
      if (currentOffset === 0) {
        return t("userScreen:periodSelector.range.monthCurrent")
      }

      const targetDate = subMonths(now, currentOffset)
      return capitalize(format(targetDate, "LLLL yyyy", { locale: dateLocale }))
    }

    if (currentView === "yearly") {
      if (currentOffset === 0) {
        return t("userScreen:periodSelector.range.yearCurrent")
      }

      const targetDate = subYears(now, currentOffset)
      return format(targetDate, "yyyy", { locale: dateLocale })
    }

    return t("userScreen:periodSelector.range.overall")
  }, [capitalize, currentOffset, currentView, dateLocale, t])

  const handleSelectView = useCallback(
    (value: AttributesViewType) => {
      void refreshAttributes({ view: value, offset: 0 })
      setIsDropdownOpen(false)
    },
    [refreshAttributes],
  )

  useFocusEffect(
    useCallback(() => {
      const fetchLatest = async () => {
        try {
          await refreshAttributesRef.current?.()
        } catch {}
      }

      void fetchLatest()

      return () => {}
    }, []),
  )

  const handleNavigateBack = useCallback(() => {
    if (!canNavigateBack) return
    const nextOffset = Math.min(maxOffset, currentOffset + 1)
    void refreshAttributes({ offset: nextOffset })
  }, [canNavigateBack, currentOffset, maxOffset, refreshAttributes])

  const handleNavigateForward = useCallback(() => {
    if (!canNavigateForward) return
    const nextOffset = Math.max(0, currentOffset - 1)
    void refreshAttributes({ offset: nextOffset })
  }, [canNavigateForward, currentOffset, refreshAttributes])

  const handleOpenArchetypesSheet = useCallback(() => {
    openSheet(<ArchetypesSheetContent />)
  }, [openSheet])

  const normalizedAttributes = useNormalizeAttributes(attributes, rangeLabel)

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
            <Dropdown
              options={periodOptions}
              selectedValue={currentView}
              isOpen={isDropdownOpen}
              onToggle={() => setIsDropdownOpen((prev) => !prev)}
              onSelect={handleSelectView}
              accessibilityLabel={t("userScreen:periodSelector.accessibilityLabel")}
              triggerStyle={themed($selectorButton)}
              triggerTextStyle={themed($selectorLabel)}
              testID="period-selector"
            />
          </View>

          <View
            style={[
              styles.navigationWrapper,
              (currentView === "overall" || !hasHistoricalData) && { opacity: 0.95 },
            ]}
          >
            <Button
              preset="floating"
              onPress={handleNavigateBack}
              disabled={!canNavigateBack}
              LeftAccessory={LeftArrowAccessory}
              text=""
              textStyle={styles.floatingButtonText}
              pressedTextStyle={styles.floatingButtonText}
              disabledTextStyle={styles.floatingButtonText}
              accessibilityLabel={t("userScreen:periodSelector.range.navigatePrevious")}
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
              accessibilityLabel={t("userScreen:periodSelector.range.navigateNext")}
            />
          </View>

          {isAttributesLoading ? (
            <ElementsListSkeleton itemCount={normalizedAttributes.length || 4} />
          ) : (
            normalizedAttributes.length > 0 && <ElementsList items={normalizedAttributes} />
          )}
        </View>

        <Button
          tx="userScreen:linkButton"
          style={styles.linkButton}
          preset="link"
          onPress={handleOpenArchetypesSheet}
        />
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
  borderRadius: spacing.md,
  flexDirection: "row",
  justifyContent: "space-between",
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.md,
})

const $selectorLabel: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
  flex: 1,
  marginRight: 12,
})

const $rangeLabel: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textDim,
  textAlign: "center",
})

const styles = StyleSheet.create({
  linkButton: {
    alignSelf: "center",
  },
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
