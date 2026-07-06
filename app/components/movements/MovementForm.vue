<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { MOVEMENT_TYPES } from '~/utils/movements'

const props = defineProps<{
  containerId: number
}>()

const emit = defineEmits(['success', 'cancel'])

const schema = z.object({
  eventType: z.enum(['Relocation', 'GateIn', 'GateOut']),
  eventDescription: z.string().min(1, 'Location or details required'),
  eventDate: z.string().min(1, 'Date required')
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
    { successMessage: 'Movement recorded successfully' }
  )

  if (!error) {
    emit('success')
  }
}
</script>

<template>
  <UForm :schema="schema" :state="state" class="space-y-6" @submit="onSubmit">
    <UFormField label="Movement Type" name="eventType">
      <USelect
        v-model="state.eventType"
        :items="MOVEMENT_TYPES.map(item => ({ label: item.label, value: item.value }))"
        class="w-full"
      />
    </UFormField>

    <UFormField label="Location / Details" name="eventDescription">
      <UTextarea
        v-model="state.eventDescription"
        class="w-full"
        :rows="3"
        placeholder="Yard A, Port gate, relocation destination..."
      />
    </UFormField>

    <UFormField label="Movement Date" name="eventDate">
      <AppDateTimeInput v-model="state.eventDate" class="w-full" />
    </UFormField>

    <div class="flex justify-end gap-3 border-t border-default pt-6">
      <UButton label="Cancel" color="neutral" variant="ghost" @click="$emit('cancel')" />
      <UButton type="submit" label="Save" :loading="loading" icon="i-lucide-save" />
    </div>
  </UForm>
</template>
