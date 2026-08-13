<script setup lang="ts">
import type { RowSelectionState } from '@tanstack/table-core'
import type { Container } from '~/types'
import { CRTS_DASHBOARD_VERSION } from '~/utils/dashboard-ui'

definePageMeta({
  layout: 'default',
  roles: ['Administrator', 'RegistryOfficer', 'SurveyTeam', 'Management']
})

const { t } = useI18n()
const { user } = useUserSession()
const isAdmin = computed(() => (user.value as { role?: string })?.role === 'Administrator')
const canWrite = computed(() => ['Administrator', 'RegistryOfficer'].includes((user.value as { role?: string })?.role || ''))

const UCheckbox = resolveComponent('UCheckbox')

const page = ref(1)
const pageSize = ref(50)
const search = ref('')
const statusFilter = ref('all')
const ownerFilter = ref('all')
const sizeFilter = ref('all')
const columnVisibility = ref({})
const rowSelection = ref<RowSelectionState>({})
const exporting = ref(false)

watch([pageSize, statusFilter, ownerFilter, sizeFilter], () => {
  page.value = 1
})

const { data: containers, refresh, pending } = useApi<any>(() => {
  const params = new URLSearchParams({
    page: page.value.toString(),
    pageSize: pageSize.value.toString(),
    search: search.value
  })
  if (statusFilter.value && statusFilter.value !== 'all') {
    params.append('status', statusFilter.value)
  }
  if (ownerFilter.value && ownerFilter.value !== 'all') {
    params.append('owner', ownerFilter.value)
  }
  if (sizeFilter.value && sizeFilter.value !== 'all') {
    params.append('containerSize', sizeFilter.value)
  }
  return `/api/containers?${params.toString()}`
})

const { execute: runAction, loading: acting } = useApiAction()

const table = useTemplateRef<any>('table')

const isConfirmOpen = ref(false)
const confirmTarget = ref<{ container?: Container, type: 'delete' | 'deactivate' } | null>(null)

const tableRows = computed<Container[]>(() => containers.value?.data?.data || [])
const totalCount = computed(() => containers.value?.data?.meta?.total || 0)
const totalPages = computed(() => Math.max(1, Math.ceil(totalCount.value / pageSize.value)))

const ownerOptions = computed(() => {
  const owners = new Set<string>()
  for (const container of tableRows.value) {
    if (container.owner) owners.add(container.owner)
  }

  return [
    { label: t('common.allOwners'), value: 'all' },
    ...Array.from(owners).sort().map(owner => ({ label: owner, value: owner }))
  ]
})

const columns = computed(() => [
  {
    id: 'select',
    header: ({ table: tableApi }: any) =>
      h(UCheckbox as any, {
        'modelValue': tableApi.getIsSomePageRowsSelected()
          ? 'indeterminate'
          : tableApi.getIsAllPageRowsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
          tableApi.toggleAllPageRowsSelected(!!value),
        'ariaLabel': t('common.selectAll')
      }),
    cell: ({ row }: any) =>
      h(UCheckbox as any, {
        'modelValue': row.getIsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') => row.toggleSelected(!!value),
        'ariaLabel': t('common.selectRow')
      })
  },
  { accessorKey: 'containerNumber', header: t('containers.columns.containerNumber') },
  { accessorKey: 'isoType', header: t('containers.columns.isoType') },
  { accessorKey: 'containerSize', header: t('containers.columns.size') },
  { accessorKey: 'containerCategory', header: t('containers.columns.category') },
  { accessorKey: 'owner', header: t('containers.columns.owner') },
  { accessorKey: 'status', header: t('containers.columns.status') },
  { id: 'actions', header: '' }
])

function formatSize(container: Container) {
  const suffix = container.containerCategory?.toLowerCase().includes('refriger')
    ? 'RF'
    : container.containerSize === '40' || container.containerSize === '45'
      ? 'HC'
      : 'ST'
  return `${container.containerSize}' ${suffix}`
}

function getOwnerInitials(owner: string) {
  return owner
    .split(/[\s-]+/)
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join('')
}

