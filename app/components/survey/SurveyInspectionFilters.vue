<script setup lang="ts">
import { SURVEY_RESULT_OPTIONS } from '~/utils/survey-inspection'

const search = defineModel<string>('search', { default: '' })
const result = defineModel<string>('result', { default: 'all' })
const dateFrom = defineModel<string>('dateFrom', { default: '' })
const dateTo = defineModel<string>('dateTo', { default: '' })
</script>

<template>
  <div class="flex flex-wrap items-end gap-3">
    <UInput
      v-model="search"
      icon="i-lucide-search"
      placeholder="Reference, container, inspector..."
      class="min-w-64"
    />
    <USelect
      v-model="result"
      :items="SURVEY_RESULT_OPTIONS"
      class="min-w-40"
    />
    <AppDateInput v-model="dateFrom" class="min-w-36" />
    <AppDateInput v-model="dateTo" class="min-w-36" />
  </div>
</template>
