import type { SymbolViewProps } from "expo-symbols"

export interface ContextualToolbarAction {
  accessibilityLabel: string
  destructive?: boolean
  disabled?: boolean
  fallback: string
  icon: SymbolViewProps["name"]
  onPress: () => void
}

export interface ContextualToolbarProps {
  actions: ContextualToolbarAction[]
}

/** Shared scroll clearance for the native toolbar and the web fallback dock. */
export const contextualToolbarContentClearance = 96

/** Clearance for a contextual accessory displayed above the persistent native tab bar. */
export const contextualToolbarWithTabsContentClearance = contextualToolbarContentClearance
