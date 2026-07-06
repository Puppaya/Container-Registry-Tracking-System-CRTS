<script setup lang="ts">
definePageMeta({
  layout: false
})

const { t } = useI18n()
const { loggedIn } = useUserSession()

onMounted(() => {
  setTimeout(() => {
    if (loggedIn.value) {
      navigateTo('/dashboard')
    } else {
      navigateTo('/login')
    }
  }, 1000)
})
</script>

<template>
  <div class="fixed inset-0 flex flex-col items-center justify-center bg-white dark:bg-neutral-950 z-[9999]">
    <div class="relative flex items-center justify-center">
      <div class="size-20 border-4 border-primary/20 rounded-full animate-pulse" />
      <div class="absolute size-20 border-4 border-transparent border-t-primary rounded-full animate-spin" />
      <UIcon name="i-lucide-layout-dashboard" class="absolute size-8 text-primary animate-bounce" />
    </div>

    <div class="mt-8 flex flex-col items-center gap-2 text-center">
      <h2 class="text-xl font-semibold tracking-tight animate-pulse">{{ t('common.loadingSystem') }}</h2>
      <p class="text-sm text-neutral-500 dark:text-neutral-400">{{ t('common.pleaseWait') }}</p>
    </div>

    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 size-[500px] bg-primary/5 rounded-full blur-3xl opacity-50 pulse-bg animate-pulse" />
  </div>
</template>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.pulse-bg {
  animation: pulse-bg 4s ease-in-out infinite;
}

@keyframes pulse-bg {
  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.3; }
  50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.5; }
}
</style>
