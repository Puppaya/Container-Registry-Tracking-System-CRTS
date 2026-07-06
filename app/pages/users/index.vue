<script setup lang="ts">
import type { RowSelectionState } from '@tanstack/table-core'

definePageMeta({
  layout: 'default',
  roles: ['Administrator', 'RegistryOfficer', 'SurveyTeam', 'Management']
})

const { t } = useI18n()
const { user } = useUserSession()
const isAdmin = computed(() => (user.value as { role?: string })?.role === 'Administrator')

const UCheckbox = resolveComponent('UCheckbox')

const columns = computed(() => {
  const cols = [
    {
      accessorKey: 'id',
      header: 'ID'
    },
    {
      accessorKey: 'username',
      header: 'Username'
    },
    {
      accessorKey: 'name',
      header: 'Name'
    },
    {
      accessorKey: 'email',
      header: 'Email'
    },
    {
      accessorKey: 'role',
      header: 'Role'
    },
    {
      id: 'actions',
      header: ''
    }
  ]

  if (isAdmin.value) {
    cols.unshift({
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
    } as any)
  }

  return cols
})

const page = ref(1)
const pageSize = ref(10)
const search = ref('')
const roleFilter = ref('all')
const columnVisibility = ref({})

watch([pageSize, roleFilter], () => {
  page.value = 1
})
const rowSelection = ref<RowSelectionState>({})

const { data: users, refresh, pending } = useApi<any>(() => {
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
const selectedRows = computed(() => table.value?.tableApi?.getFilteredSelectedRowModel().rows || [])

const isConfirmOpen = ref(false)
const confirmTarget = ref<{ id?: any, type: 'single' | 'bulk' } | null>(null)

function openCreate() {
  navigateTo('/users/create')
}

function openEdit(user: any) {
  navigateTo(`/users/${user.id}`)
}

function getRowItems(user: any) {
  return [
    [{
      label: t('common.edit'),
      icon: 'i-lucide-pencil',
      onSelect: () => openEdit(user)
    }, {
      label: t('common.delete'),
      icon: 'i-lucide-trash',
      color: 'error' as const,
      onSelect: () => startDelete(user.id)
    }]
  ]
}

function startDelete(id: any) {
  confirmTarget.value = { id, type: 'single' }
  isConfirmOpen.value = true
}

function startBulkDelete() {
  confirmTarget.value = { type: 'bulk' }
  isConfirmOpen.value = true
}

async function onConfirmDelete() {
  if (!confirmTarget.value) return

  if (confirmTarget.value.type === 'single') {
    const { error } = await deleteUser(
      () => $fetch(`/api/users/${confirmTarget.value?.id}`, { method: 'DELETE' }) as any,
      { successMessage: 'ລົບຂໍ້ມູນສຳເລັດ' }
    )
    if (!error) refresh()
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
            v-if="isAdmin"
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

            <UDropdownMenu
              :items="
                table?.tableApi
                  ?.getAllColumns()
                  .filter((column: any) => column.getCanHide())
                  .map((column: any) => ({
                    label: column.id,
                    type: 'checkbox' as const,
                    checked: column.getIsVisible(),
                    onUpdateChecked(checked: boolean) {
                      table?.tableApi?.getColumn(column.id)?.toggleVisibility(!!checked)
                    },
                    onSelect(e?: Event) {
                      e?.preventDefault()
                    }
                  }))
              "
              :content="{ align: 'end' }"
            >
              <UButton
                :label="t('common.display')"
                color="neutral"
                variant="outline"
                trailing-icon="i-lucide-settings-2"
              />
            </UDropdownMenu>
          </div>
        </template>

        <template #right>
          <UButton
            v-if="isAdmin && selectedRows.length > 0"
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
        <AppEmptyState
          v-if="!pending && !(users?.data?.data?.length)"
          variant="inline"
          icon="i-lucide-users"
          :title="t('emptyState.users.title')"
          :description="t('emptyState.users.description')"
          :action-label="isAdmin ? t('emptyState.users.action') : undefined"
          action-to="/users/create"
          action-icon="i-lucide-plus"
        />
        <UTable
          v-else
          ref="table"
          v-model:row-selection="rowSelection"
          v-model:column-visibility="columnVisibility"
          :data="users?.data?.data || []"
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
              <UAvatar :src="(row.original.avatar as string | undefined)" :alt="(row.original.name as string)" size="sm" />
              <div class="flex flex-col">
                <span class="font-medium text-highlighted">{{ row.original.name }}</span>
              </div>
            </div>
          </template>

          <template #role-cell="{ row }">
            <UBadge :color="row.original.role === 'Administrator' ? 'primary' : 'neutral'" variant="subtle" size="sm">
              {{ row.original.role }}
            </UBadge>
          </template>

          <template #actions-cell="{ row }">
            <div class="flex items-center justify-end">
              <UDropdownMenu v-if="isAdmin" :items="getRowItems(row.original)" :content="{ align: 'end' }">
                <UButton icon="i-lucide-ellipsis-vertical" color="neutral" variant="ghost" />
              </UDropdownMenu>
              <span v-else class="text-xs text-neutral-400">{{ t('common.viewOnly') }}</span>
            </div>
          </template>
        </UTable>

        <div class="flex items-center justify-between gap-3 border-t border-default p-4 bg-white dark:bg-neutral-900 text-sm sticky bottom-0 z-10">
          <div class="text-neutral-500">
            {{ selectedRows.length }} of {{ users?.data?.meta?.total || 0 }} row(s) selected.
          </div>

          <div class="flex items-center gap-1.5">
            <UPagination
              v-model:page="page"
              :total="users?.data?.meta?.total || 0"
              :items-per-page="pageSize"
            />
          </div>
        </div>
      </UDashboardPanelContent>
    </template>
  </UDashboardPanel>
</template>
