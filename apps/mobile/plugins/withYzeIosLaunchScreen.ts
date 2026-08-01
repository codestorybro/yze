import type { ConfigPlugin } from "expo/config-plugins"
import { withInfoPlist } from "expo/config-plugins"

/**
 * Makes iOS generate its launch snapshot from UILaunchScreen instead of the legacy storyboard key.
 *
 * expo-splash-screen still bundles SplashScreen.storyboard and loads it after the process starts,
 * so the native hold screen remains pixel-matched. Removing only UILaunchStoryboardName also
 * invalidates snapshots cached under the project's previous Ignite launch storyboard.
 *
 * Keep this plugin before expo-splash-screen in app.json. Expo applies Info.plist mods in reverse
 * registration order, allowing this final override to remove the storyboard selection key.
 */
const withYzeIosLaunchScreen: ConfigPlugin = (config) =>
  withInfoPlist(config, (config) => {
    delete config.modResults.UILaunchStoryboardName
    config.modResults.UILaunchScreen = {
      UIColorName: "SplashScreenBackground",
      UIImageName: "SplashScreenLogo",
      UIImageRespectsSafeAreaInsets: false,
    }

    return config
  })

export default withYzeIosLaunchScreen
