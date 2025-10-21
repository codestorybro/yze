import { StyleSheet, View } from "react-native"
import { useTranslation } from "react-i18next"

import { Text } from "./Text"
import { SkeletonImage } from "./SkeletonImage"
import { useAppTheme } from "@/theme/context"
import type { AttributeComment } from "@/types/attributeComment"

const userPlaceholder = require("../../assets/images/user.png")

type Props = {
  comment: AttributeComment
}

export function Comment({ comment }: Props) {
  const { t } = useTranslation()
  const {
    theme: { colors, spacing },
  } = useAppTheme()

  const authorName = comment.author.isAnonymous
    ? t("attributes:comments.anonymousAuthor")
    : comment.author.name

  const avatarSource =
    comment.author.isAnonymous || !comment.author.avatarUri
      ? userPlaceholder
      : { uri: comment.author.avatarUri }

  return (
    <View style={[styles.container, { marginBottom: spacing.sm }]}>
      <View style={[styles.avatarContainer, { marginRight: spacing.sm }]}>
        <SkeletonImage
          source={avatarSource}
          size={32}
          style={[
            styles.avatar,
            {
              borderRadius: spacing.lg,
            },
          ]}
        />
      </View>
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: colors.cardBackground,
            borderTopLeftRadius: 0,
            borderTopRightRadius: spacing.md,
            borderBottomLeftRadius: spacing.md,
            borderBottomRightRadius: spacing.md,
            padding: spacing.sm,
            borderWidth: 1,
            borderColor: colors.border,
          },
        ]}
      >
        <Text
          text={authorName}
          weight="medium"
          size="xs"
          style={[styles.authorName, { color: colors.textDim, marginBottom: spacing.xxs }]}
        />
        <Text text={comment.message} style={{ color: colors.text }} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  avatarContainer: {
    width: 32,
    height: 32,
  },
  avatar: {
    width: 32,
    height: 32,
  },
  bubble: {
    flex: 1,
    maxWidth: "85%",
  },
  authorName: {
    fontSize: 12,
  },
})
