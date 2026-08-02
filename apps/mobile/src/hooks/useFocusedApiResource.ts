import { useCallback, useRef, useState } from "react"
import { useFocusEffect } from "expo-router"

import type { ApiFailure } from "@/services/api/apiProblem"
import { apiFailureMessage } from "@/services/api/problemMessage"
import type { ApiResult } from "@/services/api/types"

interface ResourceState<T> {
  data: T | null
  error: string | null
  failure: ApiFailure | null
  loading: boolean
  refreshing: boolean
}

export function useFocusedApiResource<T>(load: () => Promise<ApiResult<T>>) {
  const sequence = useRef(0)
  const [state, setState] = useState<ResourceState<T>>({
    data: null,
    error: null,
    failure: null,
    loading: true,
    refreshing: false,
  })

  const run = useCallback(
    async (refreshing = false) => {
      const request = ++sequence.current
      setState((current) => ({
        ...current,
        error: null,
        failure: null,
        loading: current.data === null && !refreshing,
        refreshing,
      }))

      try {
        const result = await load()
        if (request !== sequence.current) return

        if (result.kind === "ok") {
          setState({
            data: result.data,
            error: null,
            failure: null,
            loading: false,
            refreshing: false,
          })
        } else {
          setState((current) => ({
            ...current,
            error: apiFailureMessage(result),
            failure: result,
            loading: false,
            refreshing: false,
          }))
        }
      } catch (error) {
        if (request !== sequence.current) return
        setState((current) => ({
          ...current,
          error: error instanceof Error ? error.message : "The request could not be completed.",
          failure: null,
          loading: false,
          refreshing: false,
        }))
      }
    },
    [load],
  )

  useFocusEffect(
    useCallback(() => {
      void run()
      return () => {
        sequence.current += 1
      }
    }, [run]),
  )

  return {
    ...state,
    refresh: () => run(true),
    retry: () => run(false),
  }
}
