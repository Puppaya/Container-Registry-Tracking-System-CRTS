import type { ApiResponse } from '~~/server/utils/api-response'
import type { SurveySyncSummary } from '~/types'
import { describeSurveySyncResult } from '~/utils/survey-inspection'

export function useSurveySync() {
  const toast = useToast()
  const { t } = useI18n()
  const { execute, loading } = useApiAction()
  const indicator = useLoadingIndicator()

  async function sync(options?: {
    containerId?: number
    containerNumber?: string
    onSuccess?: () => void | Promise<void>
  }) {
    indicator.start()
    const body = options?.containerId
      ? { containerId: options.containerId }
      : options?.containerNumber
        ? { containerNumber: options.containerNumber }
        : {}

    try {
      const { data, error } = await execute<SurveySyncSummary>(
        () => $fetch('/api/survey/sync', { method: 'POST', body }) as Promise<ApiResponse<SurveySyncSummary>>
      )

      if (!error && data) {
        const feedback = describeSurveySyncResult(data, t)
        toast.add({
          title: feedback.title,
          description: feedback.description,
          color: feedback.color,
          icon: feedback.color === 'success'
            ? 'i-heroicons-check-circle'
            : 'i-heroicons-exclamation-triangle'
        })
        await options?.onSuccess?.()
      }

      return { data, error }
    } finally {
      indicator.finish()
    }
  }

  return {
    sync,
    syncing: loading
  }
}
