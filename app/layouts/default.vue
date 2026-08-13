<script setup lang="ts">
const { navGroups, commandGroups } = useAppNavigation()
const { isHubMode } = useHubMode()

const open = ref(false)
</script>

<template>
  <UDashboardGroup
    unit="rem"
    :class="{ 'crts-layout--hub': isHubMode }"
  >
    <UDashboardSidebar
      id="default"
      v-model:open="open"
      collapsible
      resizable
      class="crts-sidebar border-r border-[color-mix(in_srgb,var(--ds-border)_80%,transparent)] bg-surface-container-low/80 backdrop-blur-sm"
      :ui="{ footer: 'lg:border-t lg:border-default' }"
    >
      <template #header="{ collapsed }">
        <TeamsMenu :collapsed="collapsed" />
      </template>

      <template #default="{ collapsed }">
        <UDashboardSearchButton :collapsed="collapsed" class="bg-transparent ring-default" />

        <ContainersContainerQuickSearch :collapsed="collapsed" />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="navGroups"
          orientation="vertical"
          tooltip
          popover
        />
      </template>

      <template #footer="{ collapsed }">
        <div class="flex flex-col gap-1">
          <LocaleSwitcher :collapsed="collapsed" />
          <UserMenu :collapsed="collapsed" />
        </div>
      </template>
    </UDashboardSidebar>

    <UDashboardSearch :groups="commandGroups as any" />

    <slot />
  </UDashboardGroup>
</template>

<style scoped>
:global(.crts-layout--hub) {
  min-height: 100%;
  height: 100%;
}
</style>
