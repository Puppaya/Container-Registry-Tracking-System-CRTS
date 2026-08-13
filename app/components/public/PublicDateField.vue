<script setup lang="ts">
import type { CalendarDate } from '@internationalized/date'
import { fromCalendarDateValue, toCalendarDateValue } from '~/utils/date-format'

const model = defineModel<string>({ default: '' })

const isMobile = useMediaQuery('(max-width: 639px)')

const wrapperRef = useTemplateRef('wrapper')
const popoverReference = computed(() => wrapperRef.value ?? undefined)
const calendarValue = shallowRef<CalendarDate | undefined>()

let syncing = false

watch(
  () => model.value,
  (value) => {
    if (syncing || isMobile.value) return
    syncing = true
    calendarValue.value = toCalendarDateValue(value)
    syncing = false
  },
  { immediate: true }
)

watch(calendarValue, (value) => {
  if (syncing || isMobile.value) return
  syncing = true
  model.value = fromCalendarDateValue(value)
  syncing = false
})

function onNativeInput(event: Event) {
  model.value = (event.target as HTMLInputElement).value
}
</script>

<template>
  <ClientOnly>
    <div v-if="isMobile" class="public-date">
      <input
        :value="model"
        type="date"
        class="public-control public-control--date"
        @input="onNativeInput"
      >
      <UIcon name="i-lucide-calendar" class="public-date__icon" aria-hidden="true" />
    </div>

    <div v-else ref="wrapper" class="public-date-field">
      <UInputDate
        v-model="calendarValue"
        class="w-full"
        :ui="{
          root: 'relative flex w-full min-w-0 items-center',
          base: 'public-control public-control--date-input w-full min-w-0'
        }"
      >
        <template #trailing>
          <UPopover :reference="popoverReference">
            <UButton
              color="neutral"
              variant="ghost"
              size="sm"
              icon="i-lucide-calendar"
              :aria-label="$t('containers.form.registrationDate')"
              class="public-date__trigger"
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

    <template #fallback>
      <div class="public-date">
        <input
          :value="model"
          type="date"
          class="public-control public-control--date"
          @input="onNativeInput"
        >
        <UIcon name="i-lucide-calendar" class="public-date__icon" aria-hidden="true" />
      </div>
    </template>
  </ClientOnly>
</template>
