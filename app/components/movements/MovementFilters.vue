<script setup lang="ts">
import { MOVEMENT_TYPES } from '~/utils/movements'

const { t } = useI18n()

const search = defineModel<string>('search', { default: '' })
const movementType = defineModel<string>('movementType', { default: 'all' })
const owner = defineModel<string>('owner', { default: '' })
const dateFrom = defineModel<string>('dateFrom', { default: '' })
const dateTo = defineModel<string>('dateTo', { default: '' })

const typeLabels: Record<string, string> = {
  GateIn: t('movements.types.gateIn'),
  GateOut: t('movements.types.gateOut'),
  Relocation: t('movements.types.relocation')
}

const movementTypeOptions = computed(() => [
  { label: t('movements.types.all'), value: 'all' },
  ...MOVEMENT_TYPES.map(item => ({ label: typeLabels[item.value], value: item.value }))
])
</script>

<template>
  <div class="flex flex-wrap items-end gap-3">
    <UInput
      v-model="search"
      icon="i-lucide-search"
      :placeholder="$t('movements.filters.placeholder')"
      class="min-w-64"
    />
    <USelect
      v-model="movementType"
      :items="movementTypeOptions"
      class="min-w-40"
    />
    <UInput
      v-model="owner"
      :placeholder="$t('movements.filters.ownerPlaceholder')"
      class="min-w-36"
    />
    <AppDateInput v-model="dateFrom" class="min-w-36" />
    <AppDateInput v-model="dateTo" class="min-w-36" />
  </div>
</template>
