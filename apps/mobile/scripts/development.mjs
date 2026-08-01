import { spawn } from "node:child_process"
import { createHash } from "node:crypto"
import { existsSync } from "node:fs"
import { mkdir, readFile, rename, stat, writeFile } from "node:fs/promises"
import { createRequire } from "node:module"
import { homedir, networkInterfaces } from "node:os"
import { dirname, relative, resolve, sep } from "node:path"
import { fileURLToPath } from "node:url"

const API_PORT = 8080
const APP_VARIANT = "development"
const DEVELOPMENT_COMMANDS = ["android", "info", "ios", "prebuild", "start", "web"]
const MOBILE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const ANDROID_LOCAL_PROPERTIES_PATH = resolve(MOBILE_ROOT, "android", "local.properties")
const NATIVE_SYNC_SCHEMA_VERSION = 1
const NATIVE_PLATFORMS = ["android", "ios"]
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

function normalizeJson(value) {
  if (Array.isArray(value)) return value.map(normalizeJson)

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nestedValue]) => [key, normalizeJson(nestedValue)]),
    )
  }

  return value
}

async function isRegularFile(path) {
  try {
    return (await stat(path)).isFile()
  } catch {
    return false
  }
}

async function isDirectory(path) {
  try {
    return (await stat(path)).isDirectory()
  } catch {
    return false
  }
}

async function readOptionalFile(path) {
  try {
    return await readFile(path)
  } catch {
    return undefined
  }
}

async function restoreAndroidLocalProperties(contents) {
  if (!contents) return

  await mkdir(dirname(ANDROID_LOCAL_PROPERTIES_PATH), { recursive: true })
  await writeFile(ANDROID_LOCAL_PROPERTIES_PATH, contents)
}

function findAndroidSdkPath() {
  const defaultPaths = []

  if (process.platform === "darwin") {
    defaultPaths.push(resolve(homedir(), "Library", "Android", "sdk"))
  } else if (process.platform === "win32" && process.env.LOCALAPPDATA) {
    defaultPaths.push(resolve(process.env.LOCALAPPDATA, "Android", "Sdk"))
  } else {
    defaultPaths.push(resolve(homedir(), "Android", "Sdk"))
  }

  return [process.env.ANDROID_HOME, process.env.ANDROID_SDK_ROOT, ...defaultPaths].find(
    (path) => path && existsSync(path),
  )
}

function collectLocalFileCandidates(value, candidates = new Set()) {
  if (Array.isArray(value)) {
    value.forEach((nestedValue) => collectLocalFileCandidates(nestedValue, candidates))
    return candidates
  }

  if (value && typeof value === "object") {
    Object.values(value).forEach((nestedValue) =>
      collectLocalFileCandidates(nestedValue, candidates),
    )
    return candidates
  }

  if (typeof value !== "string" || (!value.startsWith(".") && !value.startsWith(MOBILE_ROOT))) {
    return candidates
  }

  const path = resolve(MOBILE_ROOT, value)
  const relativePath = relative(MOBILE_ROOT, path)

  if (relativePath && relativePath !== ".." && !relativePath.startsWith(`..${sep}`)) {
    candidates.add(path)
  }

  return candidates
}

function spawnExpo(expoCliPath, arguments_, env, captureOutput = false) {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(process.execPath, [expoCliPath, ...arguments_], {
      cwd: MOBILE_ROOT,
      env,
      stdio: captureOutput ? ["ignore", "pipe", "inherit"] : "inherit",
    })
    let output = ""

    if (captureOutput) {
      child.stdout?.setEncoding("utf8")
      child.stdout?.on("data", (chunk) => {
        output += chunk
      })
    }

    child.on("error", rejectPromise)
    child.on("exit", (code, signal) => {
      if (code === 0) {
        resolvePromise(output)
        return
      }

      rejectPromise(
        new Error(
          signal
            ? `Expo was interrupted by ${signal}.`
            : `Expo exited with code ${code ?? "unknown"}.`,
        ),
      )
    })
  })
}

async function resolvePrebuildConfig(expoCliPath, nativeEnv) {
  const output = await spawnExpo(
    expoCliPath,
    ["config", "--type", "prebuild", "--json"],
    nativeEnv,
    true,
  )

  return JSON.parse(output)
}

async function createNativeFingerprint(platform, expoCliPath, nativeEnv) {
  const config = await resolvePrebuildConfig(expoCliPath, nativeEnv)
  const fileCandidates = collectLocalFileCandidates(config)
  fileCandidates.add(resolve(MOBILE_ROOT, "pnpm-lock.yaml"))

  const referencedFiles = []

  for (const path of [...fileCandidates].sort()) {
    if (await isRegularFile(path)) referencedFiles.push(path)
  }

  const hash = createHash("sha256")
  hash.update(
    JSON.stringify(
      normalizeJson({
        config,
        platform,
        schemaVersion: NATIVE_SYNC_SCHEMA_VERSION,
        variant: APP_VARIANT,
      }),
    ),
  )

  for (const path of referencedFiles) {
    hash.update("\0")
    hash.update(relative(MOBILE_ROOT, path))
    hash.update("\0")
    hash.update(await readFile(path))
  }

  return hash.digest("hex")
}

