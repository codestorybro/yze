import { Keyboard } from "react-native"

export const funcWithKeyboardDismiss = (func: () => void) => {
  Keyboard.dismiss()
  setTimeout(() => {
    func()
  }, 100)
}
