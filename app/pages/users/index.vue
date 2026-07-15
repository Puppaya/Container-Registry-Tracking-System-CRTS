<script setup lang="ts">
import type { RowSelectionState } from '@tanstack/table-core'

definePageMeta({
  layout: 'default',
  roles: ['Administrator']
})

const { t } = useI18n()

const UCheckbox = resolveComponent('UCheckbox')

const columns = [
  {
    id: 'select',
    header: ({ table }: any) =>
      h(UCheckbox as any, {
        'modelValue': table.getIsSomePageRowsSelected()
          ? 'indeterminate'
          : table.getIsAllPageRowsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
          table.toggleAllPageRowsSelected(!!value),
        'ariaLabel': 'Select all'
      }),
    cell: ({ row }: any) =>
      h(UCheckbox as any, {
        'modelValue': row.getIsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') => row.toggleSelected(!!value),
        'ariaLabel': 'Select row'
      })
  },
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'username', header: 'Username' },
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'role', header: 'Role' },
  { id: 'actions', header: '' }
]

const page = ref(1)
const pageSize = ref(10)
const search = ref('')
const roleFilter = ref('all')
const rowSelection = ref<RowSelectionState>({})

watch([pageSize, roleFilter], () => {
  page.value = 1
})

const { data: users, refresh, pending, error } = useApi<any>(() => {
  const params = new URLSearchParams({
    page: page.value.toString(),
    pageSize: pageSize.value.toString(),
    search: search.value
  })
  if (roleFilter.value && roleFilter.value !== 'all') params.append('role', roleFilter.value)

  return `/api/users?${params.toString()}`
})

const { execute: deleteUser, loading: deleting } = useApiAction()

const table = useTemplateRef<any>('table')
const tableRows = computed(() => users.value?.data?.data || [])
const totalCount = computed(() => users.value?.data?.meta?.total || 0)
const selectedRows = computed(() => table.value?.tableApi?.getFilteredSelectedRowModel().rows || [])

const isConfirmOpen = ref(false)
const confirmTarget = ref<{ id?: number, type: 'single' | 'bulk' } | null>(null)

function openCreate() {
  navigateTo('/users/create')
}

function openEdit(user: { id: number }) {
  navigateTo(`/users/${user.id}`)
}

function getRowItems(user: { id: number }) {
  return [[{
    label: t('common.edit'),
    icon: 'i-lucide-pencil',
    onSelect: () => openEdit(user)
  }, {
    label: t('common.delete'),
    icon: 'i-lucide-trash',
    color: 'error' as const,
    onSelect: () => startDelete(user.id)
  }]]
}

function startDelete(id: number) {
  confirmTarget.value = { id, type: 'single' }
  isConfirmOpen.value = true
}

function startBulkDelete() {
  confirmTarget.value = { type: 'bulk' }
  isConfirmOpen.value = true
}

async function onConfirmDelete() {
  if (!confirmTarget.value) return

  if (confirmTarget.value.type === 'single' && confirmTarget.value.id) {
    const { error: deleteError } = await deleteUser(
      () => $fetch(`/api/users/${confirmTarget.value?.id}`, { method: 'DELETE' }) as any,
      { successMessage: 'ລົບຂໍ້ມູນສຳເລັດ' }
    )
    if (!deleteError) refresh()
  } else {
    const count = selectedRows.value.length
    for (const row of selectedRows.value) {
      await $fetch(`/api/users/${row.original.id}`, { method: 'DELETE' })
    }
    useToast().add({ title: 'ສຳເລັດ', description: `ລົບຂໍ້ມູນ ${count} ລາຍການແລ້ວ`, color: 'success' })
    rowSelection.value = {}
    refresh()
  }
  isConfirmOpen.value = false
}
</script>

