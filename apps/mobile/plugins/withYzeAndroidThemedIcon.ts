import type { ConfigPlugin } from "expo/config-plugins"
import { withDangerousMod } from "expo/config-plugins"
import { copyFile, mkdir, writeFile } from "node:fs/promises"
import path from "node:path"

const launcherXml = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
  <background android:drawable="@drawable/yze_icon_background"/>
  <foreground android:drawable="@drawable/yze_icon_foreground"/>
  <monochrome android:drawable="@drawable/yze_icon_monochrome"/>
</adaptive-icon>
`

const lightBackgroundXml = `<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android" android:shape="rectangle">
  <gradient
    android:angle="315"
    android:centerColor="#F7F8F6"
    android:endColor="#E8EAE7"
    android:startColor="#FFFFFF"
    android:type="linear"/>
</shape>
`

const darkBackgroundXml = `<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android" android:shape="rectangle">
  <gradient
    android:angle="315"
    android:centerColor="#212121"
    android:endColor="#080808"
    android:startColor="#343434"
    android:type="linear"/>
</shape>
`

const foregroundXml = (source: string) => `<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
  <item>
    <bitmap android:gravity="fill" android:src="@drawable/${source}"/>
  </item>
</layer-list>
`

async function writeResource(root: string, folder: string, name: string, contents: string) {
  const directory = path.join(root, "android/app/src/main/res", folder)
  await mkdir(directory, { recursive: true })
  await writeFile(path.join(directory, name), contents)
}

/**
 * Adds Android resource qualifiers for the launcher icon. Android resolves `drawable-night`
 * natively, so app code never branches on the active appearance.
 *
 * Expo's built-in icon mod runs first; Android dangerous mods run in reverse registration order.
 * This final resource pass deliberately replaces only the adaptive-icon XML entry points.
 */
const withYzeAndroidThemedIcon: ConfigPlugin = (config) =>
  withDangerousMod(config, [
    "android",
    async (config) => {
      const projectRoot = config.modRequest.projectRoot
      const drawableNoDpi = path.join(projectRoot, "android/app/src/main/res/drawable-nodpi")
      const imageRoot = path.join(projectRoot, "assets/images")

      await mkdir(drawableNoDpi, { recursive: true })
      await Promise.all([
        copyFile(
          path.join(imageRoot, "app-icon-android-adaptive-foreground-light.png"),
          path.join(drawableNoDpi, "yze_icon_foreground_light.png"),
        ),
        copyFile(
          path.join(imageRoot, "app-icon-android-adaptive-foreground-dark.png"),
          path.join(drawableNoDpi, "yze_icon_foreground_dark.png"),
        ),
        copyFile(
          path.join(imageRoot, "app-icon-android-monochrome.png"),
          path.join(drawableNoDpi, "yze_icon_monochrome_source.png"),
        ),
        writeResource(projectRoot, "drawable", "yze_icon_background.xml", lightBackgroundXml),
        writeResource(projectRoot, "drawable-night", "yze_icon_background.xml", darkBackgroundXml),
        writeResource(
          projectRoot,
          "drawable",
          "yze_icon_foreground.xml",
          foregroundXml("yze_icon_foreground_light"),
        ),
        writeResource(
          projectRoot,
          "drawable-night",
          "yze_icon_foreground.xml",
          foregroundXml("yze_icon_foreground_dark"),
        ),
        writeResource(
          projectRoot,
          "drawable",
          "yze_icon_monochrome.xml",
          foregroundXml("yze_icon_monochrome_source"),
        ),
        writeResource(projectRoot, "mipmap-anydpi-v26", "ic_launcher.xml", launcherXml),
        writeResource(projectRoot, "mipmap-anydpi-v26", "ic_launcher_round.xml", launcherXml),
      ])

      return config
    },
  ])

export default withYzeAndroidThemedIcon
