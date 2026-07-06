<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { CONTAINER_EVENT_TYPES, EVENT_TYPE_LABELS } from '~/utils/container-events'

const props = defineProps<{
  containerId: number
}>()

const emit = defineEmits(['success', 'cancel'])

const eventTypeOptions = CONTAINER_EVENT_TYPES
  .filter(type => type !== 'Registration' && type !== 'StatusChange')
  .map(type => ({
    label: EVENT_TYPE_LABELS[type],
    value: type
  }))

const schema = z.object({
  eventType: z.enum([
    'Survey',
    'Repair',
    'Maintenance',
    'Relocation',
    'GateIn',
    'GateOut'
  ]),
  eventDescription: z.string().min(1, 'ກະລຸນາປ້ອນລາຍລະອຽດ'),
  eventDate: z.string().min(1, 'ກະລຸນາເລືອກວັນທີ')
})

type Schema = z.infer<typeof schema>

const state = reactive<Schema>({
  eventType: 'Repair',
  eventDescription: '',
  eventDate: new Date().toISOString().slice(0, 16)
})

const { execute: saveEvent, loading } = useApiAction()

async function onSubmit(event: FormSubmitEvent<Schema>) {
  const { error } = await saveEvent(
    () => $fetch(`/api/containers/${props.containerId}/events`, {
      method: 'POST',
      body: {
        ...event.data,
        eventDate: new Date(event.data.eventDate).toISOString()
      }
    }) as Promise<any>,
    { successMessage: 'ບັນທຶກ event ສຳເລັດ' }
  )

  if (!error) {
    emit('success')
  }
}
</script>

<template>
  <UForm :schema="schema" :state="state" class="space-y-6" @submit="onSubmit">
    <UFormField label="ປະເພດ Event" name="eventType">
      <USelect v-model="state.eventType" :items="eventTypeOptions" class="w-full" />
    </UFormField>

    <UFormField label="ລາຍລະອຽດ" name="eventDescription">
      <UTextarea
        v-model="state.eventDescription"
        class="w-full"
        :rows="3"
        placeholder="ອະທິບາຍ event..."
      />
    </UFormField>

    <UFormField label="ວັນທີ Event" name="eventDate">
      <AppDateTimeInput v-model="state.eventDate" class="w-full" />
    </UFormField>

    <div class="flex justify-end gap-3 border-t border-default pt-6">
      <UButton label="ຍົກເລີກ" color="neutral" variant="ghost" @click="$emit('cancel')" />
      <UButton type="submit" label="ບັນທຶກ" :loading="loading" icon="i-lucide-save" />
    </div>
  </UForm>
</template>
