import type { Container, DashboardActivity, DashboardSummary } from '~/types'
import { formatDisplayDate } from '~/utils/date-format'

/** Modern Enterprise Professional — dashboard semantic palette */
export const DS = {
  surface: '#faf8ff',
  surfaceContainerLow: '#f3f3fd',
  primary: '#003d9b',
  primaryContainer: '#0052cc',
  onSurfaceVariant: '#434654',
  success: '#36B37E',
  warning: '#FFAB00',
  danger: '#DE350B'
} as const

export const DASHBOARD_PALETTE = {
  status: {
    critical: {
      border: 'border-l-[var(--color-danger)]',
      bg: 'ds-alert-critical',
      text: 'text-[var(--color-danger)]',
      badge: 'error' as const
    },
    warning: {
      border: 'border-l-[var(--color-warning)]',
      bg: 'ds-alert-warning',
      text: 'text-[var(--color-warning)]',
      badge: 'warning' as const
    },
    info: {
      border: 'border-l-[var(--color-primary-container)]',
      bg: 'bg-primary-50',
      text: 'text-primary',
      badge: 'primary' as const
    }
  }
} as const

export type AttentionSeverity = keyof typeof DASHBOARD_PALETTE.status

export interface AttentionAlert {
  id: string
  severity: AttentionSeverity
  containerNumber: string
  containerId: number
  title: string
  description: string
  actionLabel: string
  actionTo: string
}

export interface DashboardKpiItem {
  key: string
  label: string
  value: string
  sublabel?: string
  icon: string
  accent?: 'primary' | 'success' | 'warning' | 'neutral'
  trend?: { value: string, direction: 'up' | 'down' | 'neutral', tone: 'success' | 'error' | 'neutral' }
  to?: string
}

export function buildDashboardKpis(
  summary: DashboardSummary | null,
  t: (key: string) => string
): DashboardKpiItem[] {
  const total = summary?.totalContainers ?? 0
  const surveyed = summary?.surveyedContainers ?? 0
  const surveyPct = total > 0 ? Math.round((surveyed / total) * 100) : 0

  const trend = summary?.registrationTrend ?? []
  const lastMonth = trend[trend.length - 1]?.count ?? 0
  const prevMonth = trend[trend.length - 2]?.count ?? 0
  const growthPct = prevMonth > 0
    ? Math.round(((lastMonth - prevMonth) / prevMonth) * 100)
    : 0

  return [
    {
      key: 'total',
      label: t('dashboard.kpis.totalContainers'),
      value: total.toLocaleString(),
      icon: 'i-lucide-box',
      accent: 'primary',
      trend: growthPct !== 0
        ? { value: `${growthPct > 0 ? '+' : ''}${growthPct}%`, direction: growthPct >= 0 ? 'up' : 'down', tone: growthPct >= 0 ? 'success' : 'error' }
        : undefined,
      to: '/containers'
    },
    {
      key: 'active',
      label: t('dashboard.kpis.active'),
      value: (summary?.activeContainers ?? 0).toLocaleString(),
      sublabel: t('dashboard.kpis.inTransit'),
      icon: 'i-lucide-circle-check',
      accent: 'success',
      to: '/containers?status=Active'
    },
    {
      key: 'inactive',
      label: t('dashboard.kpis.inactive'),
      value: (summary?.inactiveContainers ?? 0).toLocaleString(),
      icon: 'i-lucide-pause-circle',
      accent: 'warning',
      to: '/containers?status=Inactive'
    },
    {
      key: 'surveyed',
      label: t('dashboard.kpis.surveyed'),
      value: `${surveyPct}%`,
      sublabel: t('dashboard.kpis.compliance'),
      icon: 'i-lucide-shield-check',
      accent: 'primary',
      to: '/containers/search?surveyStatus=surveyed'
    }
  ]
}

export function mapContainerToAlert(
  container: Container,
  reason: 'inactive' | 'unsurveyed',
  t: (key: string) => string
): AttentionAlert {
  if (reason === 'inactive') {
    return {
      id: `inactive-${container.containerId}`,
      severity: 'critical',
      containerNumber: container.containerNumber,
      containerId: container.containerId,
      title: container.containerNumber,
      description: t('dashboard.attention.inactiveDesc'),
      actionLabel: t('dashboard.attention.reviewStatus'),
      actionTo: `/containers/${container.containerId}`
    }
  }

  return {
    id: `unsurveyed-${container.containerId}`,
    severity: 'warning',
    containerNumber: container.containerNumber,
    containerId: container.containerId,
    title: container.containerNumber,
    description: t('dashboard.attention.unsurveyedDesc'),
    actionLabel: t('dashboard.attention.scheduleSurvey'),
    actionTo: `/containers/${container.containerId}/surveys`
  }
}

export function formatTimelineGroup(dateIso: string, t: (key: string) => string, locale?: string): string {
  const date = new Date(dateIso)
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfYesterday = new Date(startOfToday)
  startOfYesterday.setDate(startOfYesterday.getDate() - 1)

  if (date >= startOfToday) return t('dashboard.activity.today')
  if (date >= startOfYesterday) return t('dashboard.activity.yesterday')

  return formatDisplayDate(dateIso)
}

export function formatTimelineTime(dateIso: string): string {
  return new Date(dateIso).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function getActivityTimelineColor(eventType: DashboardActivity['eventType']): string {
  const colors: Record<string, string> = {
    Registration: 'bg-primary-container',
    Survey: 'bg-primary',
    Repair: 'bg-warning',
    GateIn: 'bg-success',
    GateOut: 'bg-warning',
    StatusChange: 'bg-primary-400',
    Relocation: 'bg-primary-300',
    Maintenance: 'bg-on-surface-variant'
  }
  return colors[eventType] || 'bg-primary-container'
}

export const CRTS_DASHBOARD_VERSION = 'v2.4.0'
