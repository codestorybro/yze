const palette = {
  neutral100: "#FFFFFF",
  neutral200: "#F4F2F1",
  neutral300: "#D7CEC9",
  neutral400: "#B6ACA6",
  neutral500: "#978F8A",
  neutral600: "#564E4A",
  neutral700: "#3C3836",
  neutral800: "#191015",
  neutral900: "#000000",

  primary100: "#D6E4FF",
  primary200: "#ADC8FF",
  primary300: "#84A9FF",
  primary400: "#6690FF",
  primary500: "#4169E1", // Royal Blue
  primary600: "#2747B3",

  secondary100: "#CCFBF1",
  secondary200: "#99F6E4",
  secondary300: "#5EEAD4",
  secondary400: "#2DD4BF",
  secondary500: "#14B8A6", // Teal / Turquoise
  secondary600: "#0D9488",

  accent100: "#FFEED4",
  accent200: "#FFE1B2",
  accent300: "#FDD495",
  accent400: "#FBC878",
  accent500: "#FFBB50",

  angry100: "#F2D6CD",
  angry500: "#C03403",

  overlay20: "rgba(25, 16, 21, 0.2)",
  overlay50: "rgba(25, 16, 21, 0.5)",
} as const

export const colors = {
  palette,
  transparent: "rgba(0, 0, 0, 0)",
  text: palette.neutral800,
  textReversed: palette.neutral200,
  textDim: palette.neutral600,
  background: palette.neutral200,
  border: palette.neutral400,
  tint: palette.primary500,
  tintInactive: palette.neutral300,
  separator: palette.neutral300,
  error: palette.angry500,
  errorBackground: palette.angry100,
  inputBackground: "#e7e5e5",

  primary: palette.primary500,
  primaryPressed: palette.primary600,
  secondary: palette.secondary500,
  secondaryPressed: palette.secondary600,
} as const
