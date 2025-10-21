import { useEffect, useMemo, useState } from "react"
import { StyleSheet, View } from "react-native"
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated"
import { useTranslation } from "react-i18next"

import { Text } from "./Text"
import { SvgIcon } from "./SvgIcon"
import { SvgIconPaths } from "./SvgIcon/svgsPaths"
import { SkeletonImage } from "./SkeletonImage"
import { Comment } from "./Comment"
import { createAttributeDetailsKey, useAttributes } from "@/store/attributes"
import { useAppTheme } from "@/theme/context"
import type { ArchetypeKey } from "@/types/archetype"
import type { AttributeTraitType } from "@/types/attributeType"

type Props = {
  archetypeId: ArchetypeKey
  archetypeLabel: string
  accentColor: string
  rangeLabel: string
}

type TraitProgressProps = {
  trait: AttributeTraitType
  maxScore: number
  accentColor: string
  scoreSuffix: string
}

function TraitProgressSkeleton() {
  const {
    theme: { colors, spacing },
  } = useAppTheme()

  return (
    <View style={[styles.traitContainer, { gap: spacing.xs }]}>
      <View style={styles.traitHeader}>
        <SkeletonImage size={80} width={80} height={16} style={{ borderRadius: 4 }} />
        <SkeletonImage size={40} width={40} height={16} style={{ borderRadius: 4 }} />
      </View>
      <View
        style={[
          styles.traitBarBackground,
          { borderRadius: spacing.sm, backgroundColor: colors.separator },
        ]}
      >
        <SkeletonImage size={120} width={120} height={12} style={{ borderRadius: spacing.sm }} />
      </View>
    </View>
  )
}

const archetypeIconMap: Record<ArchetypeKey, keyof typeof SvgIconPaths> = {
  buddy: "buddy",
  flow: "flow",
  guru: "guru",
  rise: "rise",
}

function TraitProgress({ trait, maxScore, accentColor, scoreSuffix }: TraitProgressProps) {
  const {
    theme: { colors, spacing },
  } = useAppTheme()
  const [maxWidth, setMaxWidth] = useState(0)
  const animatedWidth = useSharedValue(0)

  const targetWidth = useMemo(() => {
    if (!maxScore || !maxWidth) return 0
    const ratio = trait.score / maxScore
    return Math.max(0, ratio * maxWidth)
  }, [maxScore, maxWidth, trait.score])

  useEffect(() => {
    animatedWidth.value = withSpring(targetWidth, {
      damping: 80,
      stiffness: 220,
    })
  }, [animatedWidth, targetWidth])

  const animatedStyle = useAnimatedStyle(() => ({
    width: animatedWidth.value,
  }))

  return (
    <View style={[styles.traitContainer, { gap: spacing.xs }]}>
      <View style={styles.traitHeader}>
        <Text text={trait.label} style={[styles.traitLabel, { color: colors.text }]} />
        <Text
          text={`${trait.score} ${scoreSuffix}`.trim()}
          style={[styles.traitValue, { color: colors.textDim }]}
        />
      </View>
      <View
        style={[
          styles.traitBarBackground,
          { borderRadius: spacing.sm, backgroundColor: colors.separator },
        ]}
        onLayout={(event) => setMaxWidth(event.nativeEvent.layout.width)}
      >
        <Animated.View
          style={[
            styles.traitBarFill,
            {
              backgroundColor: accentColor,
              borderRadius: spacing.sm,
            },
            animatedStyle,
          ]}
        />
      </View>
    </View>
  )
}

