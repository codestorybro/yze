import { SvgIconPaths } from "@/components/SvgIcon/svgsPaths"
import { useAppTheme } from "@/theme/context"

export const useAttributeColorAndIcon = (attributeId?: string) => {
  const {
    theme: { colors },
  } = useAppTheme()
  const {
    attributeBuddy,
    attributeCreator,
    attributeFlash,
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
    case "creator":
      color = attributeCreator
      icon = SvgIconPaths.creator
      break
    case "flash":
      color = attributeFlash
      icon = SvgIconPaths.flash
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
