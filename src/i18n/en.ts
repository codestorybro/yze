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
    selectTraitsInstruction: "What would you like to appreciate {{name}} for today?",
    commentTitle: "Add an optional comment",
    commentPlaceholder: "Add a short note here...",
    anonymousToggleLabel: "Send anonymously",
    noResults: "No Results",
    suggestion: "Check if the text is correct, or try searching with different phrases",
    searchForUser: "Search for user",
    appreciatedToday: "Appreciated today",
    cancel: "Cancel",
    back: "Back",
    next: "Next",
    appreciate: "Appreciate",
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
          subtitle: "Muscle that sets everything in motion",
          paragraphs: [
            "Flow spreads enthusiasm and motivates others to act. He can create movement where others feel stuck.",
            "Strength: an energy that inspires others to take action.",
            "Shadow side: may act impulsively or burn out when focusing only on emotions and pace.",
          ],
          traitsLabel: "Traits",
          traits: "enthusiastic, expressive",
        },
        buddy: {
          title: "Buddy",
          subtitle: "The heart of the team",
          paragraphs: [
            "Buddy creates an atmosphere where people feel good. He knows who needs support and who simply needs a chat.",
            "Strength: building connections and a positive atmosphere around you.",
            "Shadow side: may avoid confrontation and overly adapt to others at the expense of yourself.",
          ],
          traitsLabel: "Traits",
          traits: "supportive, empathetic",
        },
        rise: {
          title: "Rise",
          subtitle: "Eyes that see further",
          paragraphs: [
            "Rise has ideas, inspires others, and sees the direction before there is a map. He loves creating, improving, and pushing things forward.",
            "Strength: the ability to see direction and inspire change.",
            "Shadow side: may get lost in visions and lose touch with everyday life or details.",
          ],
          traitsLabel: "Traits",
          traits: "ambitious, decisive",
        },
        guru: {
          title: "Guru",
          subtitle: "A mind that provides balance",
          paragraphs: [
            "Guru analyses, understands, and helps others find balance. He prefers when things simply work instead of being in the spotlight.",
            "Strength: calm and wisdom that help others find balance.",
            "Shadow side: may become too detached or overly critical of others' emotions and chaos.",
          ],
          traitsLabel: "Traits",
          traits: "analytical, precise",
        },
      },
    },
  },
  attributes: {
    details: {
      heading: "{{label}} breakdown",
      totalScoreLabel: "Score",
      error: "We couldn't load the details. Try again.",
      traitScoreSuffix: "pts",
    },
    comments: {
      heading: "Feedback",
      anonymousAuthor: "Anonymous",
      error: "We couldn't load the comments. Try again.",
      noComments: "No feedback yet for this period.",
    },
  },
}

export default en
export type Translations = typeof en
