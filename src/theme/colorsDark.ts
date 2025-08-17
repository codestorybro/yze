const palette = {
  neutral900: "#FFFFFF",
  neutral800: "#F4F2F1",
  neutral700: "#D7CEC9",
  neutral600: "#B6ACA6",
  neutral500: "#978F8A",
  neutral400: "#564E4A",
  neutral300: "#3C3836",
  neutral200: "#191015",
  neutral100: "#000000",

  primary100: "#1A2F6B",
  primary200: "#223E8C",
  primary300: "#2747B3",
  primary400: "#3557CC",
  primary500: "#4169E1", // Royal Blue
  primary600: "#6688FF",

  secondary100: "#134E4A",
  secondary200: "#115E59",
  secondary300: "#0F766E",
  secondary400: "#0D9488",
  secondary500: "#14B8A6", // Teal / Turquoise
  secondary600: "#2DD4BF",

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
  textDim: palette.neutral600,
  background: palette.neutral200,
  border: palette.neutral400,
  tint: palette.primary500,
  tintInactive: palette.neutral300,
  separator: palette.neutral300,
  error: palette.angry500,
  errorBackground: palette.angry100,
  inputBackground: "#FFFFFF14",

  primaryButtonBackground: palette.primary500,
  primaryButtonBackgroundPressed: palette.primary600,
  secondaryButtonBackground: palette.secondary500,
  secondaryButtonBackgroundPressed: palette.secondary600,
} as const
