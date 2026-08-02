import type { SymbolViewProps } from "expo-symbols"

export const itemIconKeys = [
  "computer",
  "laptop",
  "monitor",
  "smartphone",
  "tablet",
  "keyboard",
  "mouse",
  "headphones",
  "speaker",
  "microphone",
  "camera",
  "game-controller",
  "console",
  "cable",
  "charger",
  "adapter",
  "battery",
  "storage-drive",
  "router",
  "smartwatch",
  "book",
  "tools",
  "box",
  "generic-device",
] as const

export type ItemIconKey = (typeof itemIconKeys)[number]

export interface ItemIconDefinition {
  key: ItemIconKey
  label: string
  symbol: SymbolViewProps["name"]
}

export const itemIconCatalog: ItemIconDefinition[] = [
  icon("computer", "Computer", "desktopcomputer", "desktop_windows"),
  icon("laptop", "Laptop", "laptopcomputer", "laptop"),
  icon("monitor", "Monitor", "display", "monitor"),
  icon("smartphone", "Smartphone", "iphone", "smartphone"),
  icon("tablet", "Tablet", "ipad", "tablet"),
  icon("keyboard", "Keyboard", "keyboard", "keyboard"),
  icon("mouse", "Mouse", "computermouse", "mouse"),
  icon("headphones", "Headphones", "headphones", "headphones"),
  icon("speaker", "Speaker", "hifispeaker", "speaker"),
  icon("microphone", "Microphone", "mic", "mic"),
  icon("camera", "Camera", "camera", "photo_camera"),
  icon("game-controller", "Game controller", "gamecontroller", "sports_esports"),
  icon("console", "Console", "arcade.stick.console", "videogame_asset"),
  icon("cable", "Cable", "cable.connector", "cable"),
  icon("charger", "Charger", "powerplug", "power"),
  icon("adapter", "Adapter", "poweroutlet.type.b", "electrical_services"),
  icon("battery", "Battery", "battery.100percent", "battery_full"),
  icon("storage-drive", "Storage drive", "externaldrive", "hard_drive"),
  icon("router", "Router", "wifi.router", "router"),
  icon("smartwatch", "Smartwatch", "applewatch", "watch"),
  icon("book", "Book", "book.closed", "menu_book"),
  icon("tools", "Tools", "wrench.and.screwdriver", "construction"),
  icon("box", "Box", "shippingbox", "inventory_2"),
  icon("generic-device", "Other device", "sensor", "devices_other"),
]

const fallbackIcon = itemIconCatalog[itemIconCatalog.length - 1]

export function getItemIconDefinition(key: string) {
  return itemIconCatalog.find((item) => item.key === key) ?? fallbackIcon
}

function icon(key: ItemIconKey, label: string, ios: string, android: string): ItemIconDefinition {
  return {
    key,
    label,
    symbol: { ios, android, web: android } as SymbolViewProps["name"],
  }
}
