<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { MOVEMENT_TYPES } from '~/utils/movements'

const { t } = useI18n()

const props = defineProps<{
  containerId: number
}>()

const emit = defineEmits(['success', 'cancel'])

const typeLabels: Record<string, string> = {
  GateIn: t('movements.types.gateIn'),
  GateOut: t('movements.types.gateOut'),
  Relocation: t('movements.types.relocation')
}

const schema = z.object({
  eventType: z.enum(['Relocation', 'GateIn', 'GateOut']),
  eventDescription: z.string().min(1, t('movements.form.validation.locationRequired')),
  eventDate: z.string().min(1, t('movements.form.validation.dateRequired'))
})

type Schema = z.infer<typeof schema>

const state = reactive<Schema>({
  eventType: 'GateIn',
  eventDescription: '',
  eventDate: new Date().toISOString().slice(0, 16)
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
  <UForm :schema="schema" :state="state" class="space-y-6" @submit="onSubmit">
    <UFormField :label="$t('movements.form.type')" name="eventType">
      <USelect
        v-model="state.eventType"
        :items="MOVEMENT_TYPES.map(item => ({ label: typeLabels[item.value], value: item.value }))"
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

    <div class="flex justify-end gap-3 border-t border-default pt-6">
      <UButton :label="$t('common.cancel')" color="neutral" variant="ghost" @click="$emit('cancel')" />
      <UButton type="submit" :label="$t('common.save')" :loading="loading" icon="i-lucide-save" />
    </div>
  </UForm>
</template>
