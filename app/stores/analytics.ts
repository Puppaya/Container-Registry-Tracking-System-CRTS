import { defineStore } from 'pinia'
import type { AnalyticsOverview } from '~/types'

interface AnalyticsState {
  overview: AnalyticsOverview | null
  loading: boolean
  error: string | null
  lastFetchedAt: number | null
}

export const useAnalyticsStore = defineStore('analytics', {
  state: (): AnalyticsState => ({
    overview: null,
    loading: false,
    error: null,
    lastFetchedAt: null
  }),

  getters: {
    hasData: (state) => Boolean(state.overview),
    isStale: (state) => {
      if (!state.lastFetchedAt) return true
      return Date.now() - state.lastFetchedAt > 60_000
    }
  },

  actions: {
    async fetchOverview() {
      this.loading = true
      this.error = null

      try {
        const response = await $fetch<{ data: AnalyticsOverview }>('/api/analytics/overview')
        this.overview = response.data
        this.lastFetchedAt = Date.now()
      } catch (err: unknown) {
        const message = (err as { data?: { message?: string } })?.data?.message
          || (err as Error)?.message
          || 'Failed to load analytics data'
        this.error = message
        throw err
      } finally {
        this.loading = false
      }
    },

    clearAnalytics() {
      this.overview = null
      this.error = null
      this.lastFetchedAt = null
    }
  }
})
