import { Keyboard } from "react-native"

export const withKeyboardDismiss = (func: () => void) => {
  Keyboard.dismiss()
  setTimeout(() => {
    func()
  }, 75)
}
