import { defineStore } from 'pinia'
import type { DashboardActivity, DashboardSummary } from '~/types'

interface DashboardState {
  summary: DashboardSummary | null
  activities: DashboardActivity[]
  loading: boolean
  error: string | null
  lastFetchedAt: number | null
}

export const useDashboardStore = defineStore('dashboard', {
  state: (): DashboardState => ({
    summary: null,
    activities: [],
    loading: false,
    error: null,
    lastFetchedAt: null
  }),

  getters: {
    hasData: (state) => Boolean(state.summary),
    isStale: (state) => {
      if (!state.lastFetchedAt) return true
      return Date.now() - state.lastFetchedAt > 60_000
    }
  },

  actions: {
    async fetchDashboard(limit = 15) {
      this.loading = true
      this.error = null

      try {
        const [summaryResponse, activitiesResponse] = await Promise.all([
          $fetch<{ data: DashboardSummary }>('/api/dashboard/summary'),
          $fetch<{ data: DashboardActivity[] }>(`/api/dashboard/recent-activities?limit=${limit}`)
        ])

        this.summary = summaryResponse.data
        this.activities = activitiesResponse.data ?? []
        this.lastFetchedAt = Date.now()
      } catch (err: unknown) {
        const message = (err as { data?: { message?: string } })?.data?.message
          || (err as Error)?.message
          || 'Failed to load dashboard data'
        this.error = message
        throw err
      } finally {
        this.loading = false
      }
    },

    clearDashboard() {
      this.summary = null
      this.activities = []
      this.error = null
      this.lastFetchedAt = null
    }
  }
})
