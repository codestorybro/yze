import { ConfigContext, ExpoConfig } from "expo/config"

/**
 * Use tsx/cjs here so we can use TypeScript for our Config Plugins
 * and not have to compile them to JavaScript.
 *
 * See https://docs.expo.dev/config-plugins/plugins/#add-typescript-support-and-convert-to-dynamic-app-config
 */
import "tsx/cjs"

/**
 * @param config ExpoConfig coming from the static config app.json if it exists
 *
 * You can read more about Expo's Configuration Resolution Rules here:
 * https://docs.expo.dev/workflow/configuration/#configuration-resolution-rules
 */
export default ({ config }: ConfigContext): Partial<ExpoConfig> => {
  const existingPlugins = config.plugins ?? []
  const isDevelopmentBuild = process.env.APP_VARIANT === "development"
  const plugins = existingPlugins.map((plugin) =>
    plugin === "expo-build-properties"
      ? ["expo-build-properties", { android: { usesCleartextTraffic: isDevelopmentBuild } }]
      : plugin,
  ) as ExpoConfig["plugins"]

  return {
    ...config,
    ios: {
      ...config.ios,
      infoPlist: {
        ...config.ios?.infoPlist,
        ...(isDevelopmentBuild
          ? {
              NSAppTransportSecurity: { NSAllowsLocalNetworking: true },
              NSLocalNetworkUsageDescription:
                "Gear Organizer connects to your development API on the local network.",
            }
          : {}),
      },
      // This privacyManifests is to get you started.
      // See Expo's guide on apple privacy manifests here:
      // https://docs.expo.dev/guides/apple-privacy/
      // You may need to add more privacy manifests depending on your app's usage of APIs.
      // More details and a list of "required reason" APIs can be found in the Apple Developer Documentation.
      // https://developer.apple.com/documentation/bundleresources/privacy-manifest-files
      privacyManifests: {
        NSPrivacyAccessedAPITypes: [
          {
            NSPrivacyAccessedAPIType: "NSPrivacyAccessedAPICategoryUserDefaults",
            NSPrivacyAccessedAPITypeReasons: ["CA92.1"], // CA92.1 = "Access info from same app, per documentation"
          },
        ],
      },
    },
    plugins: plugins ?? [],
  }
}
