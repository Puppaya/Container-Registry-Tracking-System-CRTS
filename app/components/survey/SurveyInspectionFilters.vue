<script setup lang="ts">
const { t } = useI18n()

const search = defineModel<string>('search', { default: '' })
const result = defineModel<string>('result', { default: 'all' })
const dateFrom = defineModel<string>('dateFrom', { default: '' })
const dateTo = defineModel<string>('dateTo', { default: '' })

const resultOptions = computed(() => [
  { label: t('survey.filters.allResults'), value: 'all' },
  { label: t('survey.filters.pass'), value: 'pass' },
  { label: t('survey.filters.conditional'), value: 'conditional' },
  { label: t('survey.filters.fail'), value: 'fail' }
])
</script>

<template>
  <div class="flex flex-wrap items-end gap-3">
    <UInput
      v-model="search"
      icon="i-lucide-search"
      :placeholder="t('survey.filters.placeholder')"
      class="min-w-64"
    />
    <USelect
      v-model="result"
      :items="resultOptions"
      class="min-w-40"
    />
    <AppDateInput v-model="dateFrom" class="min-w-36" />
    <AppDateInput v-model="dateTo" class="min-w-36" />
  </div>
</template>
