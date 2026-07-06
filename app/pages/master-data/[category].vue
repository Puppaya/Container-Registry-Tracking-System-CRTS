<script setup lang="ts">
import type { MasterData } from '~/utils/master-data'
import { slugToCategory } from '~/utils/master-data'

definePageMeta({
  roles: ['Administrator']
})

const route = useRoute()
const { t } = useI18n()

const categorySlug = computed(() => route.params.category as string)
const category = computed(() => slugToCategory(categorySlug.value))

if (!category.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Master data category not found'
  })
}

const page = ref(1)
const pageSize = ref(20)
const search = ref('')
const activeFilter = ref<'all' | 'true' | 'false'>('all')

watch([categorySlug, pageSize, activeFilter], () => {
  page.value = 1
})

const { data: listRes, pending, refresh } = useApi<any>(() => {
  const params = new URLSearchParams({
    page: page.value.toString(),
    pageSize: pageSize.value.toString(),
    category: category.value!
  })
  if (search.value) params.set('search', search.value)
  if (activeFilter.value !== 'all') params.set('isActive', activeFilter.value)
  return `/api/master-data?${params.toString()}`
})

const rows = computed<MasterData[]>(() => listRes.value?.data?.data ?? [])
const total = computed(() => listRes.value?.data?.meta?.total ?? 0)

const columns = computed(() => [
  { accessorKey: 'code', header: t('masterData.columns.code') },
  { accessorKey: 'name', header: t('masterData.columns.name') },
  { accessorKey: 'description', header: t('masterData.columns.description') },
  { accessorKey: 'sortOrder', header: t('masterData.columns.sortOrder') },
  { accessorKey: 'isActive', header: t('masterData.columns.status') },
  { id: 'actions', header: '' }
])

const isFormOpen = ref(false)
const editingRecord = ref<MasterData | null>(null)
const isConfirmOpen = ref(false)
const deleteTarget = ref<MasterData | null>(null)

const { execute: deleteRecord, loading: deleting } = useApiAction()

function openCreate() {
  editingRecord.value = null
  isFormOpen.value = true
}

function openEdit(record: MasterData) {
  editingRecord.value = record
  isFormOpen.value = true
}

function closeForm() {
  isFormOpen.value = false
  editingRecord.value = null
}

async function onFormSuccess() {
  closeForm()
  await refresh()
}

function startDelete(record: MasterData) {
  deleteTarget.value = record
  isConfirmOpen.value = true
}

async function confirmDelete() {
  if (!deleteTarget.value) return

  const { error } = await deleteRecord(
    () => $fetch(`/api/master-data/${deleteTarget.value!.masterDataId}`, { method: 'DELETE' }) as Promise<any>,
    { successMessage: t('masterData.success.delete') }
  )

  if (!error) {
    isConfirmOpen.value = false
    deleteTarget.value = null
    await refresh()
  }
}

const activeOptions = computed(() => [
  { label: t('masterData.filters.allStatus'), value: 'all' },
  { label: t('masterData.filters.active'), value: 'true' },
  { label: t('masterData.filters.inactive'), value: 'false' }
])
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div class="flex flex-wrap items-end gap-3">
        <UInput
          v-model="search"
          icon="i-lucide-search"
          :placeholder="t('masterData.searchPlaceholder')"
          class="min-w-64"
          @keydown.enter="page = 1; refresh()"
        />
        <USelect
          v-model="activeFilter"
          :items="activeOptions"
          class="min-w-36"
        />
      </div>
      <UButton
        :label="t('masterData.addItem')"
        icon="i-lucide-plus"
        @click="openCreate"
      />
    </div>

    <AppEmptyState
      v-if="!pending && rows.length === 0"
      variant="inline"
      icon="i-lucide-database"
      :title="t('emptyState.masterData.title')"
      :description="t('emptyState.masterData.description')"
      :action-label="t('masterData.addItem')"
      @action="openCreate"
    />

    <template v-else>
      <UTable
        :data="rows"
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
        <template #description-cell="{ row }">
          {{ (row.original as unknown as MasterData).description || '—' }}
        </template>

        <template #isActive-cell="{ row }">
          <UBadge
            :color="(row.original as unknown as MasterData).isActive ? 'success' : 'neutral'"
            variant="subtle"
          >
            {{ (row.original as unknown as MasterData).isActive ? t('masterData.status.active') : t('masterData.status.inactive') }}
          </UBadge>
        </template>

        <template #actions-cell="{ row }">
          <div class="flex justify-end gap-1">
            <UButton
              icon="i-lucide-pencil"
              color="neutral"
              variant="ghost"
              size="sm"
              @click="openEdit(row.original as unknown as MasterData)"
            />
            <UButton
              icon="i-lucide-trash"
              color="error"
              variant="ghost"
              size="sm"
              @click="startDelete(row.original as unknown as MasterData)"
            />
          </div>
        </template>
      </UTable>

      <div class="flex flex-wrap items-center justify-between gap-3 border-t border-default pt-4 text-sm">
        <p class="text-muted">
          {{ total }} {{ t('masterData.recordCount') }}
        </p>
        <UPagination
          v-model:page="page"
          :total="total"
          :items-per-page="pageSize"
        />
      </div>
    </template>

    <AppSlideover
      v-model:open="isFormOpen"
      :title="editingRecord ? t('masterData.editItem') : t('masterData.addItem')"
      @close="closeForm"
    >
      <MasterDataForm
        :category="category!"
        :record="editingRecord"
        @success="onFormSuccess"
        @cancel="closeForm"
      />
    </AppSlideover>

    <ConfirmPanel
      v-model:open="isConfirmOpen"
      :title="t('masterData.deleteConfirm.title')"
      :description="t('masterData.deleteConfirm.description', { name: deleteTarget?.name ?? '' })"
      :confirm-label="t('common.delete')"
      color="error"
      :loading="deleting"
      @confirm="confirmDelete"
    />
  </div>
</template>
