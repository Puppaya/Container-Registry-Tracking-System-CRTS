<script setup lang="ts">
import { CRTS_DASHBOARD_VERSION } from '~/utils/dashboard-ui'
</script>

<template>
  <footer class="border-t border-[#e4e2ef]/80 bg-surface-container-low px-4 py-3 sm:px-6">
    <div class="flex flex-col gap-2 ds-body-sm sm:flex-row sm:items-center sm:justify-between">
      <div class="flex flex-wrap items-center gap-2">
        <span class="font-display font-semibold text-on-surface">CRTS</span>
        <span class="text-[#e4e2ef]">·</span>
        <span class="inline-flex items-center gap-1.5 font-mono text-xs font-medium text-success">
          <span class="size-1.5 rounded-full bg-success animate-pulse" />
          Operational
        </span>
        <span class="text-[#e4e2ef]">·</span>
        <span class="font-mono text-xs">{{ CRTS_DASHBOARD_VERSION }}</span>
      </div>

      <p class="font-mono text-xs text-on-surface-variant">
        Container Registry & Tracking System
      </p>
    </div>
  </footer>
</template>