function getFingerprintPath(platform) {
  return resolve(MOBILE_ROOT, platform, ".expo-prebuild-fingerprint")
}

async function readFingerprint(platform) {
  try {
    return (await readFile(getFingerprintPath(platform), "utf8")).trim()
  } catch {
    return undefined
  }
}

async function writeFingerprint(platform, fingerprint) {
  const target = getFingerprintPath(platform)
  const temporary = `${target}.${process.pid}.tmp`

  await writeFile(temporary, `${fingerprint}\n`, "utf8")
  await rename(temporary, target)
}

async function updateFingerprint(platform, expoCliPath, nativeEnv) {
  if (!(await isDirectory(resolve(MOBILE_ROOT, platform)))) return

  const fingerprint = await createNativeFingerprint(platform, expoCliPath, nativeEnv)
  await writeFingerprint(platform, fingerprint)
}

async function syncNativeProject(platform, expoCliPath, nativeEnv) {
  const nativeDirectory = resolve(MOBILE_ROOT, platform)
  const fingerprint = await createNativeFingerprint(platform, expoCliPath, nativeEnv)
  const storedFingerprint = await readFingerprint(platform)

  if ((await isDirectory(nativeDirectory)) && storedFingerprint === fingerprint) return

  const label = platform === "ios" ? "iOS" : "Android"
  const androidLocalProperties =
    platform === "android" ? await readOptionalFile(ANDROID_LOCAL_PROPERTIES_PATH) : undefined
  console.log(`Native ${label} configuration changed; regenerating the project…`)

  try {
    await spawnExpo(expoCliPath, ["prebuild", "--clean", "--platform", platform], {
      ...nativeEnv,
      EXPO_NO_GIT_STATUS: "1",
    })
  } finally {
    await restoreAndroidLocalProperties(androidLocalProperties)
  }
  await updateFingerprint(platform, expoCliPath, nativeEnv)
}

function selectedPrebuildPlatforms(arguments_) {
  const inlinePlatform = arguments_.find((argument) => argument.startsWith("--platform="))
  const platformFlagIndex = arguments_.findIndex(
    (argument) => argument === "--platform" || argument === "-p",
  )
  const requested =
    inlinePlatform?.split("=")[1] ??
    (platformFlagIndex >= 0 ? arguments_[platformFlagIndex + 1] : undefined)

  return requested && requested !== "all" && NATIVE_PLATFORMS.includes(requested)
    ? [requested]
    : NATIVE_PLATFORMS
}

function bypassesNativeBuild(arguments_) {
  return arguments_.some(
    (argument) =>
      argument === "--help" ||
      argument === "-h" ||
      argument === "--binary" ||
      argument.startsWith("--binary="),
  )
}

const requestedCommand = process.argv[2]

if (!DEVELOPMENT_COMMANDS.includes(requestedCommand)) {
  throw new Error(`Unknown development command: ${requestedCommand ?? "(missing)"}`)
}

const passthroughArguments = process.argv.slice(3).filter((argument) => argument !== "--")
const api = resolveApiUrl()
const require = createRequire(import.meta.url)
const expoCliPath = require.resolve("expo/bin/cli")
const nativeEnv = {
  ...process.env,
  APP_VARIANT,
}
delete nativeEnv.EXPO_PUBLIC_API_URL
const androidSdkPath = findAndroidSdkPath()

if (androidSdkPath && (!nativeEnv.ANDROID_HOME || !existsSync(nativeEnv.ANDROID_HOME))) {
  nativeEnv.ANDROID_HOME = androidSdkPath
}

const developmentEnv = {
  ...nativeEnv,
  EXPO_PUBLIC_API_URL: api.url,
}

console.log("Yze development environment")
console.log(`API URL: ${api.url} (${api.source})`)

async function main() {
  if (requestedCommand === "info") return

  const expoArguments = getExpoArguments(requestedCommand, passthroughArguments)

  if (requestedCommand === "ios" || requestedCommand === "android") {
    if (!bypassesNativeBuild(passthroughArguments)) {
      await syncNativeProject(requestedCommand, expoCliPath, nativeEnv)
    }

    await spawnExpo(expoCliPath, expoArguments, developmentEnv)
    return
  }

  const androidLocalProperties =
    requestedCommand === "prebuild" &&
    selectedPrebuildPlatforms(passthroughArguments).includes("android")
      ? await readOptionalFile(ANDROID_LOCAL_PROPERTIES_PATH)
      : undefined

  try {
    await spawnExpo(
      expoCliPath,
      expoArguments,
      requestedCommand === "prebuild" ? { ...nativeEnv, EXPO_NO_GIT_STATUS: "1" } : developmentEnv,
    )
  } finally {
    await restoreAndroidLocalProperties(androidLocalProperties)
  }

  if (requestedCommand === "prebuild") {
    for (const platform of selectedPrebuildPlatforms(passthroughArguments)) {
      await updateFingerprint(platform, expoCliPath, nativeEnv)
    }
  }
}

main().catch((error) => {
  console.error(`Unable to run the Yze development command: ${error.message}`)
  process.exitCode = 1
})
