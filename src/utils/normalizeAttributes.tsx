import { SingleAttribute, SvgIcon, Text } from "@/components"
import { SvgIconPaths } from "@/components/SvgIcon/svgsPaths"
import { useBottomSheet } from "@/store/bottomSheet"
import { useAppTheme } from "@/theme/context"
import { AttributeType } from "@/types/attributeType"
import { View } from "react-native"
import { useSharedValue } from "react-native-reanimated"

export const normalizeAttributes = (attributes: AttributeType[]) => {
  const {
    theme: { colors },
  } = useAppTheme()
  const _anim = useSharedValue(0)
  const maxScore = Math.max(...attributes.map((attr) => attr.score))
  const { openSheet } = useBottomSheet()

  const handleOnPress = (attributeId: string) => {
    openSheet(
      <View style={{ padding: 16 }}>
        <Text preset="heading" style={{ marginBottom: 8 }}>
          {attributeId.charAt(0).toUpperCase() + attributeId.slice(1)}
        </Text>
        <Text preset="subheading">
          Detailed information about the {attributeId} attribute goes here.
        </Text>
      </View>,
    )
  }

  return attributes.map((singleAttribute, index) => {
    const color = selectColorBasedOnAttribute(singleAttribute.id)
    return {
      svgIconPath: singleAttribute.id as keyof typeof SvgIconPaths,
      svgIconColor: color,
      content: (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
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
          <SvgIcon
            pathData={SvgIconPaths.right_arrow}
            size={16}
            color={colors.attributeArrowRight}
          />
        </View>
      ),
      onPress: () => {
        handleOnPress(singleAttribute.id)
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
    case "buddy":
      return colors.attributeBuddy
    case "creator":
      return colors.attributeCreator
    case "flash":
      return colors.attributeFlash
    case "guru":
      return colors.attributeGuru
    default:
      return colors.text
  }
}
