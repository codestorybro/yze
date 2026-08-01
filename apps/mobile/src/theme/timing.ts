export const timing = {
  /** Immediate visual acknowledgement, such as a pressed state. */
  instant: 100,
  /** Small transitions between nearby control states. */
  quick: 160,
  /** Standard content and surface transitions. */
  standard: 280,
  /** Brief static handoff between the native and JavaScript launch surfaces. */
  launchHold: 60,
  /** Folding the Yze mark into its central signal point. */
  launchFold: 340,
  /** Circular reveal of the prepared application from the signal point. */
  launchReveal: 420,
} as const
