<script setup lang="ts">
const props = defineProps<{
  containerId: number
  containerNumber?: string
}>()

const route = useRoute()

const { t } = useI18n()

const tabs = computed(() => [
  { label: t('nav.profileTabs.overview'), to: `/containers/${props.containerId}`, icon: 'i-lucide-layout-grid' },
  { label: t('nav.profileTabs.lifecycle'), to: `/containers/${props.containerId}/lifecycle`, icon: 'i-lucide-history' },
  { label: t('nav.profileTabs.movements'), to: `/containers/${props.containerId}/movements`, icon: 'i-lucide-truck' },
  { label: t('nav.profileTabs.surveys'), to: `/containers/${props.containerId}/surveys`, icon: 'i-lucide-search-check' },
  { label: t('nav.profileTabs.documents'), to: `/containers/${props.containerId}/documents`, icon: 'i-lucide-paperclip' }
])

function isActive(tabTo: string) {
  return route.path === tabTo
}
</script>

<template>
  <div class="flex flex-col gap-3 w-full">
    <nav class="flex items-center gap-1.5 text-sm">
      <NuxtLink to="/containers" class="ds-body-sm hover:text-primary transition-colors">{{ t('common.registry') }}</NuxtLink>
      <UIcon name="i-lucide-chevron-right" class="size-3.5 shrink-0 text-on-surface-variant" />
      <span v-if="containerNumber" class="font-mono font-medium text-primary">{{ containerNumber }}</span>
    </nav>

    <div class="flex flex-wrap gap-1 border-b border-[color-mix(in_srgb,var(--ds-border)_80%,transparent)] pb-0">
      <NuxtLink
        v-for="tab in tabs"
        :key="tab.to"
        :to="tab.to"
        class="ds-nav-tab"
        :class="isActive(tab.to) ? 'ds-nav-tab--active' : 'ds-nav-tab--inactive'"
      >
        <UIcon :name="tab.icon" class="size-4 shrink-0" />
        {{ tab.label }}
      </NuxtLink>
    </div>
  </div>
</template>
