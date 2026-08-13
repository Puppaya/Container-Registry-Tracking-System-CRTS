<script setup lang="ts">
import { CONTAINER_EVENT_TYPES } from '~/utils/container-events'
import type { ContainerEventType } from '~/types'

const { t } = useI18n()

const search = defineModel<string>('search', { default: '' })
const eventType = defineModel<string>('eventType', { default: 'all' })
const dateFrom = defineModel<string>('dateFrom', { default: '' })
const dateTo = defineModel<string>('dateTo', { default: '' })

const eventTypeLabel = (type: ContainerEventType | string): string => {
  const key = `movements.types.${type.charAt(0).toLowerCase() + type.slice(1)}`
  return t(key)
}

const eventTypeOptions = computed(() => [
  { label: t('containers.lifecyclePage.allEventTypes'), value: 'all' },
  ...CONTAINER_EVENT_TYPES.map(type => ({
    label: eventTypeLabel(type),
    value: type
  }))
])
</script>

<template>
  <div class="flex flex-wrap items-end gap-3">
    <UInput
      v-model="search"
      icon="i-lucide-search"
      :placeholder="t('containers.lifecyclePage.placeholder')"
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
