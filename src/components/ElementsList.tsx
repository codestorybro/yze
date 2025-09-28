import React, { ReactNode } from "react"
import { View, StyleSheet, ViewStyle, Pressable } from "react-native"
import { Card, SvgIcon } from "@/components"
import { ThemedStyle } from "@/theme/types"
import { useAppTheme } from "@/theme/context"
import Animated, { FadeInUp, useSharedValue } from "react-native-reanimated"
import { scheduleOnRN } from "react-native-worklets"
import { SvgIconPaths } from "./SvgIcon/svgsPaths"

type SingleElementProps = {
  svgIconPath: keyof typeof SvgIconPaths
  onPress?: () => void
  content: ReactNode
  isLastElement?: boolean
  onFinish?: (() => void) | null
  index: number
}

const _stagger = 150
const _iconSize = 32
const _gap = 12

const ElementsItem: React.FC<SingleElementProps> = ({
  svgIconPath,
  content,
  isLastElement,
  onPress,
  index,
  onFinish,
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
        <Animated.View
          style={styles.row}
          entering={FadeInUp.delay(_stagger * index)
            .springify()
            .damping(80)
            .stiffness(200)
            .withCallback((finished) => {
              if (finished && onFinish) {
                scheduleOnRN(onFinish)
              }
            })}
        >
          <View style={styles.iconWrapper}>
            <SvgIcon pathData={SvgIconPaths[svgIconPath]} size={_iconSize} />
          </View>
          <View style={styles.contentWrapper}>{content}</View>
        </Animated.View>

        {!isLastElement && (
          <View style={styles.separatorContainer}>
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
    content: ReactNode
    onPress?: () => void
  }[]
}

export const ElementsList: React.FC<Props> = ({ items }) => {
  const _anim = useSharedValue(0)

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
              onFinish={
                i === items.length - 1
                  ? () => {
                      _anim.value = 1
                    }
                  : null
              }
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
  iconWrapper: {
    width: 32,
    alignItems: "flex-start",
    justifyContent: "center",
    marginRight: _gap,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: "center",
  },
  separatorContainer: {
    flexDirection: "row",
    marginLeft: _iconSize + _gap + 16,
  },
})
