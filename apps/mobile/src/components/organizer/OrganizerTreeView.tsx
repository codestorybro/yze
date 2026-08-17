import {
  useCallback,
  useEffect,
  forwardRef,
  useMemo,
  useRef,
  useState,
  type ReactElement,
} from "react"
import type {
  FlatList,
  FlatListProps,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControlProps,
  StyleProp,
  TextStyle,
  ViewStyle,
} from "react-native"
import { Pressable, View } from "react-native"
import { SymbolView } from "expo-symbols"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import Animated, {
  FadeInDown,
  FadeOut,
  LinearTransition,
  ReduceMotion,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated"

import { BrandMark } from "@/components/BrandMark"
import { SheetList } from "@/components/navigation/SheetContent"
import { ItemIcon } from "@/components/organizer/ItemIcon"
import { ListScreen } from "@/components/organizer/ListScreen"
import { Text } from "@/components/Text"
import {
  canDropTreeEntity,
  createExpandedTree,
  flattenOrganizerTree,
  type OrganizerTreeEntity,
  type OrganizerTreeRow,
} from "@/features/organizer/organizerTree"
import type { OrganizerTree } from "@/services/api/types"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

interface OrganizerTreeViewProps {
  ListHeaderComponent?: FlatListProps<OrganizerTreeRow>["ListHeaderComponent"]
  contentContainerStyle?: StyleProp<ViewStyle>
  draggingDisabled?: boolean
  floatingFooter?: ReactElement
  onMove?: (entity: OrganizerTreeEntity, destinationId: string) => void
  onOpenItem?: (itemId: string) => void
  onOpenPlace?: (placeId: string) => void
  onRequestMove?: (entity: OrganizerTreeEntity) => void
  onSelect?: (row: OrganizerTreeRow) => void
  refreshControl?: ReactElement<RefreshControlProps>
  scrollEnabled?: boolean
  surface?: "screen" | "sheet"
  selectedId?: string | null
  selectionAllowed?: (row: OrganizerTreeRow) => boolean
  tree: OrganizerTree
}

interface TargetRect {
  bottom: number
  top: number
}

const AUTO_SCROLL_EDGE = 72
const AUTO_SCROLL_STEP = 18

export function OrganizerTreeView({
  ListHeaderComponent,
  contentContainerStyle,
  draggingDisabled = false,
  floatingFooter,
  onMove,
  onOpenItem,
  onOpenPlace,
  onRequestMove,
  onSelect,
  refreshControl,
  scrollEnabled = true,
  surface = "screen",
  selectedId,
  selectionAllowed = () => true,
  tree,
}: OrganizerTreeViewProps) {
  const { themed } = useAppTheme()
  const listRef = useRef<FlatList<OrganizerTreeRow>>(null)
  const rowRefs = useRef(new Map<string, View>())
  const targetRects = useRef(new Map<string, TargetRect>())
  const measuredScrollOffset = useRef(0)
  const scrollOffset = useRef(0)
  const viewport = useRef<TargetRect | null>(null)
  const contentHeight = useRef(0)
  const draggingEntity = useRef<OrganizerTreeEntity | null>(null)
  const pointerY = useRef<number | null>(null)
  const hoveredIdRef = useRef<string | null>(null)
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const measurementGeneration = useRef(0)
  const measurementFrame = useRef<number | null>(null)
  const autoScrollFrame = useRef<number | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [expandedIds, setExpandedIds] = useState(() => createExpandedTree(tree))
  const knownPlaces = useRef(new Set(tree.places.map((place) => place.id)))
  const rows = useMemo(() => flattenOrganizerTree(tree, expandedIds), [expandedIds, tree])

  useEffect(() => {
    const additions = tree.places.filter((place) => !knownPlaces.current.has(place.id))
    if (additions.length > 0) {
      setExpandedIds((current) => new Set([...current, ...additions.map((place) => place.id)]))
    }
    knownPlaces.current = new Set(tree.places.map((place) => place.id))
  }, [tree.places])

  const toggleExpanded = useCallback((id: string) => {
    setExpandedIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const measureTargets = useCallback(
    (entity: OrganizerTreeEntity) => {
      const generation = ++measurementGeneration.current
      targetRects.current.clear()
      measuredScrollOffset.current = scrollOffset.current
      viewport.current = null
      const isCurrent = () =>
        generation === measurementGeneration.current &&
        draggingEntity.current?.id === entity.id &&
        draggingEntity.current.kind === entity.kind
      const nativeList = listRef.current?.getNativeScrollRef() as View | undefined
      nativeList?.measureInWindow((_x, y, _width, height) => {
        if (!isCurrent()) return
        viewport.current = { top: y, bottom: y + height }
      })
      for (const row of rows) {
        if (row.kind === "item" || !canDropTreeEntity(tree, entity, row.id)) continue
        rowRefs.current.get(row.id)?.measureInWindow((_x, y, _width, height) => {
          if (!isCurrent()) return
          targetRects.current.set(row.id, { top: y, bottom: y + height })
        })
      }
    },
    [rows, tree],
  )

  const scheduleMeasurement = useCallback(() => {
    if (!draggingEntity.current || measurementFrame.current !== null) return
    measurementFrame.current = requestAnimationFrame(() => {
      measurementFrame.current = null
      const entity = draggingEntity.current
      if (entity) measureTargets(entity)
    })
  }, [measureTargets])

  const destinationAt = useCallback((absoluteY: number) => {
    const scrollDelta = scrollOffset.current - measuredScrollOffset.current
    for (const [id, rect] of targetRects.current) {
      const top = rect.top - scrollDelta
      const bottom = rect.bottom - scrollDelta
      if (absoluteY >= top && absoluteY <= bottom) return id
    }
    return null
  }, [])

  const setHoverDestination = useCallback(
    (destinationId: string | null) => {
      if (hoveredIdRef.current === destinationId) return
      if (hoverTimer.current) {
        clearTimeout(hoverTimer.current)
        hoverTimer.current = null
      }
      hoveredIdRef.current = destinationId
      setHoveredId(destinationId)

      const destination = rows.find((row) => row.id === destinationId)
      if (destination?.kind === "place" && destination.expandable && !destination.expanded) {
        hoverTimer.current = setTimeout(() => {
          hoverTimer.current = null
          if (hoveredIdRef.current === destination.id) toggleExpanded(destination.id)
        }, 480)
      }
    },
    [rows, toggleExpanded],
  )

  const stopAutoScroll = useCallback(() => {
    if (autoScrollFrame.current !== null) {
      cancelAnimationFrame(autoScrollFrame.current)
      autoScrollFrame.current = null
    }
  }, [])

  const startAutoScroll = useCallback(() => {
    if (autoScrollFrame.current !== null) return

    const tick = () => {
      autoScrollFrame.current = null
      const absoluteY = pointerY.current
      const bounds = viewport.current
      if (!draggingEntity.current || absoluteY === null || !bounds) return

      const delta =
        absoluteY < bounds.top + AUTO_SCROLL_EDGE
          ? -AUTO_SCROLL_STEP
          : absoluteY > bounds.bottom - AUTO_SCROLL_EDGE
            ? AUTO_SCROLL_STEP
            : 0
      if (delta === 0) return

      const viewportHeight = bounds.bottom - bounds.top
      const maxOffset = Math.max(0, contentHeight.current - viewportHeight)
      const nextOffset = Math.min(maxOffset, Math.max(0, scrollOffset.current + delta))
      if (nextOffset === scrollOffset.current) return

      scrollOffset.current = nextOffset
      listRef.current?.scrollToOffset({ animated: false, offset: nextOffset })
      setHoverDestination(destinationAt(absoluteY))
      scheduleMeasurement()
      autoScrollFrame.current = requestAnimationFrame(tick)
    }

    autoScrollFrame.current = requestAnimationFrame(tick)
  }, [destinationAt, scheduleMeasurement, setHoverDestination])

  const updateHover = useCallback(
    (absoluteY: number) => {
      pointerY.current = absoluteY
      setHoverDestination(destinationAt(absoluteY))
      startAutoScroll()
    },
    [destinationAt, setHoverDestination, startAutoScroll],
  )

  const beginDrag = useCallback(
    (entity: OrganizerTreeEntity) => {
      draggingEntity.current = entity
      pointerY.current = null
      setHoverDestination(null)
      setDraggingId(entity.id)
      measureTargets(entity)
    },
    [measureTargets, setHoverDestination],
  )

  const finishDrag = useCallback(
    (absoluteY: number) => {
      const entity = draggingEntity.current
      const destinationId = destinationAt(absoluteY)
      ++measurementGeneration.current
      draggingEntity.current = null
      pointerY.current = null
      stopAutoScroll()
      setDraggingId(null)
      setHoverDestination(null)
      targetRects.current.clear()
      if (entity && destinationId) onMove?.(entity, destinationId)
    },
    [destinationAt, onMove, setHoverDestination, stopAutoScroll],
  )

  const cancelDrag = useCallback(() => {
    ++measurementGeneration.current
    draggingEntity.current = null
    pointerY.current = null
    stopAutoScroll()
    setDraggingId(null)
    setHoverDestination(null)
    targetRects.current.clear()
  }, [setHoverDestination, stopAutoScroll])

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollOffset.current = event.nativeEvent.contentOffset.y
    if (draggingEntity.current) scheduleMeasurement()
  }

  useEffect(() => {
    if (draggingEntity.current) scheduleMeasurement()
  }, [rows, scheduleMeasurement])

  useEffect(
    () => () => {
      ++measurementGeneration.current
      if (hoverTimer.current) clearTimeout(hoverTimer.current)
      if (measurementFrame.current !== null) cancelAnimationFrame(measurementFrame.current)
      stopAutoScroll()
    },
    [stopAutoScroll],
  )

  const listProps = {
    data: rows,
    keyExtractor: (row: OrganizerTreeRow) => `${row.kind}:${row.id}`,
    contentContainerStyle: [themed($list), contentContainerStyle],
    ListHeaderComponent,
    ListFooterComponent: floatingFooter ? <View style={$floatingFooterClearance} /> : undefined,
    onContentSizeChange: (_width: number, height: number) => {
      contentHeight.current = height
    },
    onScroll: handleScroll,
    removeClippedSubviews: false,
    refreshControl,
    scrollEnabled: scrollEnabled && !draggingId,
    scrollEventThrottle: 16,
    renderItem: ({ item, index }: { item: OrganizerTreeRow; index: number }) => (
      <OrganizerTreeRowView
        ref={(node) => {
          if (node) rowRefs.current.set(item.id, node)
          else rowRefs.current.delete(item.id)
        }}
        draggable={Boolean(onMove) && !draggingDisabled && item.kind !== "root"}
        hovered={hoveredId === item.id}
        index={index}
        onCancelDrag={cancelDrag}
        onDrag={updateHover}
        onDragStart={beginDrag}
        onDrop={finishDrag}
        onOpen={() => {
          if (onSelect && (item.kind === "root" || item.kind === "place")) {
            if (selectionAllowed(item)) onSelect(item)
          } else if (item.kind === "place") onOpenPlace?.(item.id)
          else if (item.kind === "item") onOpenItem?.(item.id)
        }}
        onRequestMove={onRequestMove ? () => onRequestMove(item) : undefined}
        onToggle={() => toggleExpanded(item.id)}
        row={item}
        selected={selectedId === item.id}
        selectionDisabled={Boolean(onSelect) && !selectionAllowed(item)}
        selectionMode={Boolean(onSelect)}
      />
    ),
    showsVerticalScrollIndicator: false,
  }

  if (surface === "sheet") {
    return (
      <>
        <SheetList ref={listRef} {...listProps} />
        {floatingFooter}
      </>
    )
  }

  return <ListScreen ref={listRef} {...listProps} />
}

interface OrganizerTreeRowViewProps {
  draggable: boolean
  hovered: boolean
  index: number
  onCancelDrag: () => void
  onDrag: (absoluteY: number) => void
  onDragStart: (entity: OrganizerTreeEntity) => void
  onDrop: (absoluteY: number) => void
  onOpen: () => void
  onRequestMove?: () => void
  onToggle: () => void
  row: OrganizerTreeRow
  selected: boolean
  selectionDisabled: boolean
  selectionMode: boolean
}

// forwardRef keeps every native row measurable for drop targeting.
const OrganizerTreeRowView = forwardRef<View, OrganizerTreeRowViewProps>(
  function OrganizerTreeRowViewInner(
    {
      draggable,
      hovered,
      index,
      onCancelDrag,
      onDrag,
      onDragStart,
      onDrop,
      onOpen,
      onRequestMove,
      onToggle,
      row,
      selected,
      selectionDisabled,
      selectionMode,
    },
    ref,
  ) {
    const {
      theme: { colors },
      themed,
    } = useAppTheme()
    const translateX = useSharedValue(0)
    const translateY = useSharedValue(0)
    const active = useSharedValue(0)
    const animatedStyle = useAnimatedStyle(() => ({
      opacity: active.get() ? 0.92 : 1,
      transform: [
        { translateX: translateX.get() },
        { translateY: translateY.get() },
        { scale: active.get() ? 1.025 : 1 },
      ],
      zIndex: active.get() ? 20 : 0,
    }))
    const entity = useMemo<OrganizerTreeEntity>(
      () => ({ id: row.id, kind: row.kind }),
      [row.id, row.kind],
    )
    const pan = useMemo(
      () =>
        Gesture.Pan()
          .enabled(draggable)
          .activateAfterLongPress(220)
          .shouldCancelWhenOutside(false)
          .onStart(() => {
            active.set(1)
            runOnJS(onDragStart)(entity)
          })
          .onUpdate((event) => {
            translateX.set(event.translationX)
            translateY.set(event.translationY)
            runOnJS(onDrag)(event.absoluteY)
          })
          .onEnd((event) => {
            runOnJS(onDrop)(event.absoluteY)
          })
          .onFinalize((_event, success) => {
            active.set(0)
            translateX.set(
              withSpring(0, {
                damping: 19,
                stiffness: 260,
                reduceMotion: ReduceMotion.System,
              }),
            )
            translateY.set(
              withSpring(0, {
                damping: 19,
                stiffness: 260,
                reduceMotion: ReduceMotion.System,
              }),
            )
            if (!success) runOnJS(onCancelDrag)()
          }),
      [
        active,
        draggable,
        entity,
        onCancelDrag,
        onDrag,
        onDragStart,
        onDrop,
        translateX,
        translateY,
      ],
    )
    const directEntries =
      row.childCount === 1 ? "1 direct entry" : `${row.childCount} direct entries`
    const meta =
      row.kind === "root"
        ? `${directEntries} · fixed root`
        : row.kind === "place"
          ? directEntries
          : row.quantity === 1
            ? "Item"
            : `${row.quantity} items`

    return (
      <GestureDetector gesture={pan}>
        <Animated.View
          ref={ref}
          entering={FadeInDown.delay(Math.min(index, 8) * 28)
            .duration(220)
            .reduceMotion(ReduceMotion.System)}
          exiting={FadeOut.duration(140).reduceMotion(ReduceMotion.System)}
          layout={LinearTransition.springify().damping(19).reduceMotion(ReduceMotion.System)}
          style={themed($rowFrame)}
        >
          <Animated.View style={[$dragFrame, animatedStyle]}>
            <TreeConnectors connections={row.connections} />
            <View
              style={[
                themed($node),
                row.kind === "root" && themed($rootNode),
                row.kind === "item" && themed($itemNode),
                selected && themed($selectedNode),
                hovered && themed($hoveredNode),
                selectionDisabled && $disabled,
              ]}
            >
              <Pressable
                accessibilityActions={
                  onRequestMove && row.kind !== "root"
                    ? [
                        { name: "activate", label: "Open" },
                        { name: "move", label: "Move" },
                      ]
                    : undefined
                }
                accessibilityHint={
                  draggable
                    ? "Opens this entry. Long press and drag to move it into another Place."
                    : undefined
                }
                accessibilityLabel={`${row.name}, ${meta}, level ${row.depth + 1}`}
                accessibilityRole={selectionMode ? "radio" : "button"}
                accessibilityState={
                  selectionMode ? { checked: selected, disabled: selectionDisabled } : undefined
                }
                disabled={selectionDisabled}
                onAccessibilityAction={(event) => {
                  if (event.nativeEvent.actionName === "move") onRequestMove?.()
                  else if (event.nativeEvent.actionName === "activate") onOpen()
                }}
                onPress={onOpen}
                style={({ pressed }) => [themed($primaryAction), pressed && $pressed]}
              >
                <View
                  accessibilityElementsHidden
                  importantForAccessibility="no-hide-descendants"
                  style={themed($visual)}
                >
                  {row.kind === "root" ? (
                    <View style={themed($rootIcon)}>
                      <BrandMark />
                    </View>
                  ) : row.kind === "place" ? (
                    <View style={themed($placeIcon)}>
                      <SymbolView
                        name={{ ios: "archivebox", android: "inventory_2", web: "inventory_2" }}
                        size={22}
                        tintColor={colors.tint}
                      />
                    </View>
                  ) : (
                    <ItemIcon iconKey={row.iconKey ?? "generic-device"} size={18} />
                  )}
                </View>
                <View style={$copy}>
                  <View style={themed($titleLine)}>
                    <Text preset={row.kind === "root" ? "section" : "label"} text={row.name} />
                    {row.kind === "root" ? (
                      <View style={themed($rootBadge)}>
                        <Text preset="caption" style={themed($rootBadgeText)} text="ROOT" />
                      </View>
                    ) : null}
                  </View>
                  <Text preset="caption" style={themed($meta)} text={meta} />
                </View>
              </Pressable>

              {row.kind === "place" && row.expandable ? (
                <Pressable
                  accessibilityLabel={`${row.expanded ? "Collapse" : "Expand"} ${row.name}`}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: row.expanded }}
                  hitSlop={6}
                  onPress={onToggle}
                  style={({ pressed }) => [themed($iconButton), pressed && $pressed]}
                >
                  <SymbolView
                    name={{
                      ios: row.expanded ? "chevron.down" : "chevron.right",
                      android: row.expanded ? "expand_more" : "chevron_right",
                      web: row.expanded ? "expand_more" : "chevron_right",
                    }}
                    size={18}
                    tintColor={colors.textDim}
                  />
                </Pressable>
              ) : null}

              {draggable ? (
                <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
                  <SymbolView
                    name={{ ios: "line.3.horizontal", android: "drag_handle", web: "drag_handle" }}
                    size={20}
                    tintColor={colors.textDim}
                  />
                </View>
              ) : row.kind === "root" ? (
                <SymbolView
                  name={{ ios: "lock.fill", android: "lock", web: "lock" }}
                  size={17}
                  tintColor={colors.textDim}
                />
              ) : null}
            </View>
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    )
  },
)

