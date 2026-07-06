<script setup lang="ts">
import type { CalendarDate } from '@internationalized/date'
import { fromCalendarDateValue, toCalendarDateValue } from '~/utils/date-format'

const model = defineModel<string>({ default: '' })

const props = defineProps<{
  placeholder?: string
  class?: string
}>()

const wrapperRef = useTemplateRef('wrapper')
const popoverReference = computed(() => wrapperRef.value ?? undefined)
const calendarValue = shallowRef<CalendarDate | undefined>()

let syncing = false

watch(
  () => model.value,
  (value) => {
    if (syncing) return
    syncing = true
    calendarValue.value = toCalendarDateValue(value)
    syncing = false
  },
  { immediate: true }
)

watch(calendarValue, (value) => {
  if (syncing) return
  syncing = true
  model.value = fromCalendarDateValue(value)
  syncing = false
})
</script>

<template>
  <div ref="wrapper" :class="props.class">
    <UInputDate v-model="calendarValue">
      <template #trailing>
        <UPopover :reference="popoverReference">
          <UButton
            color="neutral"
            variant="link"
            size="sm"
            icon="i-lucide-calendar"
            aria-label="Select a date"
            class="px-0"
          />

          <template #content="{ close }">
            <UCalendar
              v-model="calendarValue"
              class="p-2"
              @update:model-value="close()"
            />
          </template>
        </UPopover>
      </template>
    </UInputDate>
  </div>
</template>
