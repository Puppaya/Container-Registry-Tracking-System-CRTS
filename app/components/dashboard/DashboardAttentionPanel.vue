<script setup lang="ts">
import type { AttentionAlert } from '~/utils/dashboard-ui'
import { DASHBOARD_PALETTE } from '~/utils/dashboard-ui'

defineProps<{
  alerts: AttentionAlert[]
  totalCount: number
  loading?: boolean
}>()

const { t } = useI18n()
</script>

<template>
  <div class="ds-card flex h-full flex-col">
    <div class="ds-card-header flex items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <div class="ds-attention-header-icon">
          <UIcon name="i-lucide-triangle-alert" class="size-5" />
        </div>
        <div>
          <h2 class="font-display text-base font-semibold text-on-surface">
            {{ t('dashboard.attention.title') }}
          </h2>
          <p class="ds-body-sm mt-0.5">
            {{ t('dashboard.attention.subtitle') }}
          </p>
        </div>
      </div>
    </div>

    <div class="flex-1 space-y-3 p-4">
      <div v-if="loading" class="space-y-3">
        <USkeleton v-for="i in 3" :key="i" class="h-20 rounded-md" />
      </div>

      <template v-else-if="alerts.length">
        <div
          v-for="alert in alerts"
          :key="alert.id"
          class="rounded-md border border-[#e4e2ef]/80 p-3.5"
          :class="DASHBOARD_PALETTE.status[alert.severity].bg"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0 space-y-1.5">
              <div class="flex items-center gap-2 flex-wrap">
                <UIcon
                  name="i-lucide-alert-circle"
                  class="size-4 shrink-0"
                  :class="DASHBOARD_PALETTE.status[alert.severity].text"
                />
                <UBadge
                  :color="DASHBOARD_PALETTE.status[alert.severity].badge"
                  variant="subtle"
                  size="sm"
                  class="capitalize font-mono"
                >
                  {{ alert.severity }}
                </UBadge>
                <span class="font-mono text-sm font-semibold text-on-surface truncate">
                  {{ alert.title }}
                </span>
              </div>
              <p class="ds-body-sm leading-relaxed pl-6">
                {{ alert.description }}
              </p>
            </div>
          </div>

          <UButton
            :label="alert.actionLabel"
            :to="alert.actionTo"
            size="xs"
            color="primary"
            variant="outline"
            class="mt-3 ml-6"
          />
        </div>
      </template>

      <AppEmptyState
        v-else
        variant="positive"
        icon="i-lucide-check-circle"
        :title="t('dashboard.attention.healthy')"
      />
    </div>

    <div v-if="totalCount > alerts.length" class="border-t border-[#e4e2ef]/80 px-4 py-3">
      <NuxtLink
        to="/containers/search?status=Inactive"
        class="font-mono text-xs font-medium text-primary-container hover:text-primary transition-colors"
      >
        {{ t('dashboard.attention.viewAll', { count: totalCount }) }}
      </NuxtLink>
    </div>
  </div>
</template>
