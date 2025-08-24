import { ComponentType, useEffect, useMemo, useRef, useState } from "react"
import {
  // eslint-disable-next-line no-restricted-imports
  TextInput,
  ViewStyle,
  View,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TextStyle,
  Keyboard,
} from "react-native"
import { router } from "expo-router"
import { useForm, Controller } from "react-hook-form"
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated"

import {
  Button,
  PressableIcon,
  Screen,
  TextField,
  TextFieldAccessoryProps,
  Text,
} from "@/components"
import { AnimatedSvgIcon, AnimatedSvgIconRef } from "@/components/AnimatedSvgIcon"
import { SvgIconPaths } from "@/components/SvgIcon/svgsPaths"
import { WaveDivider } from "@/components/WaveDivider"
import { TxKeyPath } from "@/i18n"
import { translate } from "@/i18n/translate"
import { useAuth } from "@/store/auth"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

type FormData = {
  email: string
  password: string
}

const initialValues: FormData = {
  email: "",
  password: "",
}

export default function SignIn() {
  const { signIn } = useAuth()
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: initialValues,
  })

  const logoIconRef = useRef<AnimatedSvgIconRef>(null)
  const authPasswordInput = useRef<TextInput>(null)
  const [isAuthPasswordHidden, setIsAuthPasswordHidden] = useState(true)
  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  useEffect(() => {
    logoIconRef?.current?.animate()
  }, [])

  const onSubmit = async (data: FormData) => {
    await signIn(data.email, data.password)
    router.replace("/group-selector")
  }

  const PasswordRightAccessory: ComponentType<TextFieldAccessoryProps> = useMemo(
    () =>
      function PasswordRightAccessory(props: TextFieldAccessoryProps) {
        return (
          <PressableIcon
            icon={isAuthPasswordHidden ? "view" : "hidden"}
            color={colors.palette.neutral800}
            containerStyle={props.style as ViewStyle}
            size={20}
            onPress={() => setIsAuthPasswordHidden(!isAuthPasswordHidden)}
          />
        )
      },
    [isAuthPasswordHidden, colors.palette.neutral800],
  )

  return (
    <Screen disableKeyboardAvoidingView preset="fixed">
      <View style={StyleSheet.absoluteFill}>
        <View style={themed($topDividerView)} />
        <WaveDivider color={colors.background} />
        <View style={themed($bottomDividerView)} />
      </View>

      <View style={themed($logoIconContainer)}>
        <AnimatedSvgIcon
          ref={logoIconRef}
          pathData={SvgIconPaths.logo}
          color={colors.textReversed}
          size={128}
          slow
        />
        <Animated.View entering={FadeIn.delay(1000).duration(800)}>
          <Text
            style={themed($subHeadingText)}
            preset="subheading"
            tx="loginScreen:theSocialMirror"
          />
        </Animated.View>
      </View>

      <View onStartShouldSetResponder={() => true} onResponderRelease={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={0}
        >
          <View style={themed($formContainer)}>
            <Controller
              name="email"
              control={control}
              rules={{
                required: translate("loginScreen:emailRequired"),
                maxLength: {
                  value: 254,
                  message: translate("loginScreen:emailTooLong"),
                },
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: translate("loginScreen:emailInvalid"),
                },
              }}
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <Animated.View entering={FadeInDown.delay(200).duration(1000).springify()}>
                  <TextField
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    containerStyle={themed($textField)}
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect={false}
                    keyboardType="email-address"
                    placeholderTx="loginScreen:emailFieldPlaceholder"
                    helperTx={error?.message as TxKeyPath}
                    status={errors.email ? "error" : undefined}
                    onSubmitEditing={() => authPasswordInput.current?.focus()}
                  />
                </Animated.View>
              )}
            />

            <Controller
              name="password"
              control={control}
              rules={{
                required: translate("loginScreen:passwordRequired"),
                minLength: {
                  value: 8,
                  message: translate("loginScreen:passwordTooShort"),
                },
                maxLength: {
                  value: 128,
                  message: translate("loginScreen:passwordTooLong"),
                },
              }}
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()}>
                  <TextField
                    ref={authPasswordInput}
                    value={value}
                    onChangeText={onChange}
                    containerStyle={themed($textField)}
                    autoCapitalize="none"
                    autoComplete="password"
                    autoCorrect={false}
                    secureTextEntry={isAuthPasswordHidden}
                    placeholderTx="loginScreen:passwordFieldPlaceholder"
                    RightAccessory={PasswordRightAccessory}
                    onBlur={onBlur}
                    helperTx={error?.message as TxKeyPath}
                    status={errors.password ? "error" : undefined}
                    onSubmitEditing={handleSubmit(onSubmit)}
                  />
                </Animated.View>
              )}
            />

            <Animated.View entering={FadeInDown.delay(600).duration(1000).springify()}>
              <Button
                testID="login-button"
                tx="loginScreen:tapToLogIn"
                style={themed($tapButton)}
                onPress={handleSubmit(onSubmit)}
              />
            </Animated.View>

            <Animated.View
              entering={FadeInDown.delay(800).duration(1000).springify()}
              style={themed($forgotPasswordContainer)}
            >
              <Text tx="loginScreen:dontHaveAnAccount" />
              <Pressable onPress={() => console.log("Navigate to Sign Up")}>
                <Text tx="loginScreen:signUp" preset="bold" style={themed($signUpText)} />
              </Pressable>
            </Animated.View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Screen>
  )
}

const $subHeadingText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.textReversed,
  marginTop: 12,
  textAlign: "center",
})

const $signUpText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.primary,
})

const $forgotPasswordContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.md,
  flexDirection: "row",
  justifyContent: "center",
})

const $logoIconContainer: ThemedStyle<ViewStyle> = () => ({
  position: "absolute",
  width: "100%",
  top: "15%",
})

const $formContainer: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  height: "100%",
  top: "52%",
  marginHorizontal: spacing.sm,
  paddingHorizontal: spacing.sm,
  paddingTop: spacing.sm,
  backgroundColor: colors.background,
  borderRadius: 24,
})

const $textField: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.lg,
})

const $tapButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.md,
})

const $topDividerView: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.primary,
})

const $bottomDividerView: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.background,
})
