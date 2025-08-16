import { ComponentType, useEffect, useMemo, useRef, useState } from "react"
// eslint-disable-next-line no-restricted-imports
import { TextInput, ViewStyle, Image, ImageStyle, StatusBar, View, Pressable } from "react-native"
import { router } from "expo-router"

import {
  Button,
  PressableIcon,
  Screen,
  TextField,
  TextFieldAccessoryProps,
  Text,
} from "@/components"
import { AnimatedSvgIcon } from "@/components/AnimatedSvgIcon"
import { SvgIconPaths } from "@/components/AnimatedSvgIcon/svgsPaths"
import { useSession } from "@/store/ctx"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

export default function SignIn() {
  const { signIn } = useSession()
  const LogoIconRef = useRef(null)
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
            containerStyle={props.style}
            size={20}
            onPress={() => setIsAuthPasswordHidden(!isAuthPasswordHidden)}
          />
        )
      },
    [isAuthPasswordHidden, colors.palette.neutral800],
  )

  return (
    <Screen preset="fixed" safeAreaEdges={["bottom"]} backgroundColor="white">
      <StatusBar barStyle="light-content" />
      <Image
        source={require("../../assets/images/background.png")}
        style={themed($backgroundImage)}
        resizeMode="stretch"
      />

      <AnimatedSvgIcon
        containerStyle={[themed($logoIconContainer)]}
        ref={LogoIconRef}
        pathData={SvgIconPaths.LOGO}
        color={colors.text}
        size={128}
        slow
      />

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
          // helper={error}
          // status={error ? "error" : undefined}
          // onSubmitEditing={() => authPasswordInput.current?.focus()}
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
            <Text tx="loginScreen:signUp" />
          </Pressable>
        </View>
      </View>
    </Screen>
  )
}

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
  top: "50%",
  marginHorizontal: spacing.lg,
})

const $backgroundImage: ThemedStyle<ImageStyle> = () => ({
  width: "100%",
  height: "100%",
  position: "absolute",
})

const $textField: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.sm,
})

const $tapButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.md,
})
