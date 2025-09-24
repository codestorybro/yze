import { Platform } from "react-native"

const isNewIos = Platform.OS === "ios" && parseInt(Platform.Version as string, 10) >= 26

export default isNewIos