export function AttributeDetailsSheet({
  archetypeId,
  archetypeLabel,
  accentColor,
  rangeLabel,
}: Props) {
  const { t, i18n } = useTranslation()
  const {
    currentOffset,
    currentView,
    attributeDetails,
    attributeDetailsLoading,
    fetchAttributeDetails,
    attributeComments,
    attributeCommentsLoading,
    fetchAttributeComments,
  } = useAttributes()
  const {
    theme: { colors, spacing },
  } = useAppTheme()
  const [error, setError] = useState<string | null>(null)

  const detailKey = useMemo(
    () => createAttributeDetailsKey(currentView, currentOffset, archetypeId),
    [archetypeId, currentOffset, currentView],
  )

  const detail = attributeDetails[detailKey]
  const isLoading = attributeDetailsLoading[detailKey] ?? false

  const comments = attributeComments[detailKey]
  const isCommentsLoading = attributeCommentsLoading[detailKey] ?? false

  useEffect(() => {
    setError(null)
  }, [detailKey])

  useEffect(() => {
    let isMounted = true
    if (detail || isLoading) {
      return
    }

    const loadDetails = async () => {
      try {
        const result = await fetchAttributeDetails({
          archetypeId,
          view: currentView,
          offset: currentOffset,
          lang: i18n.language?.split("-")[0] ?? "en",
        })

        if (!isMounted && !result) return
        if (isMounted && !result) {
          setError(t("attributes:details.error"))
        }
      } catch (err) {
        if (isMounted) {
          setError(t("attributes:details.error"))
        }
      }
    }

    void loadDetails()

    return () => {
      isMounted = false
    }
  }, [archetypeId, currentOffset, currentView, detail, fetchAttributeDetails, isLoading, t])

  useEffect(() => {
    let isMounted = true
    if (comments || isCommentsLoading) {
      return
    }

    const loadComments = async () => {
      try {
        await fetchAttributeComments({
          archetypeId,
          view: currentView,
          offset: currentOffset,
          lang: i18n.language?.split("-")[0] ?? "en",
        })
      } catch (err) {
        console.warn("Failed to load comments:", err)
      }
    }

    void loadComments()

    return () => {
      isMounted = false
    }
  }, [archetypeId, currentOffset, currentView, comments, fetchAttributeComments, isCommentsLoading])

  const maxTraitScore = useMemo(() => {
    if (!detail || detail.traits.length === 0) return 1
    const scores = detail.traits.map((trait) => trait.score)
    const maxScore = Math.max(...scores)
    return maxScore <= 0 ? 1 : maxScore
  }, [detail])

  const iconPath = SvgIconPaths[archetypeIconMap[archetypeId]]
  const scoreSuffix = t("attributes:details.traitScoreSuffix")

  return (
    <View style={[styles.container, { gap: spacing.md }]}>
      <View style={[styles.header, { borderColor: accentColor, borderRadius: spacing.md }]}>
        <View
          style={[
            styles.headerIcon,
            { backgroundColor: `${accentColor}20`, borderRadius: spacing.lg },
          ]}
        >
          <SvgIcon pathData={iconPath} size={40} color={accentColor} />
        </View>
        <View style={[styles.headerText, { gap: spacing.xxs }]}>
          <Text
            text={t("attributes:details.heading", { label: archetypeLabel })}
            weight="bold"
            size="lg"
            style={{ color: accentColor }}
          />
          <Text text={rangeLabel} preset="subheading" style={{ color: colors.text }} />
          <Text
            text={`${t("attributes:details.totalScoreLabel")}: ${detail?.totalScore ?? "–"}`}
            weight="medium"
            style={{ color: colors.text }}
          />
        </View>
      </View>

      {error ? <Text text={error ?? ""} style={{ color: colors.error }} /> : null}

      {!detail && !error ? (
        <View style={{ gap: spacing.sm }}>
          {Array.from({ length: 5 }).map((_, index) => (
            <TraitProgressSkeleton key={index} />
          ))}
        </View>
      ) : null}

      {detail && !error ? (
        <View style={{ gap: spacing.sm }}>
          {detail.traits.map((trait) => (
            <TraitProgress
              key={trait.id}
              trait={trait}
              maxScore={maxTraitScore}
              accentColor={accentColor}
              scoreSuffix={scoreSuffix}
            />
          ))}
        </View>
      ) : null}

      {/* Comments Section */}
      {detail && !error ? (
        <View style={{ gap: spacing.sm }}>
          <Text
            text={t("attributes:comments.heading")}
            weight="bold"
            size="lg"
            style={{ color: colors.text }}
          />

          {isCommentsLoading ? (
            <View style={{ gap: spacing.xs }}>
              {Array.from({ length: 3 }).map((_, index) => (
                <View key={index} style={[styles.commentSkeleton, { gap: spacing.xs }]}>
                  <SkeletonImage size={60} width={60} height={12} style={{ borderRadius: 4 }} />
                  <SkeletonImage size={200} width={200} height={16} style={{ borderRadius: 4 }} />
                </View>
              ))}
            </View>
          ) : null}

          {comments && comments.comments.length > 0 ? (
            <View style={{ gap: spacing.xs }}>
              {comments.comments.map((comment) => (
                <Comment key={comment.id} comment={comment} />
              ))}
            </View>
          ) : null}

          {comments && comments.comments.length === 0 && !isCommentsLoading ? (
            <Text
              text={t("attributes:comments.noComments")}
              style={{ color: colors.textDim, fontStyle: "italic" }}
            />
          ) : null}
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderWidth: 1,
  },
  headerIcon: {
    padding: 12,
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  traitContainer: {
    flexDirection: "column",
  },
  traitHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  traitLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  traitValue: {
    fontSize: 14,
  },
  traitBarBackground: {
    height: 12,
    overflow: "hidden",
  },
  traitBarFill: {
    height: 12,
  },
  commentSkeleton: {
    padding: 12,
  },
})
