<script setup lang="ts">
import { DASHBOARD_PALETTE } from '~/utils/dashboard-ui'

const { t } = useI18n()
const open = ref(false)
const { alerts, loading, totalCount, refresh } = useDashboardAttention()

watch(open, (isOpen) => {
  if (isOpen) {
    refresh()
  }
})
</script>

<template>
  <ClientOnly>
    <UPopover v-model:open="open" :content="{ align: 'end', side: 'bottom', collisionPadding: 12 }">
      <UButton
        icon="i-lucide-bell"
        color="neutral"
        variant="ghost"
        :aria-label="t('common.notifications')"
        :aria-expanded="open"
        class="relative"
      >
        <span
          v-if="totalCount > 0"
          class="absolute top-2 right-2 size-2 rounded-full bg-error-500"
          aria-hidden="true"
        />
      </UButton>

      <template #content>
        <div class="w-80 max-w-[calc(100vw-2rem)]">
          <div class="flex items-center justify-between gap-3 border-b border-default px-4 py-3">
            <h3 class="text-sm font-semibold text-on-surface">
              {{ t('common.notifications') }}
            </h3>
            <UBadge
              v-if="totalCount > 0"
              color="error"
              variant="subtle"
              size="sm"
            >
              {{ totalCount }}
            </UBadge>
          </div>

          <div class="max-h-80 overflow-y-auto p-2">
            <div v-if="loading" class="space-y-2 p-2">
              <USkeleton v-for="i in 3" :key="i" class="h-16 rounded-md" />
            </div>

            <template v-else-if="alerts.length">
              <NuxtLink
                v-for="alert in alerts"
                :key="alert.id"
                :to="alert.actionTo"
                class="block rounded-md border border-[color-mix(in_srgb,var(--ds-border)_80%,transparent)] p-3 transition-colors hover:bg-elevated"
                :class="DASHBOARD_PALETTE.status[alert.severity].bg"
                @click="open = false"
              >
                <div class="flex items-start gap-2">
                  <UIcon
                    name="i-lucide-alert-circle"
                    class="mt-0.5 size-4 shrink-0"
                    :class="DASHBOARD_PALETTE.status[alert.severity].text"
                  />
                  <div class="min-w-0 space-y-1">
                    <p class="truncate font-mono text-sm font-semibold text-on-surface">
                      {{ alert.title }}
                    </p>
                    <p class="text-xs leading-relaxed text-on-surface-variant">
                      {{ alert.description }}
                    </p>
                  </div>
                </div>
              </NuxtLink>
            </template>

            <AppEmptyState
              v-else
              variant="positive"
              icon="i-lucide-check-circle"
              :title="t('dashboard.attention.healthy')"
              class="py-6"
            />
          </div>

          <div
            v-if="totalCount > alerts.length"
            class="border-t border-default px-4 py-2.5"
          >
            <NuxtLink
              to="/containers/search?status=Inactive"
              class="text-xs font-medium text-primary hover:text-primary-container transition-colors"
              @click="open = false"
            >
              {{ t('dashboard.attention.viewAll', { count: totalCount }) }}
            </NuxtLink>
          </div>
        </div>
      </template>
    </UPopover>

    <template #fallback>
      <UButton
        icon="i-lucide-bell"
        color="neutral"
        variant="ghost"
        :aria-label="t('common.notifications')"
        disabled
      />
    </template>
  </ClientOnly>
</template>
