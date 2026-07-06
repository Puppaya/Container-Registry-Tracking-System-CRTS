import type { AttentionAlert } from '~/utils/dashboard-ui'
import { mapContainerToAlert } from '~/utils/dashboard-ui'
import type { Container } from '~/types'

export function useDashboardAttention() {
  const { t } = useI18n()
  const alerts = ref<AttentionAlert[]>([])
  const loading = ref(false)
  const totalCount = ref(0)

  async function fetchAttentionItems() {
    loading.value = true
    try {
      const [inactiveRes, unsurveyedRes] = await Promise.all([
        $fetch<{ data: { data: Container[], meta: { total: number } } }>('/api/containers?page=1&pageSize=3&status=Inactive'),
        $fetch<{ data: { data: Container[], meta: { total: number } } }>('/api/containers?page=1&pageSize=2&surveyStatus=not_surveyed')
      ])

      const inactive = inactiveRes.data?.data ?? []
      const unsurveyed = unsurveyedRes.data?.data ?? []
      totalCount.value = (inactiveRes.data?.meta?.total ?? 0) + (unsurveyedRes.data?.meta?.total ?? 0)

      const items: AttentionAlert[] = [
        ...inactive.slice(0, 2).map(c => mapContainerToAlert(c, 'inactive', t)),
        ...unsurveyed.slice(0, 1).map(c => mapContainerToAlert(c, 'unsurveyed', t))
      ]

      alerts.value = items.slice(0, 3)
    } catch {
      alerts.value = []
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    fetchAttentionItems()
  })

  return {
    alerts,
    loading,
    totalCount,
    refresh: fetchAttentionItems
  }
}
