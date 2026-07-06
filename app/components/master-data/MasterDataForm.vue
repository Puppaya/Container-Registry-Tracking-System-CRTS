<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { MasterData, MasterDataCategory } from '~/utils/master-data'

const props = defineProps<{
  category: MasterDataCategory
  record?: MasterData | null
}>()

const emit = defineEmits(['success', 'cancel'])

const { t } = useI18n()

const schema = z.object({
  code: z.string().min(1, t('masterData.validation.code')).max(50),
  name: z.string().min(1, t('masterData.validation.name')).max(200),
  description: z.string().max(500).optional().or(z.literal('')),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true)
})

type Schema = z.infer<typeof schema>

const defaultState = (): Schema => ({
  code: '',
  name: '',
  description: '',
  sortOrder: 0,
  isActive: true
})

const state = reactive<Schema>(defaultState())
const { execute: saveRecord, loading } = useApiAction()

async function onSubmit(event: FormSubmitEvent<Schema>) {
  const isEdit = !!props.record
  const url = isEdit
    ? `/api/master-data/${props.record!.masterDataId}`
    : '/api/master-data'
  const method = isEdit ? 'PUT' : 'POST'

  const body = isEdit
    ? event.data
    : { ...event.data, category: props.category }

  const { error } = await saveRecord(
    () => $fetch(url, { method, body }) as Promise<any>,
    { successMessage: isEdit ? t('masterData.success.update') : t('masterData.success.create') }
  )

  if (!error) {
    emit('success')
  }
}

watch(() => props.record, (record) => {
  if (record) {
    state.code = record.code
    state.name = record.name
    state.description = record.description || ''
    state.sortOrder = record.sortOrder
    state.isActive = record.isActive
  } else {
    Object.assign(state, defaultState())
  }
}, { immediate: true })
</script>

<template>
  <UForm :schema="schema" :state="state" class="space-y-5" @submit="onSubmit">
    <UFormField :label="t('masterData.form.code')" name="code" required>
      <UInput v-model="state.code" class="w-full font-mono" :disabled="!!record" />
    </UFormField>

    <UFormField :label="t('masterData.form.name')" name="name" required>
      <UInput v-model="state.name" class="w-full" />
    </UFormField>

    <UFormField :label="t('masterData.form.description')" name="description">
      <UTextarea v-model="state.description" class="w-full" :rows="3" />
    </UFormField>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <UFormField :label="t('masterData.form.sortOrder')" name="sortOrder">
        <UInput v-model="state.sortOrder" type="number" min="0" class="w-full font-mono" />
      </UFormField>

      <UFormField :label="t('masterData.form.isActive')" name="isActive">
        <UCheckbox v-model="state.isActive" :label="t('masterData.form.activeLabel')" />
      </UFormField>
    </div>

    <div class="flex justify-end gap-3 border-t border-default pt-5">
      <UButton :label="t('common.cancel')" color="neutral" variant="ghost" @click="$emit('cancel')" />
      <UButton
        type="submit"
        :label="record ? t('common.save') : t('masterData.addItem')"
        :loading="loading"
        icon="i-lucide-save"
      />
    </div>
  </UForm>
</template>
