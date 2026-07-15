<script setup lang="ts">
defineProps<{
  collapsed?: boolean
}>()

const { t } = useI18n()
</script>

<template>
  <NuxtLink
    to="/dashboard"
    class="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-elevated/50 transition-colors"
    :class="collapsed ? 'justify-center' : ''"
  >
    <img
      src="/favicon.svg"
      alt="CRTS"
      class="size-8 shrink-0 rounded-lg shadow-sm shadow-primary/20"
    >

    <div v-if="!collapsed" class="min-w-0 flex-1">
      <p class="text-sm font-bold tracking-tight text-slate-900 dark:text-white truncate">
        {{ t('app.name') }}
      </p>
      <p class="text-[10px] leading-tight text-slate-500 dark:text-slate-400 truncate">
        {{ t('app.subtitle') }}
      </p>
    </div>
  </NuxtLink>
</template>
