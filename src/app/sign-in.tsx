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
} from "react-native"
import { router } from "expo-router"

import {
  Button,
  PressableIcon,
  Screen,
  TextField,
  TextFieldAccessoryProps,
  Text,
} from "@/components"
import { AnimatedSvgIcon, AnimatedSvgIconRef } from "@/components/AnimatedSvgIcon"
import { SvgIconPaths } from "@/components/AnimatedSvgIcon/svgsPaths"
import { WaveDivider } from "@/components/WaveDivider"
import { useSession } from "@/store/ctx"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

export default function SignIn() {
  const { signIn } = useSession()
  const LogoIconRef = useRef<AnimatedSvgIconRef>(null)
  const authPasswordInput = useRef<TextInput>(null)
  const [authEmail, setAuthEmail] = useState("")
  const [authPassword, setAuthPassword] = useState("")
  const [isAuthPasswordHidden, setIsAuthPasswordHidden] = useState(true)

  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  useEffect(() => {
    LogoIconRef?.current?.animate()
  }, [])

  const login = () => {
    signIn()
    router.replace("/")

    setAuthPassword("")
    setAuthEmail("")
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
    <Screen disableKeyboardAvoidingView preset="fixed" backgroundColor={colors.background}>
      <View style={StyleSheet.absoluteFill}>
        <View style={themed($topDividerView)} />
        <WaveDivider color={colors.background} />
        <View style={themed($bottomDividerView)} />
      </View>

      <AnimatedSvgIcon
        containerStyle={[themed($logoIconContainer)]}
        ref={LogoIconRef}
        pathData={SvgIconPaths.LOGO_FULFILLED}
        color={colors.textReversed}
        size={128}
        slow
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <View style={themed($formContainer)}>
          <TextField
            value={authEmail}
            onChangeText={setAuthEmail}
            containerStyle={themed($textField)}
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            keyboardType="email-address"
            placeholderTx="loginScreen:emailFieldPlaceholder"
          />

          <TextField
            ref={authPasswordInput}
            value={authPassword}
            onChangeText={setAuthPassword}
            containerStyle={themed($textField)}
            autoCapitalize="none"
            autoComplete="password"
            autoCorrect={false}
            secureTextEntry={isAuthPasswordHidden}
            placeholderTx="loginScreen:passwordFieldPlaceholder"
            onSubmitEditing={login}
            RightAccessory={PasswordRightAccessory}
          />

          <Button
            testID="login-button"
            tx="loginScreen:tapToLogIn"
            style={themed($tapButton)}
            onPress={login}
          />

          <View style={themed($forgotPasswordContainer)}>
            <Text tx="loginScreen:dontHaveAnAccount" />
            <Pressable onPress={login}>
              <Text tx="loginScreen:signUp" preset="bold" style={themed($signUpText)} />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  )
}

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

const $formContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  height: "100%",
  top: "52%",
  marginHorizontal: spacing.lg,
})

const $textField: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.sm,
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
