// we always make sure 'react-native' gets included first
// eslint-disable-next-line no-restricted-imports
import * as ReactNative from "react-native"

import mockFile from "./mockFile"

// libraries to mock
jest.doMock("react-native", () => {
  const { createElement } = jest.requireActual<typeof import("react")>("react")
  const MockImageView = ReactNative.View as unknown as typeof ReactNative.Image
  const MockImage = (props: ReactNative.ImageProps) =>
    createElement(MockImageView, {
      accessibilityLabel: props.accessibilityLabel,
      onError: props.onError,
      onLoad: props.onLoad,
      style: props.style,
      testID: props.testID,
    })

  Object.assign(MockImage, ReactNative.Image, {
    resolveAssetSource: jest.fn((_source) => mockFile),
    getSize: jest.fn(
      (
        _uri: string,
        success: (width: number, height: number) => void,
        _failure?: (_error: any) => void,
      ) => success(100, 100),
    ),
  })

  // Extend ReactNative
  return Object.setPrototypeOf(
    {
      Image: MockImage,
    },
    ReactNative,
  )
})

jest.mock("i18next", () => ({
  currentLocale: "en",
  t: (key: string, params: Record<string, string>) => {
    return `${key} ${JSON.stringify(params)}`
  },
  translate: (key: string, params: Record<string, string>) => {
    return `${key} ${JSON.stringify(params)}`
  },
}))

jest.mock("expo-localization", () => ({
  ...jest.requireActual("expo-localization"),
  getLocales: () => [{ languageTag: "en-US", textDirection: "ltr" }],
}))

jest.mock("../src/i18n/index.ts", () => ({
  i18n: {
    isInitialized: true,
    language: "en",
    t: (key: string, params: Record<string, string>) => {
      return `${key} ${JSON.stringify(params)}`
    },
    numberToCurrency: jest.fn(),
  },
}))

declare const tron // eslint-disable-line @typescript-eslint/no-unused-vars

declare global {
  let __TEST__: boolean
}
