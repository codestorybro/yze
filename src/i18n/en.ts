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
  searchScreen: {
    whoToAppreciate: "Who do you want to appreciate today?",
    noResults: "No Results",
    suggestion: "Check if the text is correct, or try searching with different phrases",
    searchForUser: "Search for user",
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
    userSettings: "User Settings",
    manageGroup: "Manage Group",
  },
  homeScreen: {
    periodSelector: {
      weekly: "Weekly view",
      monthly: "Monthly view",
      yearly: "Yearly view",
      overall: "All time",
      range: {
        overall: "All time",
        weekCurrent: "Current week",
        monthCurrent: "Current month",
        yearCurrent: "Current year",
        navigatePrevious: "Go to previous period",
        navigateNext: "Go to next period",
      },
    },
    linkButton: "What are personality archetypes?",
  },
  attributes: {
    detailsPlaceholder: "Detailed information about the {{attributeName}} attribute goes here.",
  },
}

export default en
export type Translations = typeof en
