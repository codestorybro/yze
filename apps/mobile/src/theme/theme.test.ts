import { colors as lightColors } from "./colors"
import { colors as darkColors } from "./colorsDark"

function relativeLuminance(hex: string) {
  const channels = hex
    .replace("#", "")
    .match(/.{2}/g)
    ?.map((channel) => Number.parseInt(channel, 16) / 255)
    .map((channel) => (channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4))

  if (!channels || channels.length !== 3) throw new Error(`Expected a six-digit hex color: ${hex}`)

  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722
}

function contrastRatio(foreground: string, background: string) {
  const lighter = Math.max(relativeLuminance(foreground), relativeLuminance(background))
  const darker = Math.min(relativeLuminance(foreground), relativeLuminance(background))

  return (lighter + 0.05) / (darker + 0.05)
}

describe("Yze color themes", () => {
  it("exposes the same semantic roles in light and dark mode", () => {
    expect(Object.keys(lightColors).sort()).toEqual(Object.keys(darkColors).sort())
    expect(Object.keys(lightColors.palette).sort()).toEqual(Object.keys(darkColors.palette).sort())
  })

  it.each([
    ["light", lightColors],
    ["dark", darkColors],
  ] as const)("keeps essential %s theme color pairs readable", (_name, colors) => {
    expect(contrastRatio(colors.text, colors.background)).toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(colors.textDim, colors.background)).toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(colors.onTint, colors.tint)).toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(colors.onSignal, colors.signal)).toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(colors.controlBorder, colors.surfaceRaised)).toBeGreaterThanOrEqual(3)
    expect(contrastRatio(colors.controlBorder, colors.background)).toBeGreaterThanOrEqual(3)
  })
})
