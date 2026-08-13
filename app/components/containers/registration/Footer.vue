<script setup lang="ts">
import { CRTS_APP_VERSION } from '~/utils/container-registration'
</script>

<template>
  <footer class="mt-auto border-t border-default bg-elevated/30 px-6 py-3">
    <div class="flex flex-col gap-2 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
      <div class="flex flex-wrap items-center gap-2 font-mono">
        <span>System Status:</span>
        <span class="inline-flex items-center gap-1.5 font-semibold text-success">
          <span class="size-1.5 rounded-full bg-success animate-pulse" />
          Operational
        </span>
        <span class="text-dimmed">|</span>
        <span>{{ CRTS_APP_VERSION }}</span>
      </div>

      <div class="flex items-center gap-4">
        <ULink to="#" class="text-muted hover:text-primary transition-colors">
          Documentation
        </ULink>
        <ULink to="#" class="text-muted hover:text-primary transition-colors">
          Support
        </ULink>
      </div>
    </div>
  </footer>
</template>