<template>
  <UDashboardPanel id="users" grow>
    <template #header>
      <UDashboardNavbar :title="t('users.title')">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton
            :label="t('users.addUser')"
            icon="i-lucide-plus"
            @click="openCreate"
          />
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <template #left>
          <div class="flex items-center gap-1.5">
            <UInput
              v-model="search"
              icon="i-lucide-search"
              :placeholder="t('users.searchPlaceholder')"
              class="w-64"
            />

            <USelect
              v-model="roleFilter"
              :items="[
                { label: 'All Roles', value: 'all' },
                { label: 'Administrator', value: 'Administrator' },
                { label: 'Registry Officer', value: 'RegistryOfficer' },
                { label: 'Survey Team', value: 'SurveyTeam' },
                { label: 'Management', value: 'Management' }
              ]"
              class="w-32"
            />

            <USelect
              v-model="pageSize"
              :items="[5, 10, 20, 50, 100]"
              class="w-20"
            />
          </div>
        </template>

        <template #right>
          <UButton
            v-if="selectedRows.length > 0"
            :label="t('common.deleteSelected')"
            color="error"
            variant="subtle"
            icon="i-lucide-trash"
            @click="startBulkDelete"
          >
            <template #trailing>
              <UKbd>{{ selectedRows.length }}</UKbd>
            </template>
          </UButton>
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <ConfirmPanel
        v-model:open="isConfirmOpen"
        :title="confirmTarget?.type === 'bulk' ? t('users.deleteConfirm.bulkTitle') : t('users.deleteConfirm.singleTitle')"
        :description="confirmTarget?.type === 'bulk' ? t('users.deleteConfirm.bulkDesc', { count: selectedRows.length }) : t('users.deleteConfirm.singleDesc')"
        :loading="deleting"
        @confirm="onConfirmDelete"
        @close="isConfirmOpen = false"
      />

      <UDashboardPanelContent scrollable class="p-0">
        <UAlert
          v-if="error"
          color="error"
          variant="subtle"
          icon="i-lucide-alert-circle"
          :title="t('common.error')"
          :description="(error as any)?.data?.message || (error as any)?.message || t('auth.somethingWrong')"
          class="m-4"
        />

        <AppEmptyState
          v-else-if="!pending && tableRows.length === 0"
          variant="inline"
          icon="i-lucide-users"
          :title="t('emptyState.users.title')"
          :description="t('emptyState.users.description')"
          :action-label="t('emptyState.users.action')"
          action-to="/users/create"
          action-icon="i-lucide-plus"
        />

        <template v-else>
          <UTable
            ref="table"
            v-model:row-selection="rowSelection"
            :data="tableRows"
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
            <template #name-cell="{ row }">
              <div class="flex items-center gap-3 text-sm">
                <UAvatar :src="row.original.avatar" :alt="row.original.name" size="sm" />
                <span class="font-medium text-highlighted">{{ row.original.name }}</span>
              </div>
            </template>

            <template #role-cell="{ row }">
              <UBadge :color="row.original.role === 'Administrator' ? 'primary' : 'neutral'" variant="subtle" size="sm">
                {{ row.original.role }}
              </UBadge>
            </template>

            <template #actions-cell="{ row }">
              <div class="flex items-center justify-end">
                <UDropdownMenu :items="getRowItems(row.original)" :content="{ align: 'end' }">
                  <UButton icon="i-lucide-ellipsis-vertical" color="neutral" variant="ghost" />
                </UDropdownMenu>
              </div>
            </template>
          </UTable>

          <div class="flex items-center justify-between gap-3 border-t border-default p-4 bg-white dark:bg-neutral-900 text-sm sticky bottom-0 z-10">
            <div class="text-neutral-500">
              {{ selectedRows.length }} of {{ totalCount }} row(s) selected.
            </div>

            <UPagination
              v-model:page="page"
              :total="totalCount"
              :items-per-page="pageSize"
            />
          </div>
        </template>
      </UDashboardPanelContent>
    </template>
  </UDashboardPanel>
</template>
