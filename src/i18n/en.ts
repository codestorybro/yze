const en = {
  common: {
    logOut: "Log out",
    confirm: "Confirm",
  },
  loginScreen: {
    emailFieldPlaceholder: "Email",
    passwordFieldPlaceholder: "Password",
    login: "Login",
    dontHaveAnAccount: "Don't have an account? ",
    signUp: "Sign up",
    theSocialMirror: "The Social Mirror",
    emailRequired: "Email is required",
    passwordRequired: "Password is required",
    emailInvalid: "Please enter a valid email address",
    passwordTooShort: "Password must be at least 8 characters long.",
    passwordTooLong: "Password must be at most 128 characters long.",
    emailTooLong: "Email must be at most 254 characters long.",
  },
  search: {
    whoToAppreciate: "Who do you want to appreciate today?",
    noResults: "No Results",
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
  settingsScreen: {
    darkMode: "Dark mode",
    selectGroup: "Select group",
    userSettings: "User Settings",
    manageGroup: "Manage Group",
  },
  attributes: {
    detailsPlaceholder: "Detailed information about the {{attributeName}} attribute goes here.",
  },
}

export default en
export type Translations = typeof en
