import { getItemIconDefinition } from "./itemIconCatalog"

test("unknown and deprecated icon keys fall back to the generic device", () => {
  expect(getItemIconDefinition("future-unknown-key").key).toBe("generic-device")
})
