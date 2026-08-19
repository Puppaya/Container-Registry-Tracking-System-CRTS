<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { toDateTimeLocalValue } from '~/utils/date-format'

const { t } = useI18n()

const props = defineProps<{
  containerId: number
}>()

const emit = defineEmits<{
  success: []
  cancel: []
}>()

const typeItems = computed(() => [
  { label: t('movements.types.gateIn'), value: 'GateIn' },
  { label: t('movements.types.gateOut'), value: 'GateOut' },
  { label: t('movements.types.relocation'), value: 'Relocation' }
])

const schema = z.object({
  eventType: z.enum(['Relocation', 'GateIn', 'GateOut']),
  eventDescription: z.string().min(1, t('movements.form.validation.locationRequired')),
  eventDate: z.string().min(1, t('movements.form.validation.dateRequired'))
})

type Schema = z.infer<typeof schema>

const state = reactive<Schema>({
  eventType: 'GateIn',
  eventDescription: '',
  eventDate: toDateTimeLocalValue(new Date())
})

const { execute: saveMovement, loading } = useApiAction()

async function onSubmit(event: FormSubmitEvent<Schema>) {
  const { error } = await saveMovement(
    () => $fetch(`/api/containers/${props.containerId}/movements`, {
      method: 'POST',
      body: {
        ...event.data,
        eventDate: new Date(event.data.eventDate).toISOString()
      }
    }) as Promise<any>,
    { successMessage: t('movements.form.success') }
  )

  if (!error) {
    emit('success')
  }
}
</script>

<template>
  <UForm :schema="schema" :state="state" class="w-full space-y-5" @submit="onSubmit">
    <UFormField :label="$t('movements.form.type')" name="eventType">
      <USelect
        v-model="state.eventType"
        :items="typeItems"
        class="w-full"
      />
    </UFormField>

    <UFormField :label="$t('movements.form.location')" name="eventDescription">
      <UTextarea
        v-model="state.eventDescription"
        class="w-full"
        :rows="3"
        :placeholder="$t('movements.form.placeholder')"
      />
    </UFormField>

    <UFormField :label="$t('movements.form.date')" name="eventDate">
      <AppDateTimeInput v-model="state.eventDate" class="w-full" />
    </UFormField>

    <div class="flex justify-end gap-3 pt-2">
      <UButton
        :label="$t('common.cancel')"
        color="neutral"
        variant="ghost"
        :disabled="loading"
        @click="$emit('cancel')"
      />
      <UButton
        type="submit"
        :label="$t('common.save')"
        :loading="loading"
        icon="i-lucide-save"
      />
    </div>
  </UForm>
</template>
