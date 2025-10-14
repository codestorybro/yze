import { ReactNode, useCallback, useMemo } from "react"
import { View } from "react-native"

import { AttributeDetailsSheet, SingleAttribute, SvgIcon } from "@/components"
import { SvgIconPaths } from "@/components/SvgIcon/svgsPaths"
import { useBottomSheet } from "@/store/bottomSheet"
import { useAppTheme } from "@/theme/context"
import { ArchetypeAttribute } from "@/types/attributeType"
import type { ArchetypeKey } from "@/types/archetype"

export type NormalizedAttribute = ArchetypeAttribute & {
  svgIconPath: keyof typeof SvgIconPaths
  svgIconColor: string
  content: ReactNode
  onPress: () => void
}

export const useNormalizeAttributes = (attributes: ArchetypeAttribute[], rangeLabel: string) => {
  const {
    theme: { colors },
  } = useAppTheme()
  const { openSheet } = useBottomSheet()
  const { attributeArrowRight, attributeBuddy, attributeRise, attributeFlow, attributeGuru } =
    colors

  const archetypeColors = useMemo(
    () => ({
      buddy: attributeBuddy,
      rise: attributeRise,
      flow: attributeFlow,
      guru: attributeGuru,
    }),
    [attributeBuddy, attributeRise, attributeFlow, attributeGuru],
  )

  const archetypeIcons = useMemo(
    () =>
      ({
        buddy: "buddy",
        rise: "rise",
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
    (attribute: ArchetypeAttribute, color: string, rangeLabel: string) => {
      openSheet(
        <AttributeDetailsSheet
          archetypeId={attribute.id}
          archetypeLabel={attribute.label}
          accentColor={color}
          rangeLabel={rangeLabel}
        />,
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
          onPress: () => handleOnPress(singleAttribute, color, rangeLabel),
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
