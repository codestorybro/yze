import { createContext, useContext, useState, type PropsWithChildren } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

import { getPartner, getRatings, createRating } from "@/api/ratings"
import { useUser } from "@/store/auth"
import type { DayRating, MoodRating, PartnerType } from "@/types/ratingType"

type PartnerContextType = {
  partner: PartnerType | null
  isPartnerLoading: boolean
  partnerError: Error | null
  ratings: DayRating[]
  isRatingsLoading: boolean
  ratingsError: Error | null
  selectedMonth: { year: number; month: number }
  setSelectedMonth: (year: number, month: number) => void
  submitRating: (mood: MoodRating, comment?: string) => Promise<void>
  isSubmitting: boolean
  refetchRatings: () => void
}

const PartnerContext = createContext<PartnerContextType | null>(null)

export function PartnerProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient()
  const { user } = useUser()
  const today = new Date()
  const [selectedMonth, setSelectedMonthState] = useState({
    year: today.getFullYear(),
    month: today.getMonth() + 1,
  })

  const {
    data: partner,
    isLoading: isPartnerLoading,
    error: partnerError,
  } = useQuery({
    queryKey: ["partner"],
    queryFn: getPartner,
    enabled: !!user,
  })

  const {
    data: ratings,
    isLoading: isRatingsLoading,
    error: ratingsError,
    refetch: refetchRatings,
  } = useQuery({
    queryKey: ["ratings", selectedMonth.year, selectedMonth.month],
    queryFn: () => getRatings({ year: selectedMonth.year, month: selectedMonth.month }),
    enabled: !!user,
  })

  const { mutateAsync: submitRatingMutation, isPending: isSubmitting } = useMutation({
    mutationFn: async ({ mood, comment }: { mood: MoodRating; comment?: string }) => {
      const todayStr = new Date().toISOString().split("T")[0]
      return createRating({ date: todayStr, mood, comment })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ratings"] })
    },
  })

  const setSelectedMonth = (year: number, month: number) => {
    setSelectedMonthState({ year, month })
  }

  const submitRating = async (mood: MoodRating, comment?: string) => {
    await submitRatingMutation({ mood, comment })
  }

  return (
    <PartnerContext.Provider
      value={{
        partner: partner ?? null,
        isPartnerLoading,
        partnerError: partnerError as Error | null,
        ratings: ratings ?? [],
        isRatingsLoading,
        ratingsError: ratingsError as Error | null,
        selectedMonth,
        setSelectedMonth,
        submitRating,
        isSubmitting,
        refetchRatings,
      }}
    >
      {children}
    </PartnerContext.Provider>
  )
}

export function usePartner() {
  const ctx = useContext(PartnerContext)
  if (!ctx) throw new Error("usePartner must be used within <PartnerProvider />")
  return ctx
}
