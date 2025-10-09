import { ReactNode, useCallback, useMemo } from "react"
import { View } from "react-native"

import { SingleAttribute, SvgIcon, Text } from "@/components"
import { SvgIconPaths } from "@/components/SvgIcon/svgsPaths"
import { useBottomSheet } from "@/store/bottomSheet"
import { useAppTheme } from "@/theme/context"
import { AttributeType } from "@/types/attributeType"

export type NormalizedAttribute = AttributeType & {
  svgIconPath: keyof typeof SvgIconPaths
  svgIconColor: string
  content: ReactNode
  onPress: () => void
}

export const useNormalizeAttributes = (attributes: AttributeType[]) => {
  const {
    theme: { colors },
  } = useAppTheme()
  const { openSheet } = useBottomSheet()
  const {
    attributeArrowRight,
    attributeBuddy,
    attributeVisionary,
    attributeFlow,
    attributeGuru,
    text: textColor,
  } = colors

  const maxScore = useMemo(() => {
    if (attributes.length === 0) {
      return 0
    }

    return Math.max(...attributes.map((attr) => attr.score))
  }, [attributes])

  const handleOnPress = useCallback(
    (attribute: AttributeType) => {
      openSheet(
        <View style={{ padding: 16 }}>
          <Text preset="heading" style={{ marginBottom: 8 }}>
            {attribute.label}
          </Text>
          <Text
            preset="subheading"
            tx="attributes:detailsPlaceholder"
            txOptions={{ attributeName: attribute.id }}
          />
        </View>,
      )
    },
    [openSheet],
  )

  const selectColorBasedOnAttribute = useCallback(
    (attributeId: string) => {
      switch (attributeId) {
        case "buddy":
          return attributeBuddy
        case "visionary":
          return attributeVisionary
        case "flow":
          return attributeFlow
        case "guru":
          return attributeGuru
        default:
          return textColor
      }
    },
    [attributeBuddy, attributeVisionary, attributeFlow, attributeGuru, textColor],
  )

  return useMemo<NormalizedAttribute[]>(
    () =>
      attributes.map((singleAttribute) => {
        const color = selectColorBasedOnAttribute(singleAttribute.id)

        return {
          ...singleAttribute,
          svgIconPath: singleAttribute.id as keyof typeof SvgIconPaths,
          svgIconColor: color,
          content: (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <SingleAttribute
                color={color}
                attribute={{ ...singleAttribute }}
                maxScore={maxScore}
              />
              <SvgIcon pathData={SvgIconPaths.right_arrow} size={16} color={attributeArrowRight} />
            </View>
          ),
          onPress: () => handleOnPress(singleAttribute),
        }
      }),
    [attributeArrowRight, attributes, handleOnPress, maxScore, selectColorBasedOnAttribute],
  )
}
