<script setup lang="ts">
import { isHubEntryPath, resolveHubEntryRedirect } from '~/utils/auth-routing'

definePageMeta({
  layout: false
})

const route = useRoute()
const { clear } = useUserSession()

const error = ref<string | null>(null)
const exchanging = ref(false)

onMounted(async () => {
  if (exchanging.value) return

  const raw = route.query.code
  const code = typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : undefined
  const innerPath = typeof route.query.path === 'string' ? route.query.path : undefined

  if (!code) {
    error.value = 'missing_code'
    await navigateTo('/login?hub=missing', { replace: true })
    return
  }

  exchanging.value = true
  await clear().catch(() => {})

  try {
    await $fetch('/api/auth/hub-exchange', {
      method: 'POST',
      body: { code }
    })
    setHubMode(true)
    await navigateTo(resolveHubEntryRedirect(innerPath), { replace: true })
  } catch {
    error.value = 'exchange_failed'
    await navigateTo('/login?hub=failed', { replace: true })
  } finally {
    exchanging.value = false
  }
})
</script>

<template>
  <div class="hub-bridge flex min-h-dvh flex-col items-center justify-center gap-3 bg-white px-4 text-center">
    <UIcon
      name="i-lucide-loader-circle"
      class="size-8 animate-spin text-primary"
    />
    <p class="text-xs text-neutral-500">
      {{ error ? 'Redirecting…' : 'Loading…' }}
    </p>
  </div>
</template>

<style scoped>
.hub-bridge {
  min-height: 100%;
}
</style>
