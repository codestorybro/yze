import { useMemo } from "react"
import { StyleSheet, View } from "react-native"
import { useTranslation } from "react-i18next"

import { Text } from "./Text"
import { SvgIcon } from "./SvgIcon"
import { SvgIconPaths } from "./SvgIcon/svgsPaths"
import { useAppTheme } from "@/theme/context"
import type { Spacing } from "@/theme/types"

type ArchetypeKey = "flow" | "buddy" | "visionary" | "guru"

type ArchetypeContent = {
  title: string
  subtitle: string
  paragraphs: string[]
  traitsLabel: string
  traits: string
}

export function ArchetypesSheetContent() {
  const { t } = useTranslation()
  const {
    theme: { colors, spacing },
  } = useAppTheme()

  const introParagraphs = t("homeScreen:archetypesSheet.intro", {
    returnObjects: true,
  }) as string[]
  const bulletItems = t("homeScreen:archetypesSheet.bullets", {
    returnObjects: true,
  }) as string[]
  const closingParagraphs = t("homeScreen:archetypesSheet.closing", {
    returnObjects: true,
  }) as string[]
  const archetypes = t("homeScreen:archetypesSheet.archetypes", {
    returnObjects: true,
  }) as Record<ArchetypeKey, ArchetypeContent>

  const styles = useMemo(() => createStyles(spacing), [spacing])

  const visuals = useMemo(
    () => ({
      flow: { color: colors.attributeFlow, icon: SvgIconPaths.flow },
      buddy: { color: colors.attributeBuddy, icon: SvgIconPaths.buddy },
      visionary: { color: colors.attributeVisionary, icon: SvgIconPaths.visionary },
      guru: { color: colors.attributeGuru, icon: SvgIconPaths.guru },
    }),
    [colors.attributeBuddy, colors.attributeFlow, colors.attributeGuru, colors.attributeVisionary],
  )

  return (
    <View style={styles.container}>
      <Text tx="homeScreen:archetypesSheet.heading" weight="bold" size="lg" />

      {introParagraphs.map((paragraph, index) => (
        <Text key={`intro-${index}`} text={paragraph} />
      ))}

      <Text tx="homeScreen:archetypesSheet.listHeading" weight="medium" />

      <View style={styles.list}>
        {bulletItems.map((item, index) => (
          <Text key={`bullet-${index}`} text={`- ${item}`} />
        ))}
      </View>

      {closingParagraphs.map((paragraph, index) => (
        <Text key={`closing-${index}`} text={paragraph} />
      ))}

      {archetypeOrder.map((key) => {
        const data = archetypes[key]
        const { color, icon } = visuals[key]

        return (
          <View key={key} style={[styles.archetypeCard, { borderColor: color }]}>
            <View style={styles.archetypeHeader}>
              <SvgIcon pathData={icon} size={48} color={color} />
              <View style={styles.archetypeHeadingText}>
                <Text text={data.title} weight="bold" style={{ color }} />
                <Text text={data.subtitle} weight="medium" />
              </View>
            </View>

            {data.paragraphs.map((paragraph, index) => (
              <Text key={`${key}-paragraph-${index}`} text={paragraph} />
            ))}

            <Text text={`${data.traitsLabel}: ${data.traits}`} weight="medium" style={{ color }} />
          </View>
        )
      })}
    </View>
  )
}

const archetypeOrder: ArchetypeKey[] = ["flow", "buddy", "visionary", "guru"]

const createStyles = (spacing: Spacing) =>
  StyleSheet.create({
    container: {
      gap: spacing.md,
    },
    list: {
      gap: spacing.xxs,
      paddingLeft: spacing.xs,
    },
    archetypeCard: {
      borderWidth: 1,
      borderRadius: spacing.md,
      padding: spacing.sm,
      gap: spacing.xs,
    },
    archetypeHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },
    archetypeHeadingText: {
      flex: 1,
      gap: spacing.xxs,
    },
  })
