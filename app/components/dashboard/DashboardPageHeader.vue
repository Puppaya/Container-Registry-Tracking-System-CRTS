<script setup lang="ts">
defineProps<{
  loading?: boolean
}>()

const emit = defineEmits<{
  refresh: []
}>()

const { t } = useI18n()
</script>

<template>
  <div class="page-module-header">
    <div class="space-y-1 min-w-0">
      <h1 class="ds-headline-lg">
        {{ t('dashboard.pageTitle') }}
      </h1>
      <p class="ds-body-md">
        {{ t('dashboard.pageDescription') }}
      </p>
    </div>

    <div class="flex flex-wrap items-center gap-2 shrink-0">
      <UButton
        icon="i-lucide-refresh-cw"
        color="neutral"
        variant="outline"
        size="sm"
        :loading="loading"
        :aria-label="t('common.refresh')"
        @click="emit('refresh')"
      />
      <UButton
        :label="t('dashboard.containerRegistry')"
        icon="i-lucide-container"
        color="neutral"
        variant="outline"
        size="sm"
        to="/containers"
      />
      <UButton
        :label="t('dashboard.logMovement')"
        icon="i-lucide-plus"
        color="primary"
        size="sm"
        to="/containers/movements"
      />
    </div>
  </div>
</template>
