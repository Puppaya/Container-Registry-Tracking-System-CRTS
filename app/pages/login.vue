<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
  layout: 'auth'
})

const { t } = useI18n()
const { encryptPassword } = useCrypto()

const schema = computed(() => z.object({
  username: z.string().min(3, t('auth.validation.usernameMin')),
  password: z.string().min(6, t('auth.validation.passwordMin'))
}))

type Schema = z.output<typeof schema.value>

const state = reactive({
  username: '',
  password: ''
})

const loading = ref(false)
const showPassword = ref(false)
const toast = useToast()

async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true

  try {
    const encryptedBody = {
      ...event.data,
      password: encryptPassword(event.data.password)
    }

    await $fetch('/api/auth/login', {
      method: 'POST',
      body: encryptedBody
    })

    const { fetch } = useUserSession()
    await fetch()

    toast.add({
      title: t('auth.loginSuccess'),
      description: t('auth.loginWelcome'),
      color: 'success'
    })

    await navigateTo('/dashboard')
  } catch (err: any) {
    toast.add({
      title: t('auth.loginError'),
      description: err.data?.message || t('auth.somethingWrong'),
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="w-full max-w-sm">
    <UCard class="w-full shadow-xl border-slate-200/60 dark:border-slate-800/60 backdrop-blur-md bg-white/90 dark:bg-slate-900/90">
      <template #header>
        <div class="flex flex-col items-center gap-2 text-center pt-1">
          <h1 class="text-xl font-bold tracking-tight">
            {{ t('auth.login') }}
          </h1>
          <p class="text-sm text-slate-500 dark:text-slate-400">
            {{ t('auth.loginSubtitle') }}
          </p>
        </div>
      </template>

      <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
        <UFormField :label="t('auth.username')" name="username" :help="t('auth.usernameHelp')">
          <UInput
            v-model="state.username"
            placeholder="admin"
            icon="i-lucide-user"
            autocomplete="username"
            size="lg"
            class="w-full"
          />
        </UFormField>

        <UFormField :label="t('auth.password')" name="password">
          <UInput
            v-model="state.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="••••••••"
            icon="i-lucide-lock"
            size="lg"
            class="w-full"
          >
            <template #trailing>
              <UButton
                color="neutral"
                variant="ghost"
                :icon="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                class="-me-1"
                @click="showPassword = !showPassword"
              />
            </template>
          </UInput>
        </UFormField>

        <UButton type="submit" block :loading="loading" size="lg" class="mt-2 font-semibold">
          {{ t('auth.login') }}
        </UButton>
      </UForm>
    </UCard>
  </div>
</template>
