/**
 * Dark mode uses independent semantic values rather than mechanically inverting the light palette.
 * This keeps surfaces legible and lets the lime signal remain vivid without becoming the page fill.
 */
const palette = {
  neutral100: "#151815",
  neutral200: "#0B0D0B",
  neutral300: "#232723",
  neutral400: "#343A33",
  neutral500: "#687066",
  neutral600: "#9DA49A",
  neutral700: "#C6CBC3",
  neutral800: "#F1F4EE",
  neutral900: "#FFFFFF",

  primary100: "#203009",
  primary200: "#38520C",
  primary300: "#668E21",
  primary400: "#96C744",
  primary500: "#B8F05A",
  primary600: "#D0F68F",

  secondary100: "#252A24",
  secondary200: "#3A4138",
  secondary300: "#697267",
  secondary400: "#A1AA9E",
  secondary500: "#D9DED6",

  accent100: "#203009",
  accent200: "#38520C",
  accent300: "#668E21",
  accent400: "#96C744",
  accent500: "#B8F05A",

  angry100: "#3B1D1A",
  angry500: "#FF8A80",

  overlay20: "rgba(0, 0, 0, 0.32)",
  overlay50: "rgba(0, 0, 0, 0.64)",
} as const

export const colors = {
  palette,
  transparent: "rgba(0, 0, 0, 0)",

  text: "#F1F4EE",
  textDim: "#9DA49A",
  textInverse: "#11130F",

  background: "#0B0D0B",
  surface: "#151815",
  surfaceMuted: "#232723",
  surfaceRaised: "#1B1F1B",
  surfaceInverse: "#F1F4EE",

  border: "#343A33",
  controlBorder: "#646C62",
  separator: "#252A25",

  tint: "#B8F05A",
  tintPressed: "#D0F68F",
  tintSubtle: "#263518",
  tintInactive: "#747C71",
  onTint: "#11130F",
  signal: "#B8F05A",
  onSignal: "#11130F",

  success: "#65D98A",
  successBackground: "#173421",
  warning: "#F2C15C",
  warningBackground: "#3A2C10",
  error: "#FF8A80",
  errorBackground: "#3B1D1A",

  overlay20: "rgba(0, 0, 0, 0.32)",
  overlay50: "rgba(0, 0, 0, 0.64)",
} as const
