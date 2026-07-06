import { storeToRefs } from 'pinia'
import { useAnalyticsStore } from '~/stores/analytics'

interface UseAnalyticsOptions {
  immediate?: boolean
}

export function useAnalytics(options: UseAnalyticsOptions = {}) {
  const { immediate = true } = options
  const store = useAnalyticsStore()

  const {
    overview,
    loading,
    error,
    lastFetchedAt
  } = storeToRefs(store)

  async function refresh(force = false) {
    if (!force && store.hasData && !store.isStale) {
      return
    }

    await store.fetchOverview()
  }

  if (immediate) {
    onMounted(() => {
      refresh()
    })
  }

  return {
    overview,
    loading,
    error,
    lastFetchedAt,
    refresh
  }
}
