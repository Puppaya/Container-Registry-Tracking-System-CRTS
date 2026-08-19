<script setup lang="ts">
import type { AuditLog } from '~/types'
import { getAuditActionColor, getAuditActionLabel, getAuditEntityTypeLabel } from '~/utils/audit-actions'
import { formatDisplayDateTime } from '~/utils/date-format'

definePageMeta({
  layout: 'default',
  roles: ['Administrator']
})

const { t } = useI18n()
const route = useRoute()
const logId = computed(() => Number(route.params.id))

const { data: logRes, pending } = useApi<AuditLog>(() =>
  `/api/audit-logs/${logId.value}`
)

const log = computed(() => logRes.value?.data)
</script>

<template>
  <UDashboardPanel id="audit-log-detail" grow>
    <template #header>
      <UDashboardNavbar :title="t('audit.detail')">
        <template #leading>
          <div class="flex items-center gap-2">
            <UDashboardSidebarCollapse />
            <UButton icon="i-lucide-arrow-left" color="neutral" variant="ghost" to="/audit-logs" />
          </div>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div v-if="pending" class="flex justify-center py-12">
        <UIcon name="i-lucide-loader-circle" class="size-8 animate-spin text-primary" />
      </div>

      <div v-else-if="log" class="mx-auto max-w-3xl p-4 md:p-6">
        <UCard class="space-y-6">
          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <p class="text-xs text-muted">{{ t('audit.detailFields.id') }}</p>
              <p class="font-medium">{{ log.auditLogId }}</p>
            </div>
            <div>
              <p class="text-xs text-muted">{{ t('audit.detailFields.date') }}</p>
              <p class="font-medium">{{ formatDisplayDateTime(log.createdDate) }}</p>
            </div>
            <div>
              <p class="text-xs text-muted">{{ t('audit.detailFields.action') }}</p>
              <UBadge :color="getAuditActionColor(log.action)" variant="subtle">
                {{ getAuditActionLabel(log.action, t) }}
              </UBadge>
            </div>
            <div>
              <p class="text-xs text-muted">{{ t('audit.detailFields.actor') }}</p>
              <p class="font-medium">{{ log.actor }}</p>
            </div>
            <div>
              <p class="text-xs text-muted">{{ t('audit.detailFields.entityType') }}</p>
              <p class="font-medium">{{ getAuditEntityTypeLabel(log.entityType, t) }}</p>
            </div>
            <div>
              <p class="text-xs text-muted">{{ t('audit.detailFields.entityId') }}</p>
              <p class="font-medium">{{ log.entityId || '—' }}</p>
            </div>
          </div>

          <div>
            <p class="mb-2 text-xs text-muted">{{ t('audit.detailFields.details') }}</p>
            <AuditLogDetailsPanel :details="log.details" />
          </div>
        </UCard>
      </div>

      <div v-else class="p-6">
        <UAlert color="error" icon="i-lucide-alert-circle" :title="t('audit.notFound')" />
      </div>
    </template>
  </UDashboardPanel>
</template>
