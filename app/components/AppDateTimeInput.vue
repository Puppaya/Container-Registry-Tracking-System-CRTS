<script setup lang="ts">
import { CalendarDate, CalendarDateTime } from '@internationalized/date'
import { fromCalendarDateTimeValue, toCalendarDateTimeValue } from '~/utils/date-format'

const model = defineModel<string>({ default: '' })

const props = defineProps<{
  placeholder?: string
  class?: string
}>()

const wrapperRef = useTemplateRef('wrapper')
const popoverReference = computed(() => wrapperRef.value ?? undefined)
const calendarValue = shallowRef<CalendarDateTime | undefined>()

let syncing = false

watch(
  () => model.value,
  (value) => {
    if (syncing) return
    syncing = true
    calendarValue.value = toCalendarDateTimeValue(value)
    syncing = false
  },
  { immediate: true }
)

watch(calendarValue, (value) => {
  if (syncing) return
  syncing = true
  model.value = fromCalendarDateTimeValue(value)
  syncing = false
})

function onCalendarSelect(value: CalendarDate, close: () => void) {
  const current = calendarValue.value
  calendarValue.value = new CalendarDateTime(
    value.year,
    value.month,
    value.day,
    current?.hour ?? 0,
    current?.minute ?? 0
  )
  close()
}
</script>

<template>
  <div ref="wrapper" :class="props.class">
    <UInputDate v-model="calendarValue" granularity="minute">
      <template #trailing>
        <UPopover :reference="popoverReference">
          <UButton
            color="neutral"
            variant="link"
            size="sm"
            icon="i-lucide-calendar-clock"
            aria-label="Select a date"
            class="px-0"
          />

          <template #content="{ close }">
            <UCalendar
              :model-value="calendarValue"
              class="p-2"
              @update:model-value="(value) => onCalendarSelect(value as CalendarDate, close)"
            />
          </template>
        </UPopover>
      </template>
    </UInputDate>
  </div>
</template>
