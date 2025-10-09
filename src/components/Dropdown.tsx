import { memo, useCallback, useMemo } from "react"
import type { ReactNode } from "react"
import { Pressable, StyleProp, StyleSheet, TextStyle, View, ViewStyle } from "react-native"
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated"

import { Text } from "./Text"
import { SvgIcon } from "./SvgIcon"
import { SvgIconPaths } from "./SvgIcon/svgsPaths"

import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import type { TxKeyPath } from "@/i18n"

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export type DropdownOption<TValue> = {
  labelTx?: TxKeyPath
  labelText?: string
  value: TValue
}

export type DropdownProps<TValue> = {
  options: Array<DropdownOption<TValue>>
  selectedValue?: TValue | null
  isOpen: boolean
  onToggle: () => void
  onSelect: (value: TValue) => void
  accessibilityLabel?: string
  triggerStyle?: StyleProp<ViewStyle>
  triggerTextStyle?: StyleProp<TextStyle>
  renderLabel?: (option: DropdownOption<TValue>) => ReactNode
  testID?: string
}

function areValuesEqual<TValue>(a: TValue | null | undefined, b: TValue | null | undefined) {
  if (a === b) return true
  if (a === undefined || a === null || b === undefined || b === null) return false
  if (typeof a === "object" && typeof b === "object") {
    try {
      return JSON.stringify(a) === JSON.stringify(b)
    } catch (error) {
      console.warn("Dropdown: failed to compare values", error)
    }
  }
  return false
}

function DropdownComponent<TValue>({
  options,
  selectedValue = null,
  isOpen,
  onToggle,
  onSelect,
  accessibilityLabel,
  triggerStyle,
  triggerTextStyle,
  renderLabel,
  testID,
}: DropdownProps<TValue>) {
  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  const triggerScale = useSharedValue(1)
  const triggerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: triggerScale.value }],
  }))

  const handleTriggerPressIn = useCallback(() => {
    triggerScale.value = withSpring(1.06, { damping: 100, stiffness: 1000 })
  }, [triggerScale])

  const handleTriggerPressOut = useCallback(() => {
    triggerScale.value = withSpring(1, { damping: 100, stiffness: 1000 })
  }, [triggerScale])

  const triggerStyleArray = useMemo(() => {
    if (!triggerStyle) return [] as StyleProp<ViewStyle>[]
    return Array.isArray(triggerStyle) ? triggerStyle : [triggerStyle]
  }, [triggerStyle])

  const selectedOption = useMemo(
    () => options.find((option) => areValuesEqual(option.value, selectedValue)) ?? null,
    [options, selectedValue],
  )

  return (
    <View style={styles.root} testID={testID}>
      <AnimatedPressable
        onPress={onToggle}
        onPressIn={handleTriggerPressIn}
        onPressOut={handleTriggerPressOut}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={[themed($trigger), ...triggerStyleArray, triggerAnimatedStyle]}
      >
        <Text
          tx={selectedOption?.labelTx}
          text={selectedOption?.labelText}
          style={[themed($triggerLabel), triggerTextStyle]}
          numberOfLines={1}
        />
        <SvgIcon
          pathData={SvgIconPaths.right_arrow}
          size={16}
          containerStyle={{ transform: [{ rotate: isOpen ? "90deg" : "0deg" }] }}
          color={colors.attributeArrowRight}
        />
      </AnimatedPressable>

      {isOpen && (
        <View style={themed($dropdownContainer)}>
          {options.map((option, index) => (
            <DropdownItem
              key={String(option.value)}
              option={option}
              index={index}
              total={options.length}
              isSelected={areValuesEqual(option.value, selectedOption?.value)}
              onSelect={onSelect}
              renderLabel={renderLabel}
            />
          ))}
        </View>
      )}
    </View>
  )
}

type DropdownItemProps<TValue> = {
  option: DropdownOption<TValue>
  index: number
  total: number
  isSelected: boolean
  onSelect: (value: TValue) => void
  renderLabel?: (option: DropdownOption<TValue>) => ReactNode
}

function DropdownItem<TValue>({
  option,
  index,
  total,
  isSelected,
  onSelect,
  renderLabel,
}: DropdownItemProps<TValue>) {
  const {
    themed,
    theme: { spacing },
  } = useAppTheme()

  const handlePress = useCallback(() => {
    onSelect(option.value)
  }, [onSelect, option.value])

  const topRadiusStyle =
    index === 0 ? { borderTopLeftRadius: spacing.md, borderTopRightRadius: spacing.md } : null
  const bottomRadiusStyle =
    index === total - 1
      ? { borderBottomLeftRadius: spacing.md, borderBottomRightRadius: spacing.md }
      : null

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        themed($dropdownItem),
        isSelected && themed($dropdownItemActive),
        pressed && themed($dropdownItemPressed),
        topRadiusStyle ?? undefined,
        bottomRadiusStyle ?? undefined,
      ]}
    >
      {renderLabel ? (
        renderLabel(option)
      ) : (
        <Text
          preset="default"
          style={[themed($dropdownItemText), isSelected && themed($dropdownItemTextActive)]}
          tx={option.labelTx}
          text={option.labelText}
        />
      )}
    </Pressable>
  )
}

export const Dropdown = memo(DropdownComponent) as unknown as typeof DropdownComponent

const styles = StyleSheet.create({
  root: {
    position: "relative",
    zIndex: 10,
    gap: 8,
  },
})

const $trigger: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  alignItems: "center",
  backgroundColor: colors.cardBackground,
  borderColor: colors.border,
  borderRadius: spacing.md,
  flexDirection: "row",
  justifyContent: "space-between",
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.xs,
})

const $triggerLabel: ThemedStyle<TextStyle> = ({ colors }) => ({
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
  borderRadius: spacing.md,
  borderWidth: 1,
  zIndex: 20,
  boxShadow: `0px 0px 12px ${colors.shadow}`,
})

const $dropdownItem: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
})

const $dropdownItemActive: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.touchHighlight,
})

const $dropdownItemPressed: ThemedStyle<ViewStyle> = ({ colors }) => ({
  opacity: 0.5,
})

const $dropdownItemText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
})

const $dropdownItemTextActive: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.primary,
})
