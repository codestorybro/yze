const en = {
  common: {
    ok: "OK!",
    cancel: "Cancel",
    back: "Back",
    logOut: "Log out",
    confirm: "Confirm",
  },
  welcomeScreen: {
    postscript:
      "psst  — This probably isn't what your app looks like. (Unless your designer handed you these screens, and in that case, ship it!)",
    readyForLaunch: "Your app, almost ready for launch!",
    exciting: "(ohh, this is exciting!)",
    letsGo: "Enter Yze!",
  },
  bottomNavigator: {
    homeTab: "Home",
    settingsTab: "Settings",
  },
  loginScreen: {
    logIn: "Go ahead, log in!",
    enterDetails: "Sign in to your account and collect achievements!",
    emailFieldLabel: "Email",
    passwordFieldLabel: "Password",
    emailFieldPlaceholder: "Email",
    passwordFieldPlaceholder: "Password",
    tapToLogIn: "Login",
    hint: "Hint: you can use any email address and your favorite password :)",
    dontHaveAnAccount: "Don't have an account? ",
    signUp: "Sign up",
    theSocialMirror: "The Social Mirror",
    emailRequired: "Email is required",
    passwordRequired: "Password is required",
    emailInvalid: "Please enter a valid email address",
    passwordTooShort: "Password must be at least 8 characters long.",
    passwordTooLong: "Password must be at most 128 characters long.",
    emailTooLong: "Email must be at most 254 characters long.",
    loginFailed: "Login failed. Please check your credentials and try again.",
    unknownError: "An unknown error occurred. Please try again later.",
  },
  errorScreen: {
    title: "Something went wrong!",
    friendlySubtitle:
      "This is the screen that your users will see in production when an error is thrown. You'll want to customize this message (located in `app/i18n/en.ts`) and probably the layout as well (`app/screens/ErrorScreen`). If you want to remove this entirely, check `app/app.tsx` for the <ErrorBoundary> component.",
    reset: "RESET APP",
  },
  emptyStateComponent: {
    generic: {
      heading: "So empty... so sad",
      content: "No data found yet. Try clicking the button to refresh or reload the app.",
      button: "Let's try this again",
    },
  },
  devSection: {
    reactotron: "Send to Reactotron",
    title: "Development only visible",
  },
  settingsScreen: {
    darkMode: "Dark mode",
    selectGroup: "Select group",
  },
}

export default en
export type Translations = typeof en
