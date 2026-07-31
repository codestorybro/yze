import { spawn } from "node:child_process"
import { createRequire } from "node:module"
import { networkInterfaces } from "node:os"

const API_PORT = 8080
const DEVELOPMENT_COMMANDS = ["android", "info", "ios", "prebuild", "start", "web"]
const VIRTUAL_INTERFACE_PATTERN =
  /(?:awdl|bridge|docker|llw|loopback|tailscale|tap|tun|utun|vbox|veth|vmnet|vpn|zerotier)/i
const PREFERRED_INTERFACE_PATTERN = /^(?:en\d+|eth\d+|ethernet|wi-?fi|wlan\d+)$/i

function isPrivateIpv4(address) {
  const octets = address.split(".").map(Number)

  return (
    octets[0] === 10 ||
    (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) ||
    (octets[0] === 192 && octets[1] === 168)
  )
}

function findLanAddress() {
  const candidates = Object.entries(networkInterfaces()).flatMap(([interfaceName, addresses]) =>
    (addresses ?? [])
      .filter((address) => address.family === "IPv4" && !address.internal && address.address)
      .map((address) => {
        const score =
          (isPrivateIpv4(address.address) ? 100 : 0) +
          (PREFERRED_INTERFACE_PATTERN.test(interfaceName) ? 20 : 0) -
          (VIRTUAL_INTERFACE_PATTERN.test(interfaceName) ? 200 : 0)

        return { address: address.address, interfaceName, score }
      }),
  )

  return candidates.sort(
    (left, right) =>
      right.score - left.score || left.interfaceName.localeCompare(right.interfaceName),
  )[0]
}

function normalizeApiUrl(value) {
  const url = new URL(value.trim())

  if (!url.hostname || (url.protocol !== "http:" && url.protocol !== "https:")) {
    throw new Error("The API URL must use http:// or https:// and include a hostname.")
  }

  return url.toString().replace(/\/+$/, "")
}

function resolveApiUrl() {
  const override = process.env.EXPO_PUBLIC_API_URL?.trim()

  if (override) {
    return { source: "EXPO_PUBLIC_API_URL override", url: normalizeApiUrl(override) }
  }

  const lanAddress = findLanAddress()

  if (!lanAddress) {
    throw new Error(
      "No LAN IPv4 address was detected. Set EXPO_PUBLIC_API_URL explicitly and run the command again.",
    )
  }

  return {
    source: `LAN interface ${lanAddress.interfaceName}`,
    url: `http://${lanAddress.address}:${API_PORT}`,
  }
}

function getExpoArguments(command, passthroughArguments) {
  switch (command) {
    case "android":
      return ["run:android", ...passthroughArguments]
    case "ios":
      return ["run:ios", ...passthroughArguments]
    case "prebuild":
      return ["prebuild", "--clean", ...passthroughArguments]
    case "start": {
      const hasConnectionMode = passthroughArguments.some((argument) =>
        ["--lan", "--localhost", "--tunnel"].includes(argument),
      )
      return [
        "start",
        "--dev-client",
        ...(hasConnectionMode ? [] : ["--lan"]),
        ...passthroughArguments,
      ]
    }
    case "web":
      return ["start", "--web", ...passthroughArguments]
    case "info":
      return []
  }
}

const requestedCommand = process.argv[2]

if (!DEVELOPMENT_COMMANDS.includes(requestedCommand)) {
  throw new Error(`Unknown development command: ${requestedCommand ?? "(missing)"}`)
}

const passthroughArguments = process.argv.slice(3).filter((argument) => argument !== "--")
const api = resolveApiUrl()

console.log("Gear Organizer development environment")
console.log(`API URL: ${api.url} (${api.source})`)

if (requestedCommand !== "info") {
  const require = createRequire(import.meta.url)
  const expoCliPath = require.resolve("expo/bin/cli")
  const child = spawn(
    process.execPath,
    [expoCliPath, ...getExpoArguments(requestedCommand, passthroughArguments)],
    {
      env: {
        ...process.env,
        APP_VARIANT: "development",
        EXPO_PUBLIC_API_URL: api.url,
      },
      stdio: "inherit",
    },
  )

  child.on("error", (error) => {
    console.error(`Unable to start Expo: ${error.message}`)
    process.exitCode = 1
  })

  child.on("exit", (code) => {
    process.exitCode = code ?? 1
  })
}
