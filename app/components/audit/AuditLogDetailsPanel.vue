<script setup lang="ts">
import {
  getAuditDetailEntries,
  getAuditSyncItems,
  getAuditSyncReasonLabel,
  getAuditSyncStatusColor,
  isAuditSyncDetails
} from '~/utils/audit-actions'

defineProps<{
  details: Record<string, unknown> | null
}>()

const { t } = useI18n()

function formatDetailValue(key: string, value: unknown) {
  if (value == null || value === '') return '—'
  if (key === 'source') return t(`audit.detailValues.source.${String(value)}`)
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

function getDetailLabel(key: string) {
  const labelKey = `audit.detailValues.${key}`
  const translated = t(labelKey)
  return translated === labelKey ? key : translated
}

function getReferenceNo(item: { gateReferenceNo?: string, surveyReferenceNo?: string }) {
  return item.gateReferenceNo || item.surveyReferenceNo || '—'
}
</script>

<template>
  <div v-if="!details" class="rounded-lg bg-elevated p-4 text-sm text-muted">
    —
  </div>

  <div v-else-if="isAuditSyncDetails(details)" class="space-y-4">
    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div class="rounded-lg border border-default bg-elevated/40 p-3">
        <p class="text-xs text-muted">{{ t('audit.detailValues.total') }}</p>
        <p class="text-lg font-semibold">{{ details.total }}</p>
      </div>
      <div class="rounded-lg border border-default bg-elevated/40 p-3">
        <p class="text-xs text-muted">{{ t('audit.detailValues.created') }}</p>
        <p class="text-lg font-semibold text-success">{{ details.created }}</p>
      </div>
      <div class="rounded-lg border border-default bg-elevated/40 p-3">
        <p class="text-xs text-muted">{{ t('audit.detailValues.skipped') }}</p>
        <p class="text-lg font-semibold text-warning">{{ details.skipped }}</p>
      </div>
      <div class="rounded-lg border border-default bg-elevated/40 p-3">
        <p class="text-xs text-muted">{{ t('audit.detailValues.failed') }}</p>
        <p class="text-lg font-semibold text-error">{{ details.failed }}</p>
      </div>
    </div>

    <div v-if="details.source" class="text-sm">
      <span class="text-muted">{{ t('audit.detailValues.sourceLabel') }}:</span>
      <span class="ml-1 font-medium">{{ formatDetailValue('source', details.source) }}</span>
    </div>

    <div v-if="details.containerNumber" class="text-sm">
      <span class="text-muted">{{ t('audit.detailValues.containerNumber') }}:</span>
      <span class="ml-1 font-medium font-mono">{{ details.containerNumber }}</span>
    </div>

    <div v-if="getAuditSyncItems(details).length" class="overflow-hidden rounded-lg border border-default">
      <table class="min-w-full text-sm">
        <thead class="bg-elevated/60 text-left">
          <tr>
            <th class="px-3 py-2 font-medium">{{ t('audit.detailValues.referenceNo') }}</th>
            <th class="px-3 py-2 font-medium">{{ t('audit.detailValues.containerNumber') }}</th>
            <th class="px-3 py-2 font-medium">{{ t('audit.detailValues.status') }}</th>
            <th class="px-3 py-2 font-medium">{{ t('audit.detailValues.reason') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, index) in getAuditSyncItems(details)"
            :key="`${getReferenceNo(item)}-${index}`"
            class="border-t border-default"
          >
            <td class="px-3 py-2 font-mono">{{ getReferenceNo(item) }}</td>
            <td class="px-3 py-2 font-mono">{{ item.containerNumber }}</td>
            <td class="px-3 py-2">
              <UBadge :color="getAuditSyncStatusColor(item.status)" variant="subtle" size="sm">
                {{ t(`audit.syncStatuses.${item.status}`) }}
              </UBadge>
            </td>
            <td class="px-3 py-2 text-muted">
              {{ getAuditSyncReasonLabel(item.reason, t) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p
      v-else-if="details.total > 0"
      class="rounded-lg border border-dashed border-default px-4 py-3 text-sm text-muted"
    >
      {{ t('audit.detailValues.noItemBreakdown') }}
    </p>
  </div>

  <dl v-else class="grid gap-3 sm:grid-cols-2">
    <div
      v-for="[key, value] in getAuditDetailEntries(details)"
      :key="key"
      class="rounded-lg border border-default bg-elevated/40 p-3"
    >
      <dt class="text-xs text-muted">{{ getDetailLabel(key) }}</dt>
      <dd class="mt-1 break-all font-medium">{{ formatDetailValue(key, value) }}</dd>
    </div>
  </dl>
</template>
