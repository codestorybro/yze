import { ReactNode, useCallback, useMemo } from "react"
import { View } from "react-native"

import { SingleAttribute, SvgIcon, Text } from "@/components"
import { SvgIconPaths } from "@/components/SvgIcon/svgsPaths"
import { useBottomSheet } from "@/store/bottomSheet"
import { useAppTheme } from "@/theme/context"
import { AttributeType } from "@/types/attributeType"
import type { ArchetypeKey } from "@/types/archetype"

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
  const { attributeArrowRight, attributeBuddy, attributeVisionary, attributeFlow, attributeGuru } =
    colors

  const archetypeColors = useMemo(
    () => ({
      buddy: attributeBuddy,
      visionary: attributeVisionary,
      flow: attributeFlow,
      guru: attributeGuru,
    }),
    [attributeBuddy, attributeVisionary, attributeFlow, attributeGuru],
  )

  const archetypeIcons = useMemo(
    () =>
      ({
        buddy: "buddy",
        visionary: "visionary",
        flow: "flow",
        guru: "guru",
      }) as const satisfies Record<ArchetypeKey, keyof typeof SvgIconPaths>,
    [],
  )

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
    (attributeId: ArchetypeKey) => archetypeColors[attributeId],
    [archetypeColors],
  )

  return useMemo<NormalizedAttribute[]>(
    () =>
      attributes.map((singleAttribute) => {
        const color = selectColorBasedOnAttribute(singleAttribute.id)
        const iconPath = archetypeIcons[singleAttribute.id]

        return {
          ...singleAttribute,
          svgIconPath: iconPath,
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
    [
      archetypeIcons,
      attributeArrowRight,
      attributes,
      handleOnPress,
      maxScore,
      selectColorBasedOnAttribute,
    ],
  )
}
