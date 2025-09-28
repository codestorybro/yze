import { Text } from "@/components"
import { SvgIconPaths } from "@/components/SvgIcon/svgsPaths"
import { useAppTheme } from "@/theme/context"
import { AttributeType } from "@/types/attributeType"

export const normalizeAttributes = (attributes: AttributeType[]) => {
  return attributes.map((singleAttribute) => {
    return {
      svgIconPath: singleAttribute.id as keyof typeof SvgIconPaths,
      svgIconColor: selectColorBasedOnAttribute(singleAttribute.id),
      content: <Text>{singleAttribute.label}</Text>,
      onPress: () => {
        console.log(singleAttribute.id)
      },
      ...singleAttribute,
    }
  })
}

const selectColorBasedOnAttribute = (attributeId: string) => {
  const {
    theme: { colors },
  } = useAppTheme()

  switch (attributeId) {
    case "connector":
      return colors.attributeConnector
    case "creator":
      return colors.attributeCreator
    case "spark":
      return colors.attributeSpark
    case "anchor":
      return colors.attributeAnchor
    default:
      return colors.text
  }
}
