<script setup lang="ts">
import type { MovementSummary } from '~/types'

defineProps<{
  summary: MovementSummary | null | undefined
  loading?: boolean
}>()
</script>

<template>
  <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
    <UCard :ui="{ body: 'p-4' }">
      <p class="text-sm text-muted">Total Movements</p>
      <p class="text-2xl font-semibold">{{ loading ? '…' : (summary?.totalMovements ?? 0) }}</p>
    </UCard>
    <UCard :ui="{ body: 'p-4' }">
      <p class="text-sm text-muted">Last 7 Days</p>
      <p class="text-2xl font-semibold">{{ loading ? '…' : (summary?.recentMovements ?? 0) }}</p>
    </UCard>
    <UCard :ui="{ body: 'p-4' }">
      <div class="flex items-center gap-2 text-sm text-muted mb-1">
        <UIcon name="i-lucide-log-in" class="size-4 text-success" />
        Gate In
      </div>
      <p class="text-2xl font-semibold">{{ loading ? '…' : (summary?.gateInCount ?? 0) }}</p>
    </UCard>
    <UCard :ui="{ body: 'p-4' }">
      <div class="flex items-center gap-2 text-sm text-muted mb-1">
        <UIcon name="i-lucide-log-out" class="size-4 text-error" />
        Gate Out
      </div>
      <p class="text-2xl font-semibold">{{ loading ? '…' : (summary?.gateOutCount ?? 0) }}</p>
    </UCard>
    <UCard :ui="{ body: 'p-4' }">
      <div class="flex items-center gap-2 text-sm text-muted mb-1">
        <UIcon name="i-lucide-truck" class="size-4" />
        Relocation
      </div>
      <p class="text-2xl font-semibold">{{ loading ? '…' : (summary?.relocationCount ?? 0) }}</p>
    </UCard>
  </div>
</template>
