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
    archetypesSheet: {
      heading: "What are personality archetypes?",
      intro: [
        "Each of us acts differently - some energise others, others bring calm, direction, or wisdom.",
        "Yze archetypes help you understand your natural way of acting in a team and in life.",
      ],
      listHeading: "When you discover your archetype:",
      bullets: [
        "you uncover what drives you,",
        "you learn to collaborate better with others,",
        "and you balance action, relationships, and reflection with more ease.",
      ],
      closing: [
        "Understanding your archetype helps you act more consciously, consistently, and in tune with yourself.",
      ],
      archetypes: {
        flow: {
          title: "Flow",
          subtitle: "Energy that sets everything in motion",
          paragraphs: [
            "You spread enthusiasm and motivate others to act. You can create movement where others feel stuck.",
            "Just be mindful not to burn out when others cannot keep up.",
          ],
          traitsLabel: "Dominant traits",
          traits: "enthusiastic, expressive",
        },
        buddy: {
          title: "Buddy",
          subtitle: "The heart of the team",
          paragraphs: [
            "You create an atmosphere where people feel good. You know who needs support and who simply needs a chat.",
            "Remember to take care of yourself too.",
          ],
          traitsLabel: "Dominant traits",
          traits: "supportive, empathetic",
        },
        visionary: {
          title: "Visionary",
          subtitle: "A mind that sees further",
          paragraphs: [
            "You have ideas, you inspire others, and you see the direction before there is a map. You love creating, improving, and pushing things forward.",
            "Be careful not to get stuck in visions without taking action.",
          ],
          traitsLabel: "Dominant traits",
          traits: "ambitious, decisive",
        },
        guru: {
          title: "Guru",
          subtitle: "Calm and wisdom in chaos",
          paragraphs: [
            "You analyse, understand, and help others find balance. You prefer when things simply work instead of being in the spotlight.",
            "Your strength is perspective and the calm that restores order.",
          ],
          traitsLabel: "Dominant traits",
          traits: "analytical, precise",
        },
      },
    },
  },
  attributes: {
    detailsPlaceholder: "Detailed information about the {{attributeName}} attribute goes here.",
  },
}

export default en
export type Translations = typeof en
