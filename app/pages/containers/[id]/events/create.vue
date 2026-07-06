<script setup lang="ts">
import type { Container } from '~/types'

definePageMeta({
  layout: 'default',
  roles: ['Administrator', 'RegistryOfficer']
})

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const containerId = computed(() => Number(route.params.id))

const { data: containerRes } = useApi<Container>(() =>
  `/api/containers/${containerId.value}`
)

const container = computed(() => containerRes.value?.data)

function onSuccess() {
  router.push(`/containers/${containerId.value}/lifecycle`)
}

function onCancel() {
  router.back()
}
</script>

<template>
  <UDashboardPanel id="container-event-create" grow>
    <template #header>
      <UDashboardNavbar :title="container ? `${t('containers.addEvent')} — ${container.containerNumber}` : t('containers.addEvent')">
        <template #leading>
          <div class="flex items-center gap-2">
            <UDashboardSidebarCollapse />
            <UButton
              icon="i-lucide-arrow-left"
              color="neutral"
              variant="ghost"
              :to="`/containers/${containerId}/lifecycle`"
            />
          </div>
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar v-if="container">
        <ContainersContainerProfileNav
          :container-id="container.containerId"
          :container-number="container.containerNumber"
        />
      </UDashboardToolbar>
    </template>

    <template #body>
      <div class="mx-auto max-w-2xl p-4 md:p-6">
        <UCard>
          <ContainersContainerEventForm
            :container-id="containerId"
            @success="onSuccess"
            @cancel="onCancel"
          />
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>
