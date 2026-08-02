import type { TextInputProps, TextStyle, ViewStyle } from "react-native"
// FormField is Yze's semantic input wrapper; direct native input usage stays isolated here.
// eslint-disable-next-line no-restricted-imports
import { TextInput, View } from "react-native"

import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

interface FormFieldProps extends TextInputProps {
  error?: string
  helper?: string
  label: string
}

export function FormField({ error, helper, label, style, ...props }: FormFieldProps) {
  const {
    theme: { colors },
    themed,
  } = useAppTheme()
  const helpId = `${props.nativeID ?? label}-help`

  return (
    <View style={themed($container)}>
      <Text preset="formLabel" text={label} />
      <TextInput
        accessibilityLabel={label}
        accessibilityHint={helper}
        aria-describedby={error || helper ? helpId : undefined}
        placeholderTextColor={colors.textDim}
        selectionColor={colors.tint}
        style={[
          themed($input),
          props.multiline && themed($multiline),
          error && themed($inputError),
          style,
        ]}
        {...props}
      />
      {error ? (
        <Text nativeID={helpId} preset="formHelper" style={themed($error)} text={error} />
      ) : helper ? (
        <Text nativeID={helpId} preset="formHelper" style={themed($helper)} text={helper} />
      ) : null}
    </View>
  )
}

const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({ gap: spacing.xxs })

const $input: ThemedStyle<TextStyle> = ({ colors, radii, spacing, typography }) => ({
  minHeight: 52,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  borderWidth: 1,
  borderColor: colors.controlBorder,
  borderRadius: radii.md,
  color: colors.text,
  backgroundColor: colors.surfaceRaised,
  fontFamily: typography.primary.normal,
  fontSize: 16,
  lineHeight: 22,
})

const $multiline: ThemedStyle<TextStyle> = () => ({ minHeight: 112, textAlignVertical: "top" })
const $inputError: ThemedStyle<TextStyle> = ({ colors }) => ({ borderColor: colors.error })
const $helper: ThemedStyle<TextStyle> = ({ colors }) => ({ color: colors.textDim })
const $error: ThemedStyle<TextStyle> = ({ colors }) => ({ color: colors.error })
