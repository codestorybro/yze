import { SvgIconPaths } from "@/components/SvgIcon/svgsPaths"
import { useAppTheme } from "@/theme/context"
import type { ArchetypeKey } from "@/types/archetype"

export const useAttributeColorAndIcon = (attributeId?: ArchetypeKey) => {
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

  let color: string = textColor
  let icon: string | undefined

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
  }

  return { color, icon }
}
