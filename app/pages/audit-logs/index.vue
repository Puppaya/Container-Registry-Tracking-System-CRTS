<script setup lang="ts">
import type { AuditLog } from '~/types'
import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES, getAuditActionColor, getAuditActionLabel } from '~/utils/audit-actions'
import { formatDisplayDateTime } from '~/utils/date-format'

definePageMeta({
  layout: 'default',
  roles: ['Administrator']
})

const { t } = useI18n()

const page = ref(1)
const pageSize = ref(20)
const search = ref('')
const actionFilter = ref('all')
const entityTypeFilter = ref('all')
const dateFrom = ref('')
const dateTo = ref('')

watch([pageSize, actionFilter, entityTypeFilter, dateFrom, dateTo], () => {
  page.value = 1
})

const { data: auditLogs, pending } = useApi<any>(() => {
  const params = new URLSearchParams({
    page: page.value.toString(),
    pageSize: pageSize.value.toString(),
    search: search.value
  })
  if (actionFilter.value !== 'all') params.append('action', actionFilter.value)
  if (entityTypeFilter.value !== 'all') params.append('entityType', entityTypeFilter.value)
  if (dateFrom.value) params.append('dateFrom', dateFrom.value)
  if (dateTo.value) params.append('dateTo', dateTo.value)
  return `/api/audit-logs?${params.toString()}`
})

const columns = computed(() => [
  { accessorKey: 'createdDate', header: t('audit.columns.date') },
  { accessorKey: 'action', header: t('audit.columns.action') },
  { accessorKey: 'actor', header: t('audit.columns.actor') },
  { accessorKey: 'entityType', header: t('audit.columns.entity') },
  { accessorKey: 'entityId', header: t('audit.columns.entityId') },
  { id: 'actions', header: '' }
])

function openDetail(log: AuditLog) {
  navigateTo(`/audit-logs/${log.auditLogId}`)
}

const actionOptions = computed(() => [{ label: t('audit.allActions'), value: 'all' }, ...AUDIT_ACTIONS.map(item => ({
  label: item.label,
  value: item.value
}))])

const entityTypeOptions = computed(() => [{ label: t('audit.allEntities'), value: 'all' }, ...AUDIT_ENTITY_TYPES.map(item => ({
  label: item.label,
  value: item.value
}))])
</script>

<template>
  <UDashboardPanel id="audit-logs" grow>
    <template #header>
      <UDashboardNavbar :title="t('audit.title')">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <template #left>
          <div class="flex flex-wrap items-end gap-3">
            <UInput
              v-model="search"
              icon="i-lucide-search"
              :placeholder="t('audit.searchPlaceholder')"
              class="min-w-64"
            />
            <USelect
              v-model="actionFilter"
              :items="actionOptions"
              class="min-w-44"
            />
            <USelect
              v-model="entityTypeFilter"
              :items="entityTypeOptions"
              class="min-w-40"
            />
            <AppDateInput v-model="dateFrom" class="min-w-36" />
            <AppDateInput v-model="dateTo" class="min-w-36" />
          </div>
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <UDashboardPanelContent scrollable class="p-0">
        <AppEmptyState
          v-if="!pending && !(auditLogs?.data?.data?.length)"
          variant="inline"
          icon="i-lucide-scroll-text"
          :title="t('emptyState.audit.title')"
          :description="t('emptyState.audit.description')"
        />
        <UTable
          v-else
          :data="auditLogs?.data?.data || []"
          :columns="columns"
          :loading="pending"
          :ui="{
            base: 'table-fixed border-separate border-spacing-0',
            thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
            tbody: '[&>tr]:last:[&>td]:border-b-0',
            th: 'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
            td: 'border-b border-default',
            separator: 'h-0'
          }"
        >
          <template #createdDate-cell="{ row }">
            {{ formatDisplayDateTime((row.original as unknown as AuditLog).createdDate) }}
          </template>

          <template #action-cell="{ row }">
            <UBadge :color="getAuditActionColor((row.original as unknown as AuditLog).action)" variant="subtle">
              {{ getAuditActionLabel((row.original as unknown as AuditLog).action) }}
            </UBadge>
          </template>

          <template #entityId-cell="{ row }">
            {{ (row.original as unknown as AuditLog).entityId || '—' }}
          </template>

          <template #actions-cell="{ row }">
            <UButton
              icon="i-lucide-eye"
              color="neutral"
              variant="ghost"
              size="sm"
              @click="openDetail(row.original as unknown as AuditLog)"
            />
          </template>
        </UTable>

        <div class="flex flex-wrap items-center justify-between gap-3 border-t border-default p-4 text-sm">
          <p class="text-muted">
            {{ auditLogs?.data?.meta?.total || 0 }} record(s)
          </p>
          <UPagination
            v-model:page="page"
            :total="auditLogs?.data?.meta?.total || 0"
            :items-per-page="pageSize"
          />
        </div>
      </UDashboardPanelContent>
    </template>
  </UDashboardPanel>
</template>
