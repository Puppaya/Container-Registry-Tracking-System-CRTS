<script setup lang="ts">
definePageMeta({
  layout: 'default',
  roles: ['Administrator', 'RegistryOfficer']
})

const { t } = useI18n()
const router = useRouter()

const breadcrumbItems = computed(() => [
  { label: t('containers.title'), to: '/containers' },
  { label: t('common.quickEntry') }
])

function onSuccess() {
  router.push('/containers')
}

function onCancel() {
  router.back()
}
</script>

<template>
  <UDashboardPanel id="container-create" grow>
    <template #header>
      <UDashboardNavbar :title="t('containers.quickAdd')">
        <template #leading>
          <div class="flex items-center gap-2">
            <UDashboardSidebarCollapse />
            <UButton icon="i-lucide-arrow-left" color="neutral" variant="ghost" to="/containers" />
          </div>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex min-h-full flex-col">
        <div class="flex-1 overflow-y-auto">
          <div class="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
            <div class="mb-6 space-y-3">
              <UBreadcrumb :items="breadcrumbItems" />
              <div>
                <h1 class="text-2xl font-bold tracking-tight font-display">{{ t('containers.quickAdd') }}</h1>
                <p class="mt-1 text-sm text-muted">{{ t('containers.quickAddDesc') }}</p>
              </div>
            </div>
            <UCard>
              <ContainersContainerForm @success="onSuccess" @cancel="onCancel" />
            </UCard>
          </div>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
