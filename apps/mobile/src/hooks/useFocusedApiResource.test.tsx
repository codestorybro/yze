import { act, renderHook, waitFor } from "@testing-library/react-native"

import { useFocusedApiResource } from "@/hooks/useFocusedApiResource"
import type { ApiResult } from "@/services/api/types"

jest.mock("expo-router", () => {
  const React = jest.requireActual("react")
  return {
    useFocusEffect: (effect: () => void | (() => void)) => React.useEffect(effect, [effect]),
  }
})

describe("useFocusedApiResource", () => {
  it("loads on focus and keeps existing data visible during refresh", async () => {
    let finishRefresh!: (result: ApiResult<string[]>) => void
    const load = jest
      .fn<Promise<ApiResult<string[]>>, []>()
      .mockResolvedValueOnce({ kind: "ok", data: ["Studio"] })
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            finishRefresh = resolve
          }),
      )
    const { result } = renderHook(() => useFocusedApiResource(load))

    await waitFor(() => expect(result.current.data).toEqual(["Studio"]))

    await act(async () => {
      void result.current.refresh()
    })
    expect(result.current.data).toEqual(["Studio"])
    expect(result.current.refreshing).toBe(true)

    await act(async () => finishRefresh({ kind: "ok", data: ["Studio", "Backpack"] }))
    await waitFor(() => expect(result.current.data).toEqual(["Studio", "Backpack"]))
    expect(result.current.refreshing).toBe(false)
  })

  it("preserves data and exposes a recoverable error when refresh fails", async () => {
    const load = jest
      .fn<Promise<ApiResult<string[]>>, []>()
      .mockResolvedValueOnce({ kind: "ok", data: ["Studio"] })
      .mockResolvedValueOnce({ kind: "cannot-connect", temporary: true })
    const { result } = renderHook(() => useFocusedApiResource(load))

    await waitFor(() => expect(result.current.data).toEqual(["Studio"]))
    await act(async () => {
      await result.current.refresh()
    })

    expect(result.current.data).toEqual(["Studio"])
    expect(result.current.error).toContain("could not reach the API")
  })
})
