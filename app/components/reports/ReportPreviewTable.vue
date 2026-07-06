<script setup lang="ts">
defineProps<{
  rows: Record<string, string | number | null>[]
  columns: Array<{ accessorKey: string, header: string }>
  loading?: boolean
}>()

const { t } = useI18n()
</script>

<template>
  <div>
    <UTable
      v-if="loading || rows.length > 0"
      :data="rows"
      :columns="columns"
      :loading="loading"
      :ui="{
        base: 'table-fixed border-separate border-spacing-0',
        thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
        tbody: '[&>tr]:last:[&>td]:border-b-0',
        th: 'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
        td: 'border-b border-default text-sm'
      }"
    />

    <AppEmptyState
      v-if="!loading && rows.length === 0"
      variant="inline"
      icon="i-lucide-file-spreadsheet"
      :title="t('emptyState.reports.title')"
      :description="t('emptyState.reports.description')"
    />
  </div>
</template>
