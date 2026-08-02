import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"
import type { TextStyle, ViewStyle } from "react-native"
import { View } from "react-native"
import { SymbolView } from "expo-symbols"
import Animated, { FadeInUp, FadeOutUp, ReduceMotion } from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

export type ToastTone = "success" | "error" | "neutral"

interface ToastOptions {
  duration?: number
  message: string
  tone?: ToastTone
}

interface ToastEntry extends ToastOptions {
  id: number
  tone: ToastTone
}

interface ToastContextValue {
  showToast: (options: ToastOptions | string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: PropsWithChildren) {
  const {
    theme: { colors },
    themed,
  } = useAppTheme()
  const insets = useSafeAreaInsets()
  const [toast, setToast] = useState<ToastEntry | null>(null)
  const nextId = useRef(0)
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = useCallback((value: ToastOptions | string) => {
    const options = typeof value === "string" ? { message: value } : value
    if (timeout.current) clearTimeout(timeout.current)

    const entry: ToastEntry = {
      ...options,
      id: ++nextId.current,
      tone: options.tone ?? "success",
    }
    setToast(entry)
    timeout.current = setTimeout(() => setToast(null), options.duration ?? 2600)
  }, [])

  useEffect(
    () => () => {
      if (timeout.current) clearTimeout(timeout.current)
    },
    [],
  )

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <View
        pointerEvents="none"
        style={[themed($host), { paddingTop: insets.top + 8 }]}
        testID="toast-host"
      >
        {toast ? (
          <Animated.View
            accessible
            accessibilityLiveRegion={toast.tone === "error" ? "assertive" : "polite"}
            accessibilityRole="alert"
            entering={FadeInUp.duration(180).reduceMotion(ReduceMotion.System)}
            exiting={FadeOutUp.duration(140).reduceMotion(ReduceMotion.System)}
            key={toast.id}
            style={themed($toast)}
          >
            <View style={themed([$icon, toast.tone === "error" ? $errorIcon : $successIcon])}>
              <SymbolView
                name={
                  toast.tone === "error"
                    ? { ios: "exclamationmark", android: "error", web: "error" }
                    : { ios: "checkmark", android: "check", web: "check" }
                }
                size={15}
                tintColor={colors.onTint}
                type="monochrome"
              />
            </View>
            <Text numberOfLines={2} preset="label" style={themed($message)} text={toast.message} />
          </Animated.View>
        ) : null}
      </View>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error("useToast must be used within ToastProvider")
  return context
}

const $host: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  position: "absolute",
  zIndex: 1000,
  top: 0,
  right: 0,
  left: 0,
  alignItems: "center",
  paddingHorizontal: spacing.lg,
})
const $toast: ThemedStyle<ViewStyle> = ({ colors, radii, spacing }) => ({
  maxWidth: 520,
  minHeight: 48,
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.sm,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  borderWidth: 1,
  borderColor: colors.controlBorder,
  borderRadius: radii.pill,
  backgroundColor: colors.surfaceRaised,
  shadowColor: colors.overlay50,
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.16,
  shadowRadius: 18,
  elevation: 8,
})
const $icon: ThemedStyle<ViewStyle> = ({ radii }) => ({
  width: 24,
  height: 24,
  alignItems: "center",
  justifyContent: "center",
  borderRadius: radii.pill,
})
const $successIcon: ThemedStyle<ViewStyle> = ({ colors }) => ({ backgroundColor: colors.success })
const $errorIcon: ThemedStyle<ViewStyle> = ({ colors }) => ({ backgroundColor: colors.error })
const $message: ThemedStyle<TextStyle> = ({ colors }) => ({
  flexShrink: 1,
  color: colors.text,
})
