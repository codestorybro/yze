import { SvgIconPaths } from "@/components/SvgIcon/svgsPaths"
import { useAppTheme } from "@/theme/context"

export const useAttributeColorAndIcon = (attributeId?: string) => {
  const {
    theme: { colors },
  } = useAppTheme()
  const {
    attributeBuddy,
    attributeVisionary,
    attributeFlow,
    attributeGuru,
    text: textColor,
  } = colors

  let color
  let icon

  switch (attributeId) {
    case "buddy":
      color = attributeBuddy
      icon = SvgIconPaths.buddy
      break
    case "visionary":
      color = attributeVisionary
      icon = SvgIconPaths.visionary
      break
    case "flow":
      color = attributeFlow
      icon = SvgIconPaths.flow
      break
    case "guru":
      color = attributeGuru
      icon = SvgIconPaths.guru
      break
    default:
      color = textColor
  }

  return { color, icon }
}
