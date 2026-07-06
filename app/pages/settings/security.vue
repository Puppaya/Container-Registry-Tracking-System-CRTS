<script setup lang="ts">
import * as z from 'zod'
import type { FormError } from '@nuxt/ui'

const { t } = useI18n()

const passwordSchema = z.object({
  current: z.string().min(8, 'Must be at least 8 characters'),
  new: z.string().min(8, 'Must be at least 8 characters')
})

type PasswordSchema = z.output<typeof passwordSchema>

const password = reactive<Partial<PasswordSchema>>({
  current: '',
  new: ''
})

const validate = (state: Partial<PasswordSchema>): FormError[] => {
  const errors: FormError[] = []
  if (state.current && state.new && state.current === state.new) {
    errors.push({ name: 'new', message: t('settings.security.validationDifferent') })
  }
  return errors
}
</script>

<template>
  <UPageCard
    :title="t('settings.security.passwordTitle')"
    :description="t('settings.security.passwordDesc')"
    variant="subtle"
  >
    <UForm
      :schema="passwordSchema"
      :state="password"
      :validate="validate"
      class="flex flex-col gap-4 max-w-xs"
    >
      <UFormField name="current">
        <UInput
          v-model="password.current"
          type="password"
          :placeholder="t('settings.security.currentPassword')"
          class="w-full"
        />
      </UFormField>

      <UFormField name="new">
        <UInput
          v-model="password.new"
          type="password"
          :placeholder="t('settings.security.newPassword')"
          class="w-full"
        />
      </UFormField>

      <UButton :label="t('common.update')" class="w-fit" type="submit" />
    </UForm>
  </UPageCard>

  <UPageCard
    :title="t('settings.security.accountTitle')"
    :description="t('settings.security.accountDesc')"
    class="bg-gradient-to-tl from-error/10 from-5% to-default"
  >
    <template #footer>
      <UButton :label="t('settings.security.deleteAccount')" color="error" />
    </template>
  </UPageCard>
</template>
