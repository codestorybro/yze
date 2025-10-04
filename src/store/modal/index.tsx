import React, { createContext, useCallback, useContext, useState, type ReactNode } from "react"
import {
  Modal,
  ModalProps,
  Pressable,
  StyleProp,
  StyleSheet,
  TextStyle,
  View,
  ViewStyle,
} from "react-native"

import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

import { Button, Text } from "@/components"

type ModalInternalOptions = {
  animationType: NonNullable<ModalProps["animationType"]>
  presentationStyle?: ModalProps["presentationStyle"]
  transparent: boolean
  statusBarTranslucent: boolean
  backdropOpacity: number
  closeOnBackdropPress: boolean
  modalContainerStyle?: StyleProp<ViewStyle>
  contentContainerStyle?: StyleProp<ViewStyle>
  onDismiss?: () => void
  onRequestClose?: () => void
  confirmLabel: string
  cancelLabel: string
}

export type ModalOptions = Partial<Omit<ModalInternalOptions, "animationType">> & {
  animationType?: ModalProps["animationType"]
}

type ModalContent = {
  title: string
  description?: string
  onConfirmPress: () => void
}

type ModalContextType = {
  openModal: (content: ModalContent, options?: ModalOptions) => void
  closeModal: () => void
  isVisible: boolean
}

const defaultOptions: ModalInternalOptions = {
  animationType: "fade",
  presentationStyle: "overFullScreen",
  transparent: true,
  statusBarTranslucent: true,
  backdropOpacity: 0.75,
  closeOnBackdropPress: true,
  confirmLabel: "Confirm",
  cancelLabel: "Cancel",
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export function ModalProvider({ children }: { children: ReactNode }) {
  const {
    themed,
    theme: { colors },
  } = useAppTheme()
  const [visible, setVisible] = useState(false)
  const [modalContent, setModalContent] = useState<ModalContent | null>(null)
  const [options, setOptions] = useState<ModalInternalOptions>({ ...defaultOptions })

  const closeModal = useCallback(() => {
    setVisible(false)
  }, [])

  const openModal = useCallback((content: ModalContent, modalOptions?: ModalOptions) => {
    setModalContent(content)
    setOptions({ ...defaultOptions, ...modalOptions })
    setVisible(true)
  }, [])

  const handleConfirmPress = useCallback(() => {
    modalContent?.onConfirmPress()
    closeModal()
  }, [modalContent, closeModal])

  const handleDismiss = useCallback(() => {
    options.onDismiss?.()
    setModalContent(null)
    setOptions({ ...defaultOptions })
  }, [options])

  const handleRequestClose = useCallback(() => {
    options.onRequestClose?.()
    closeModal()
  }, [options, closeModal])

  const overlayStyle: StyleProp<ViewStyle> = [
    themed($overlayStyle),
    {
      backgroundColor: options.transparent
        ? `rgba(0, 0, 0, ${options.backdropOpacity})`
        : colors.background,
    },
    options.modalContainerStyle,
  ]

  const contentContainerStyle: StyleProp<ViewStyle> = [
    themed($contentContainerStyle),
    options.contentContainerStyle,
  ]

  return (
    <ModalContext.Provider value={{ openModal, closeModal, isVisible: visible }}>
      {children}

      <Modal
        animationType={options.animationType}
        transparent={options.transparent}
        presentationStyle={options.presentationStyle}
        statusBarTranslucent={options.statusBarTranslucent}
        visible={visible}
        onDismiss={handleDismiss}
        onRequestClose={handleRequestClose}
      >
        <View style={overlayStyle}>
          {options.closeOnBackdropPress && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Dismiss modal"
              style={styles.backdropPressable}
              onPress={closeModal}
            />
          )}

          <View style={styles.contentWrapper} pointerEvents="box-none">
            {modalContent && (
              <View style={contentContainerStyle}>
                <Text
                  text={modalContent.title}
                  preset="subheading"
                  style={themed($titleStyle)}
                  numberOfLines={2}
                />

                {!!modalContent.description && (
                  <Text
                    text={modalContent.description}
                    preset="default"
                    style={themed($descriptionStyle)}
                    numberOfLines={4}
                  />
                )}

                <View style={themed($buttonRowStyle)}>
                  <Button
                    preset="default"
                    style={themed($buttonStyle)}
                    text={options.confirmLabel}
                    onPress={handleConfirmPress}
                  />
                  <Button
                    preset="error"
                    style={themed($buttonStyle)}
                    text={options.cancelLabel}
                    onPress={closeModal}
                  />
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </ModalContext.Provider>
  )
}

const $overlayStyle: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  padding: spacing.lg,
})

const $contentContainerStyle: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  width: "100%",
  maxWidth: 420,
  borderRadius: spacing.lg,
  padding: spacing.lg,
  backgroundColor: colors.cardBackground,
  shadowColor: colors.justBlack,
  shadowOpacity: 0.2,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 6 },
  elevation: 3,
})

const $titleStyle: ThemedStyle<TextStyle> = ({ spacing }) => ({
  marginBottom: spacing.sm,
})

const $descriptionStyle: ThemedStyle<TextStyle> = ({ spacing, colors }) => ({
  marginBottom: spacing.md,
  color: colors.textDim,
})

const $buttonRowStyle: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "flex-end",
  gap: spacing.sm,
})

const $buttonStyle: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  minWidth: 120,
  marginTop: spacing.xs,
})

const styles = StyleSheet.create({
  backdropPressable: {
    ...StyleSheet.absoluteFillObject,
  },
  contentWrapper: {
    width: "100%",
    zIndex: 1,
  },
})

export const useModal = () => {
  const ctx = useContext(ModalContext)
  if (!ctx) throw new Error("useModal must be used within ModalProvider")
  return ctx
}