function getStatusPresentation(status: Container['status']) {
  if (status === 'Active') {
    return {
      label: t('common.available'),
      class: 'bg-success-50 text-success-700 ring-success-100'
    }
  }

  return {
    label: t('common.inactive'),
    class: 'bg-error-50 text-error-700 ring-error-100'
  }
}

function clearFilters() {
  statusFilter.value = 'all'
  ownerFilter.value = 'all'
  sizeFilter.value = 'all'
  search.value = ''
  page.value = 1
}

async function exportCsv() {
  exporting.value = true

  try {
    const params = new URLSearchParams({
      page: '1',
      pageSize: '10000',
      search: search.value
    })
    if (statusFilter.value !== 'all') params.append('status', statusFilter.value)
    if (ownerFilter.value !== 'all') params.append('owner', ownerFilter.value)
    if (sizeFilter.value !== 'all') params.append('containerSize', sizeFilter.value)

    const response = await $fetch<{ data: { data: Container[] } }>(`/api/containers?${params.toString()}`)
    const rows = response.data?.data || []

    const headers = [
      t('containers.columns.containerNumber'),
      t('containers.columns.isoType'),
      t('containers.columns.size'),
      t('containers.columns.category'),
      t('containers.columns.owner'),
      t('containers.columns.status')
    ]
    const csvLines = [
      headers.join(','),
      ...rows.map(row => [
        row.containerNumber,
        row.isoType,
        row.containerSize,
        row.containerCategory,
        `"${row.owner.replace(/"/g, '""')}"`,
        row.status
      ].join(','))
    ]

    const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `container-registry-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  } finally {
    exporting.value = false
  }
}

function openEdit(container: Container) {
  navigateTo(`/containers/${container.containerId}/edit`)
}

async function toggleStatus(container: Container) {
  const nextStatus = container.status === 'Active' ? 'Inactive' : 'Active'
  const { error } = await runAction(
    () => $fetch(`/api/containers/${container.containerId}/status`, {
      method: 'PATCH',
      body: { status: nextStatus }
    }) as Promise<any>,
    {
      successMessage: nextStatus === 'Active'
        ? t('containers.activated')
        : t('containers.deactivated')
    }
  )
  if (!error) refresh()
}

function startDelete(container: Container) {
  confirmTarget.value = { container, type: 'delete' }
  isConfirmOpen.value = true
}

async function onConfirmAction() {
  if (!confirmTarget.value?.container) return

  const { container } = confirmTarget.value
  const { error } = await runAction(
    () => $fetch(`/api/containers/${container.containerId}`, { method: 'DELETE' }) as Promise<any>,
    { successMessage: t('containers.deleted') }
  )

  if (!error) refresh()
  isConfirmOpen.value = false
}

function getRowItems(container: Container) {
  return [[
    {
      label: t('containers.rowActions.profile'),
      icon: 'i-lucide-layout-panel-top',
      onSelect: () => navigateTo(`/containers/${container.containerId}`)
    },
    {
      label: t('containers.rowActions.edit'),
      icon: 'i-lucide-pencil',
      onSelect: () => openEdit(container),
      disabled: !canWrite.value
    },
    {
      label: container.status === 'Active' ? t('containers.rowActions.deactivate') : t('containers.rowActions.activate'),
      icon: container.status === 'Active' ? 'i-lucide-circle-off' : 'i-lucide-circle-check',
      onSelect: () => toggleStatus(container),
      disabled: !canWrite.value
    },
    {
      label: t('containers.rowActions.delete'),
      icon: 'i-lucide-trash',
      color: 'error' as const,
      onSelect: () => startDelete(container),
      disabled: !isAdmin.value
    }
  ]]
}
</script>

<template>
  <UDashboardPanel id="containers" grow class="ds-page">
    <template #header>
      <UDashboardNavbar class="registry-navbar bg-surface border-b border-[color-mix(in_srgb,var(--ds-border)_80%,transparent)]">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #default>
          <UInput
            v-model="search"
            icon="i-lucide-search"
            :placeholder="t('containers.searchPlaceholder')"
            class="registry-navbar-search"
            size="md"
          />
        </template>

        <template #right>
          <UButton
            icon="i-lucide-bell"
            color="neutral"
            variant="ghost"
            :aria-label="t('common.notifications')"
            class="relative"
          >
            <span class="absolute top-2 right-2 size-2 rounded-full bg-error-500" />
          </UButton>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <ConfirmPanel
        v-model:open="isConfirmOpen"
        :title="t('containers.deleteTitle')"
        :description="t('containers.deleteDesc', { containerNumber: confirmTarget?.container?.containerNumber })"
        :loading="acting"
        @confirm="onConfirmAction"
        @close="isConfirmOpen = false"
      />

      <div class="flex min-h-full flex-col">
        <UDashboardPanelContent scrollable class="flex-1 p-0">
          <div class="registry-page-content">
            <PageModuleHeader
              :title="t('containers.title')"
              :description="t('containers.registryDesc')"
            >
              <template #actions>
                <UButton
                  v-if="canWrite"
                  :label="t('containers.register')"
                  icon="i-lucide-plus"
                  color="primary"
                  size="md"
                  to="/containers/register"
                />
              </template>
            </PageModuleHeader>

            <ContainersContainerRegistryFilters
              v-model:status-filter="statusFilter"
              v-model:owner-filter="ownerFilter"
              v-model:size-filter="sizeFilter"
              :owner-options="ownerOptions"
              :exporting="exporting"
              @clear="clearFilters"
              @export="exportCsv"
            />

            <div class="registry-table-card">
              <AppEmptyState
                v-if="!pending && tableRows.length === 0"
                icon="i-lucide-box"
                :title="t('emptyState.registry.title')"
                :description="t('emptyState.registry.description')"
                :action-label="canWrite ? t('emptyState.registry.action') : undefined"
                action-to="/containers/register"
                action-icon="i-lucide-plus"
              />
              <template v-else>
                <UTable
                  ref="table"
                  v-model:row-selection="rowSelection"
                  v-model:column-visibility="columnVisibility"
                  :data="tableRows"
                  :columns="columns"
                  :loading="pending"
                  :ui="{
                    base: 'table-fixed border-separate border-spacing-0',
                    thead: '[&>tr]:bg-surface-container-low [&>tr]:after:content-none',
                    tbody: '[&>tr]:last:[&>td]:border-b-0 [&>tr]:hover:bg-primary-50/40',
                    th: 'py-3 px-4 first:rounded-tl-md last:rounded-tr-md border-b border-[color-mix(in_srgb,var(--ds-border)_80%,transparent)] font-mono text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold',
                    td: 'py-3.5 px-4 border-b border-[color-mix(in_srgb,var(--ds-border)_80%,transparent)] align-middle',
                    separator: 'h-0'
                  }"
                >
                <template #containerNumber-cell="{ row }">
                  <NuxtLink
                    :to="`/containers/${(row.original as unknown as Container).containerId}`"
                    class="font-mono text-sm font-semibold text-primary-container hover:text-primary hover:underline"
                  >
                    {{ (row.original as unknown as Container).containerNumber }}
                  </NuxtLink>
                </template>

                <template #isoType-cell="{ row }">
                  <span class="font-mono text-sm text-on-surface">
                    {{ (row.original as unknown as Container).isoType }}
                  </span>
                </template>

                <template #containerSize-cell="{ row }">
                  <span class="font-mono text-sm text-on-surface">
                    {{ formatSize(row.original as unknown as Container) }}
                  </span>
                </template>

                <template #containerCategory-cell="{ row }">
                  <span class="text-sm text-on-surface">
                    {{ (row.original as unknown as Container).containerCategory }}
                  </span>
                </template>

                <template #owner-cell="{ row }">
                  <div class="flex items-center gap-2.5 min-w-0">
                    <span
                      class="inline-flex size-7 shrink-0 items-center justify-center rounded-md bg-primary-50 text-[10px] font-bold text-primary ring-1 ring-primary-100"
                    >
                      {{ getOwnerInitials((row.original as unknown as Container).owner) }}
                    </span>
                    <span class="truncate text-sm font-medium text-on-surface">
                      {{ (row.original as unknown as Container).owner }}
                    </span>
                  </div>
                </template>

                <template #status-cell="{ row }">
                  <span
                    class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset"
                    :class="getStatusPresentation((row.original as unknown as Container).status).class"
                  >
                    {{ getStatusPresentation((row.original as unknown as Container).status).label }}
                  </span>
                </template>

                <template #actions-cell="{ row }">
                  <div class="flex items-center justify-end">
                    <UDropdownMenu
                      v-if="canWrite || isAdmin"
                      :items="getRowItems(row.original as unknown as Container)"
                      :content="{ align: 'end' }"
                    >
                      <UButton icon="i-lucide-ellipsis-vertical" color="neutral" variant="ghost" />
                    </UDropdownMenu>
                  </div>
                </template>
              </UTable>

                <div class="registry-table-footer">
                  <div class="flex items-center gap-2 font-mono text-sm text-on-surface-variant">
                    <UIcon name="i-lucide-box" class="size-4" />
                    <span>
                      {{ t('common.showing', { n: tableRows.length.toLocaleString(), total: totalCount.toLocaleString() }) }}
                    </span>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </UDashboardPanelContent>

        <footer class="registry-page-footer">
          <div class="registry-page-footer__status">
            <span>{{ t('common.systemStatus') }}</span>
            <span class="inline-flex items-center gap-1.5 text-success">
              <span class="size-1.5 rounded-full bg-success" />
              {{ t('common.operational') }}
            </span>
            <span class="text-[color-mix(in_srgb,var(--ds-border)_100%,transparent)]">|</span>
            <span>{{ CRTS_DASHBOARD_VERSION }}</span>
          </div>

          <div class="registry-page-footer__pagination">
            <UButton
              icon="i-lucide-chevron-left"
              color="neutral"
              variant="ghost"
              size="xs"
              :disabled="page <= 1"
              :aria-label="t('common.previousPage')"
              @click="page = Math.max(1, page - 1)"
            />
            <span class="font-mono text-xs text-on-surface-variant">
              {{ t('common.pageOf', { page: page.toLocaleString(), total: totalPages.toLocaleString() }) }}
            </span>
            <UButton
              icon="i-lucide-chevron-right"
              color="neutral"
              variant="ghost"
              size="xs"
              :disabled="page >= totalPages"
              :aria-label="t('common.nextPage')"
              @click="page = Math.min(totalPages, page + 1)"
            />
          </div>

          <div class="registry-page-footer__links">
            <NuxtLink to="/reports" class="registry-page-footer__link">
              {{ t('common.documentation') }}
            </NuxtLink>
            <NuxtLink to="/settings" class="registry-page-footer__link">
              {{ t('common.support') }}
            </NuxtLink>
          </div>
        </footer>
      </div>
    </template>
  </UDashboardPanel>
</template>

<style scoped>
.registry-navbar-search {
  width: min(100%, 36rem);
}

.registry-page-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem;
}

@media (min-width: 640px) {
  .registry-page-content {
    padding: 1.5rem 2rem 2rem;
  }
}

.registry-table-card {
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--ds-border) 80%, transparent);
  border-radius: var(--radius-md);
  background: white;
}

.registry-table-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.875rem 1rem;
  border-top: 1px solid color-mix(in srgb, var(--ds-border) 80%, transparent);
  background: color-mix(in srgb, var(--color-surface-container-low) 60%, white);
}

.registry-page-footer {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
  padding: 0.875rem 1.5rem;
  border-top: 1px solid color-mix(in srgb, var(--ds-border) 80%, transparent);
  background: var(--color-surface-container-low);
}

@media (min-width: 768px) {
  .registry-page-footer {
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
  }

  .registry-page-footer__pagination {
    justify-self: center;
  }

  .registry-page-footer__links {
    justify-self: end;
  }
}

.registry-page-footer__status,
.registry-page-footer__pagination,
.registry-page-footer__links {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--color-on-surface-variant);
}

.registry-page-footer__link {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--color-on-surface-variant);
  transition: color 0.15s;
}

.registry-page-footer__link:hover {
  color: var(--color-primary);
}
</style>