function TreeConnectors({ connections }: { connections: boolean[] }) {
  const { themed } = useAppTheme()
  const visibleConnections = connections.slice(-6)
  return (
    <View accessibilityElementsHidden style={themed($connectors)}>
      {visibleConnections.map((continues, index) => {
        const current = index === visibleConnections.length - 1
        return (
          <View key={`${index}:${continues}`} style={$rail}>
            {continues || current ? (
              <View
                style={[
                  themed($verticalLine),
                  current && !continues ? $halfVerticalLine : undefined,
                ]}
              />
            ) : null}
            {current ? <View style={themed($horizontalLine)} /> : null}
          </View>
        )
      })}
    </View>
  )
}

const $list: ThemedStyle<ViewStyle> = ({ spacing }) => ({ gap: spacing.xs })
const $floatingFooterClearance: ViewStyle = { height: 112 }
const $rowFrame: ThemedStyle<ViewStyle> = () => ({
  width: "100%",
  maxWidth: 760,
  alignSelf: "center",
})
const $dragFrame: ViewStyle = { width: "100%", flexDirection: "row" }
const $connectors: ThemedStyle<ViewStyle> = () => ({ flexDirection: "row" })
const $rail: ViewStyle = { width: 20, minHeight: 68, position: "relative" }
const $verticalLine: ThemedStyle<ViewStyle> = ({ colors }) => ({
  position: "absolute",
  top: 0,
  bottom: 0,
  left: 9,
  width: 1,
  backgroundColor: colors.border,
})
const $halfVerticalLine: ViewStyle = { bottom: "50%" }
const $horizontalLine: ThemedStyle<ViewStyle> = ({ colors }) => ({
  position: "absolute",
  top: "50%",
  left: 9,
  right: 0,
  height: 1,
  backgroundColor: colors.border,
})
const $node: ThemedStyle<ViewStyle> = ({ colors, radii, spacing }) => ({
  minHeight: 68,
  flex: 1,
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.sm,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xs,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: radii.md,
  backgroundColor: colors.surface,
})
const $rootNode: ThemedStyle<ViewStyle> = ({ colors }) => ({
  minHeight: 76,
  borderColor: colors.controlBorder,
  backgroundColor: colors.surfaceRaised,
})
const $itemNode: ThemedStyle<ViewStyle> = ({ colors }) => ({
  minHeight: 62,
  borderColor: colors.separator,
  backgroundColor: colors.background,
})
const $selectedNode: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderColor: colors.tint,
  backgroundColor: colors.tintSubtle,
})
const $hoveredNode: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderWidth: 2,
  borderColor: colors.signal,
  backgroundColor: colors.tintSubtle,
})
const $rootIcon: ThemedStyle<ViewStyle> = () => ({ transform: [{ scale: 0.82 }] })
const $placeIcon: ThemedStyle<ViewStyle> = ({ colors, radii }) => ({
  width: 44,
  height: 44,
  alignItems: "center",
  justifyContent: "center",
  borderRadius: radii.md,
  backgroundColor: colors.tintSubtle,
})
const $primaryAction: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  minHeight: 44,
  flex: 1,
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.sm,
})
const $visual: ThemedStyle<ViewStyle> = () => ({ flexShrink: 0 })
const $copy: ViewStyle = { flex: 1, justifyContent: "center" }
const $titleLine: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xs,
})
const $rootBadge: ThemedStyle<ViewStyle> = ({ colors, radii, spacing }) => ({
  paddingHorizontal: spacing.xs,
  paddingVertical: 2,
  borderRadius: radii.pill,
  backgroundColor: colors.tintSubtle,
})
const $rootBadgeText: ThemedStyle<TextStyle> = ({ colors }) => ({ color: colors.tint })
const $meta: ThemedStyle<TextStyle> = ({ colors }) => ({ color: colors.textDim })
const $iconButton: ThemedStyle<ViewStyle> = ({ radii }) => ({
  width: 40,
  height: 44,
  alignItems: "center",
  justifyContent: "center",
  borderRadius: radii.pill,
})
const $pressed: ViewStyle = { opacity: 0.62 }
const $disabled: ViewStyle = { opacity: 0.42 }
