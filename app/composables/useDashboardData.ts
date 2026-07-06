import { storeToRefs } from 'pinia'
import { useDashboardStore } from '~/stores/dashboard'

interface UseDashboardDataOptions {
  limit?: number
  immediate?: boolean
}

/**
 * Composable for dashboard data fetching via Pinia store.
 * Loads summary + recent activities in parallel for performance (< 3s target).
 */
export function useDashboardData(options: UseDashboardDataOptions = {}) {
  const { limit = 15, immediate = true } = options
  const store = useDashboardStore()

  const {
    summary,
    activities,
    loading,
    error,
    lastFetchedAt
  } = storeToRefs(store)

  async function refresh(force = false) {
    if (!force && store.hasData && !store.isStale) {
      return
    }

    await store.fetchDashboard(limit)
  }

  if (immediate) {
    onMounted(() => {
      refresh()
    })
  }

  return {
    summary,
    activities,
    loading,
    error,
    lastFetchedAt,
    refresh
  }
}
