const en = {
  common: {
    logOut: "Log out",
    confirm: "Confirm",
    cancel: "Cancel",
    close: "Close",
    submit: "Submit",
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
  settingsScreen: {
    title: "Settings",
    account: "Account",
    email: "Email",
    name: "Name",
    notSet: "Not set",
    appearance: "Appearance",
    darkMode: "Dark Mode",
    language: "Language",
    logOutConfirmTitle: "Log out",
    logOutConfirmMessage: "Are you sure you want to log out?",
  },
  homeScreen: {
    tapToRate: "Tap {{name}}'s avatar to rate your day",
    howWasYourDay: "How was your day with {{name}}?",
    rateYourDay: "Rate your day together",
    addComment: "Add a comment (optional)",
    commentPlaceholder: "How did you feel today?",
    noRating: "No rating for this day",
    noRatingSubtext: "{{name}} hasn't rated this day yet",
    moods: {
      happy: "Happy",
      loving: "Loving",
      average: "Average",
      bored: "Bored",
      sad: "Sad",
      angry: "Angry",
    },
    feltMood: "{{name}} felt {{mood}}",
    comment: "Comment",
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
}

export default en
export type Translations = typeof en
