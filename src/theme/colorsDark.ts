export const palette = {
  neutral900: "#FFFFFF",
  neutral800: "#F4F2F1",
  neutral700: "#D7CEC9",
  neutral600: "#B6ACA6",
  neutral500: "#978F8A",
  neutral400: "#564E4A",
  neutral300: "#3C3836",
  neutral200: "#191015",
  neutral100: "#000000",

  primary100: "#0D2C40",
  primary200: "#134A6B",
  primary300: "#1A72A4",
  primary400: "#1C95D8",
  primary500: "#1DA1F2",
  primary600: "#65C1FF",

  secondary100: "#331A0F",
  secondary200: "#66331A",
  secondary300: "#995029",
  secondary400: "#E67328",
  secondary500: "#FF8C42",
  secondary600: "#FFAA66",

  accent500: "#FFEED4",
  accent400: "#FFE1B2",
  accent300: "#FDD495",
  accent200: "#FBC878",
  accent100: "#FFBB50",

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
  inputBackground: "#2b2227",

  primary: palette.primary500,
  primaryPressed: palette.primary600,
  secondary: palette.secondary500,
  secondaryPressed: palette.secondary600,
} as const
