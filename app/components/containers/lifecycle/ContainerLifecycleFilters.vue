<script setup lang="ts">
import { CONTAINER_EVENT_TYPES, EVENT_TYPE_LABELS } from '~/utils/container-events'

const search = defineModel<string>('search', { default: '' })
const eventType = defineModel<string>('eventType', { default: 'all' })
const dateFrom = defineModel<string>('dateFrom', { default: '' })
const dateTo = defineModel<string>('dateTo', { default: '' })

const eventTypeOptions = computed(() => [
  { label: 'All event types', value: 'all' },
  ...CONTAINER_EVENT_TYPES.map(type => ({
    label: EVENT_TYPE_LABELS[type],
    value: type
  }))
])
</script>

<template>
  <div class="flex flex-wrap items-end gap-3">
    <UInput
      v-model="search"
      icon="i-lucide-search"
      placeholder="Container no., description, actor..."
      class="min-w-64"
    />
    <USelect
      v-model="eventType"
      :items="eventTypeOptions"
      class="min-w-44"
    />
    <AppDateInput v-model="dateFrom" class="min-w-36" />
    <AppDateInput v-model="dateTo" class="min-w-36" />
  </div>
</template>
