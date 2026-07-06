<script setup lang="ts">
import { REPORTS } from '~/utils/reports'
</script>

<template>
  <div class="ds-card">
    <div class="ds-card-header flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-2">
        <div class="ds-icon-badge">
          <UIcon name="i-lucide-file-bar-chart" class="size-4 text-white" />
        </div>
        <h2 class="ds-section-title">Report Catalog</h2>
      </div>
      <UButton
        label="Open Report Workspace"
        icon="i-lucide-arrow-right"
        color="primary"
        size="sm"
        to="/analytics/reports"
      />
    </div>

    <div class="ds-card-body">
      <div class="grid gap-4 md:grid-cols-2">
        <NuxtLink
          v-for="report in REPORTS"
          :key="report.key"
          :to="`/analytics/reports?report=${report.key}`"
          class="ds-report-tile block"
        >
          <div class="font-display font-semibold text-on-surface">{{ report.title }}</div>
          <p class="mt-1 ds-body-sm">{{ report.description }}</p>
          <div class="mt-3 flex gap-2">
            <UBadge color="success" variant="subtle" size="sm" class="font-mono">Excel</UBadge>
            <UBadge color="primary" variant="subtle" size="sm" class="font-mono">PDF</UBadge>
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
