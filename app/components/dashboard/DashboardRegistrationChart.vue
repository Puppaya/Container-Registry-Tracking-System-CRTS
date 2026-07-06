<script setup lang="ts">
import type { DashboardSummary } from '~/types'

const props = defineProps<{
  summary?: DashboardSummary | null
  pending?: boolean
}>()

const maxCount = computed(() => {
  const trend = props.summary?.registrationTrend || []
  return Math.max(...trend.map(item => item.count), 1)
})
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-chart-column" class="size-5 text-muted" />
        <h2 class="font-semibold">Registration Trend (6 months)</h2>
      </div>
    </template>

    <div v-if="pending" class="space-y-3">
      <USkeleton v-for="i in 6" :key="i" class="h-8" />
    </div>

    <div v-else class="grid grid-cols-6 gap-3 items-end min-h-48">
      <div
        v-for="item in summary?.registrationTrend || []"
        :key="item.label"
        class="flex flex-col items-center gap-2"
      >
        <span class="text-xs font-medium">{{ item.count }}</span>
        <div
          class="w-full rounded-t-md bg-primary/80 transition-all"
          :style="{ height: `${Math.max((item.count / maxCount) * 120, 4)}px` }"
        />
        <span class="text-xs text-muted">{{ item.label }}</span>
      </div>
    </div>
  </UCard>
</template>
