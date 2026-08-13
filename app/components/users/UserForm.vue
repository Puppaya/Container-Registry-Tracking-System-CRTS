<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const props = defineProps<{
  user?: any
}>()

const emit = defineEmits(['success', 'cancel'])

const { t } = useI18n()
const isEdit = computed(() => !!props.user)

const roleOptions = computed(() => [
  { label: t('users.roles.administrator'), value: 'Administrator' },
  { label: t('users.roles.registryOfficer'), value: 'RegistryOfficer' },
  { label: t('users.roles.surveyTeam'), value: 'SurveyTeam' },
  { label: t('users.roles.management'), value: 'Management' }
])

const schema = computed(() => z.object({
  username: z.string().min(3, t('users.form.validation.usernameMin')),
  name: z.string().min(2, t('users.form.validation.nameMin')),
  email: z.string().email(t('users.form.validation.emailInvalid')),
  password: z.string().min(6, t('users.form.validation.passwordMin')).optional().or(z.literal('')),
  role: z.enum(['Administrator', 'RegistryOfficer', 'SurveyTeam', 'Management'])
}))

type Schema = z.infer<typeof schema.value>

const defaultState = (): Schema => ({
  username: '',
  name: '',
  email: '',
  password: '',
  role: 'SurveyTeam'
})

const state = reactive<Schema>(defaultState())

const { encryptPassword } = useCrypto()
const { execute: saveUser, loading } = useApiAction()
const showPassword = ref(false)

async function onSubmit(event: FormSubmitEvent<Schema>) {
  const url = props.user ? `/api/users/${props.user.id}` : '/api/users'
  const method = props.user ? 'PATCH' : 'POST'

  const body = { ...event.data }
  if (props.user && !body.password) {
    delete (body as any).password
  } else if (body.password) {
    body.password = encryptPassword(body.password)
  }

  const { error } = await saveUser(
    () => $fetch(url as any, { method: method as any, body }) as any,
    { successMessage: props.user ? t('users.success.update') : t('users.success.create') }
  )

  if (!error) {
    emit('success')
  }
}

watch(() => props.user, (newVal) => {
  if (newVal) {
    state.username = newVal.username
    state.name = newVal.name
    state.email = newVal.email
    state.role = newVal.role
    state.password = ''
  } else {
    Object.assign(state, defaultState())
  }
  showPassword.value = false
}, { immediate: true })
</script>

<template>
  <UForm
    id="user-form"
    :schema="schema"
    :state="state"
    class="space-y-6"
    @submit="onSubmit"
  >
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <UFormField :label="t('users.form.username')" name="username" required>
        <UInput
          v-model="state.username"
          icon="i-lucide-at-sign"
          :placeholder="t('users.form.placeholders.username')"
          class="w-full"
          :disabled="isEdit"
        />
      </UFormField>

      <UFormField :label="t('users.form.name')" name="name" required>
        <UInput
          v-model="state.name"
          icon="i-lucide-user"
          :placeholder="t('users.form.placeholders.name')"
          class="w-full"
        />
      </UFormField>
    </div>

    <UFormField :label="t('users.form.email')" name="email" required>
      <UInput
        v-model="state.email"
        type="email"
        icon="i-lucide-mail"
        :placeholder="t('users.form.placeholders.email')"
        class="w-full"
      />
    </UFormField>

    <UFormField
      :label="isEdit ? t('users.form.passwordOptional') : t('users.form.password')"
      name="password"
      :required="!isEdit"
      :help="isEdit ? t('users.form.passwordHelpEdit') : t('users.form.passwordHelpCreate')"
    >
      <UInput
        v-model="state.password"
        :type="showPassword ? 'text' : 'password'"
        icon="i-lucide-lock"
        placeholder="••••••••"
        class="w-full"
      >
        <template #trailing>
          <UButton
            color="neutral"
            variant="ghost"
            size="xs"
            :icon="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
            :aria-label="showPassword ? t('users.form.hidePassword') : t('users.form.showPassword')"
            @click="showPassword = !showPassword"
          />
        </template>
      </UInput>
    </UFormField>

    <UFormField :label="t('users.form.role')" name="role" required>
      <USelect
        v-model="state.role"
        :items="roleOptions"
        class="w-full"
      />
    </UFormField>

    <div class="flex justify-end gap-3 pt-6 border-t border-default">
      <UButton
        :label="t('common.cancel')"
        color="neutral"
        variant="ghost"
        @click="$emit('cancel')"
      />
      <UButton
        type="submit"
        :label="isEdit ? t('users.form.submitEdit') : t('users.form.submitCreate')"
        :loading="loading"
        icon="i-lucide-save"
      />
    </div>
  </UForm>
</template>
