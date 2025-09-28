import { SingleAttribute, Text } from "@/components"
import { SvgIconPaths } from "@/components/SvgIcon/svgsPaths"
import { useAppTheme } from "@/theme/context"
import { AttributeType } from "@/types/attributeType"
import { useSharedValue } from "react-native-reanimated"

export const normalizeAttributes = (attributes: AttributeType[]) => {
  const _anim = useSharedValue(0)
  const maxScore = Math.max(...attributes.map((attr) => attr.score))

  return attributes.map((singleAttribute, index) => {
    const color = selectColorBasedOnAttribute(singleAttribute.id)
    return {
      svgIconPath: singleAttribute.id as keyof typeof SvgIconPaths,
      svgIconColor: color,
      content: (
        <SingleAttribute
          color={color}
          attribute={{ ...singleAttribute }}
          index={index}
          anim={_anim}
          maxScore={maxScore}
          onFinish={
            index === attributes.length - 1
              ? () => {
                  _anim.value = 1
                }
              : null
          }
        />
      ),
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
