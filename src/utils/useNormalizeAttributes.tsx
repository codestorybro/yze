import { ReactNode, useCallback, useMemo } from "react"
import { View } from "react-native"
import { useSharedValue } from "react-native-reanimated"

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
  const anim = useSharedValue(0)
  const {
    attributeArrowRight,
    attributeBuddy,
    attributeCreator,
    attributeFlash,
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
    (attributeId: string) => {
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
    },
    [openSheet],
  )

  const selectColorBasedOnAttribute = useCallback(
    (attributeId: string) => {
      switch (attributeId) {
        case "buddy":
          return attributeBuddy
        case "creator":
          return attributeCreator
        case "flash":
          return attributeFlash
        case "guru":
          return attributeGuru
        default:
          return textColor
      }
    },
    [attributeBuddy, attributeCreator, attributeFlash, attributeGuru, textColor],
  )

  return useMemo<NormalizedAttribute[]>(
    () =>
      attributes.map((singleAttribute, index) => {
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
                index={index}
                anim={anim}
                maxScore={maxScore}
                onFinish={
                  index === attributes.length - 1
                    ? () => {
                        anim.value = 1
                      }
                    : null
                }
              />
              <SvgIcon pathData={SvgIconPaths.right_arrow} size={16} color={attributeArrowRight} />
            </View>
          ),
          onPress: () => handleOnPress(singleAttribute.id),
        }
      }),
    [anim, attributeArrowRight, attributes, handleOnPress, maxScore, selectColorBasedOnAttribute],
  )
}
