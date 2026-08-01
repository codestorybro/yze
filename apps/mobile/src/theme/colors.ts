/**
 * Yze's light palette stays deliberately quiet so equipment photography and the lime signal color
 * can carry the visual focus. Application code should prefer the semantic roles exported below.
 * The numbered palette remains available for compatibility with the Ignite primitives while they
 * migrate to semantic roles.
 */
const palette = {
  neutral100: "#FFFFFF",
  neutral200: "#F4F5F2",
  neutral300: "#E8EBE4",
  neutral400: "#D5DAD0",
  neutral500: "#A2A99E",
  neutral600: "#666B63",
  neutral700: "#393D37",
  neutral800: "#11130F",
  neutral900: "#080A07",

  primary100: "#F1FAD7",
  primary200: "#DEF6A7",
  primary300: "#C9F276",
  primary400: "#B8F05A",
  primary500: "#4F7210",
  primary600: "#3C590A",

  secondary100: "#F0F2ED",
  secondary200: "#DCE1D8",
  secondary300: "#BEC6B8",
  secondary400: "#8E9988",
  secondary500: "#66715F",

  accent100: "#F3FBDD",
  accent200: "#E5F7BC",
  accent300: "#D4F392",
  accent400: "#C6F16F",
  accent500: "#B8F05A",

  angry100: "#FEE4E2",
  angry500: "#B42318",

  overlay20: "rgba(17, 19, 15, 0.2)",
  overlay50: "rgba(17, 19, 15, 0.5)",
} as const

export const colors = {
  palette,
  transparent: "rgba(0, 0, 0, 0)",

  text: "#11130F",
  textDim: "#666B63",
  textInverse: "#F7F9F5",

  background: "#F4F5F2",
  surface: "#FFFFFF",
  surfaceMuted: "#E8EBE4",
  surfaceRaised: "#FFFFFF",
  surfaceInverse: "#11130F",

  border: "#D5DAD0",
  controlBorder: "#898F85",
  separator: "#E2E6DE",

  // The accessible interaction tint is intentionally darker than the lime brand signal on light UI.
  tint: "#4F7210",
  tintPressed: "#3C590A",
  tintSubtle: "#E5F3C7",
  tintInactive: "#868D82",
  onTint: "#FFFFFF",
  signal: "#B8F05A",
  onSignal: "#11130F",

  success: "#287A43",
  successBackground: "#E0F2E5",
  warning: "#815A00",
  warningBackground: "#FFF0C2",
  error: "#B42318",
  errorBackground: "#FEE4E2",

  overlay20: "rgba(17, 19, 15, 0.2)",
  overlay50: "rgba(17, 19, 15, 0.5)",
} as const
