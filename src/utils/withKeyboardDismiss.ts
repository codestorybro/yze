import { Keyboard } from "react-native"

export async function withKeyboardDismiss(fn: () => void | Promise<void>) {
  Keyboard.dismiss()

  return new Promise<void>((resolve, reject) => {
    setTimeout(() => {
      try {
        const result = fn()
        if (result && typeof (result as Promise<void>).then === "function") {
          ;(result as Promise<void>).then(resolve).catch(reject)
        } else {
          resolve()
        }
      } catch (error) {
        reject(error)
      }
    }, 75)
  })
}
