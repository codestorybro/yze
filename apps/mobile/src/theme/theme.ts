import { colors as colorsLight } from "./colors"
import { colors as colorsDark } from "./colorsDark"
import { radii } from "./radii"
import { spacing as spacingLight } from "./spacing"
import { spacing as spacingDark } from "./spacingDark"
import { timing } from "./timing"
import type { Theme } from "./types"
import { typography } from "./typography"

// Here we define our themes.
export const lightTheme: Theme = {
  colors: colorsLight,
  radii,
  spacing: spacingLight,
  typography,
  timing,
  isDark: false,
}
export const darkTheme: Theme = {
  colors: colorsDark,
  radii,
  spacing: spacingDark,
  typography,
  timing,
  isDark: true,
}
