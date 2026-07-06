export function getSurveyResultColor(result: string): 'success' | 'warning' | 'error' | 'neutral' {
  const value = result.toLowerCase()
  if (value.includes('conditional')) return 'warning'
  if (value.includes('fail')) return 'error'
  if (value.includes('pass')) return 'success'
  return 'neutral'
}

export const SURVEY_RESULT_OPTIONS = [
  { label: 'All results', value: 'all' },
  { label: 'Pass', value: 'pass' },
  { label: 'Conditional', value: 'conditional' },
  { label: 'Fail', value: 'fail' }
]

export { formatDisplayDate as formatSurveyDate } from '~/utils/date-format'

export function describeSurveySyncResult(
  summary: {
    total: number
    created: number
    skipped: number
    failed: number
    fetchSource?: 'external' | 'mock'
    containerNumber?: string
    items?: Array<{ status: string; reason?: string }>
  },
  t: (key: string, params?: Record<string, unknown>) => string
) {
  if (summary.total === 0) {
    if (summary.fetchSource === 'mock') {
      return {
        title: t('survey.syncNoApiTitle'),
        description: t('survey.syncNoApiDesc'),
        color: 'warning' as const
      }
    }

    return {
      title: t('survey.syncNoRecordsTitle'),
      description: summary.containerNumber
        ? t('survey.syncNoRecordsForContainerDesc', { containerNumber: summary.containerNumber })
        : t('survey.syncNoRecordsDesc'),
      color: 'warning' as const
    }
  }

  if (summary.failed > 0) {
    return {
      title: t('survey.syncPartialTitle'),
      description: t('survey.syncPartialDesc', summary),
      color: 'warning' as const
    }
  }

  if (summary.created === 0 && summary.skipped > 0) {
    return {
      title: t('survey.syncAlreadyTitle'),
      description: t('survey.syncAlreadyDesc', { skipped: summary.skipped }),
      color: 'info' as const
    }
  }

  return {
    title: t('survey.syncSuccessTitle'),
    description: t('survey.syncSuccessDesc', summary),
    color: 'success' as const
  }
}
