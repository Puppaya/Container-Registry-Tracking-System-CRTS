<script setup lang="ts">
import { MOVEMENT_TYPES } from '~/utils/movements'

const search = defineModel<string>('search', { default: '' })
const movementType = defineModel<string>('movementType', { default: 'all' })
const owner = defineModel<string>('owner', { default: '' })
const dateFrom = defineModel<string>('dateFrom', { default: '' })
const dateTo = defineModel<string>('dateTo', { default: '' })

const movementTypeOptions = computed(() => [
  { label: 'All movements', value: 'all' },
  ...MOVEMENT_TYPES.map(item => ({ label: item.label, value: item.value }))
])
</script>

<template>
  <div class="flex flex-wrap items-end gap-3">
    <UInput
      v-model="search"
      icon="i-lucide-search"
      placeholder="Container no., location, actor..."
      class="min-w-64"
    />
    <USelect
      v-model="movementType"
      :items="movementTypeOptions"
      class="min-w-40"
    />
    <UInput
      v-model="owner"
      placeholder="Owner"
      class="min-w-36"
    />
    <AppDateInput v-model="dateFrom" class="min-w-36" />
    <AppDateInput v-model="dateTo" class="min-w-36" />
  </div>
</template>
