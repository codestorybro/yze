import { Text } from "@/components"
import { SvgIconPaths } from "@/components/SvgIcon/svgsPaths"
import { AttributeType } from "@/types/attributeType"

export const normalizeAttributes = (attributes: AttributeType[]) => {
  return attributes.map((singleAttribute) => {
    return {
      svgIconPath: singleAttribute.id as keyof typeof SvgIconPaths,
      content: <Text>{singleAttribute.label}</Text>,
      onPress: () => {
        console.log(singleAttribute.id)
      },
      ...singleAttribute,
    }
  })
}
