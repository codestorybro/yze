import React, { ReactNode } from "react"
import { View, StyleSheet, ViewStyle, Pressable } from "react-native"
import { Card, SvgIcon } from "@/components"
import { ThemedStyle } from "@/theme/types"
import { useAppTheme } from "@/theme/context"
import { SvgIconPaths } from "./SvgIcon/svgsPaths"

type SingleElementProps = {
  svgIconPath: keyof typeof SvgIconPaths
  onPress?: () => void
  content: ReactNode
  isLastElement?: boolean
  index: number
  svgIconColor?: string
}

const _iconSize = 32

const ElementsItem: React.FC<SingleElementProps> = ({
  svgIconPath,
  content,
  isLastElement,
  onPress,
  index,
  svgIconColor,
}) => {
  const {
    themed,
    theme: { colors, spacing },
  } = useAppTheme()

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        index === 0 && { borderTopLeftRadius: spacing.md, borderTopRightRadius: spacing.md },
        isLastElement && {
          borderBottomLeftRadius: spacing.md,
          borderBottomRightRadius: spacing.md,
        },
        pressed && { backgroundColor: colors.touchHighlight },
      ]}
    >
      <View style={styles.itemContainer}>
        <View style={styles.row}>
          <View style={themed($iconWrapper)}>
            <SvgIcon pathData={SvgIconPaths[svgIconPath]} size={_iconSize} color={svgIconColor} />
          </View>
          <View style={styles.contentWrapper}>{content}</View>
        </View>

        {!isLastElement && (
          <View style={themed($separatorContainer)}>
            <View style={themed($separatorStyle)} />
          </View>
        )}
      </View>
    </Pressable>
  )
}

type Props = {
  items: {
    id: string
    svgIconPath: keyof typeof SvgIconPaths
    svgIconColor?: string
    content: ReactNode
    onPress?: () => void
  }[]
}

export const ElementsList: React.FC<Props> = ({ items }) => {
  return (
    <Card
      style={styles.cardContainer}
      ContentComponent={
        <>
          {items.map((item, i) => (
            <ElementsItem
              key={item.id}
              isLastElement={i === items.length - 1}
              index={i}
              svgIconPath={item.svgIconPath}
              content={item.content}
              onPress={item.onPress}
              svgIconColor={item.svgIconColor}
            />
          ))}
        </>
      }
    />
  )
}

const $separatorStyle: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flex: 1,
  height: 1,
  backgroundColor: colors.separator,
  marginRight: spacing.md,
})

const $iconWrapper: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  width: spacing.xl,
  alignItems: "flex-start",
  justifyContent: "center",
  marginRight: spacing.sm,
})

const $separatorContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  marginLeft: _iconSize + spacing.sm + 16,
})

const styles = StyleSheet.create({
  cardContainer: {
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  itemContainer: {
    flexDirection: "column",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: "center",
  },
})
