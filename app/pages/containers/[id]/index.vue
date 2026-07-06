<script setup lang="ts">
import type { Container, ContainerProfile } from '~/types'

definePageMeta({
  layout: 'default',
  roles: ['Administrator', 'RegistryOfficer', 'SurveyTeam', 'Management']
})

const { t } = useI18n()
const route = useRoute()
const containerId = computed(() => Number(route.params.id))

const { user } = useUserSession()
const canWrite = computed(() =>
  ['Administrator', 'RegistryOfficer'].includes((user.value as { role?: string })?.role || '')
)

const { data: profileRes, pending, refresh } = useApi<ContainerProfile>(() =>
  `/api/containers/${containerId.value}/profile`
)

const profile = computed(() => profileRes.value?.data)
const container = computed(() => profile.value?.container)

const timelineRef = useTemplateRef<{ refresh: () => void }>('timeline')
const { sync: syncSurveys, syncing } = useSurveySync()

async function handleSyncSurveys() {
  if (!container.value) return

  await syncSurveys({
    containerId: container.value.containerId,
    onSuccess: () => {
      refresh()
      timelineRef.value?.refresh()
    }
  })
}

function goToEdit() {
  if (!container.value) return
  navigateTo(`/containers/${container.value.containerId}/edit`)
}
</script>

<template>
  <UDashboardPanel id="container-profile" grow class="ds-page">
    <template #header>
      <UDashboardNavbar
        :title="container?.containerNumber || t('containers.profile')"
        class="bg-surface border-b border-[color-mix(in_srgb,var(--ds-border)_80%,transparent)]"
      >
        <template #leading>
          <div class="flex items-center gap-2">
            <UDashboardSidebarCollapse />
            <UButton
              icon="i-lucide-arrow-left"
              color="neutral"
              variant="ghost"
              to="/containers"
            />
          </div>
        </template>

        <template #right>
          <UButton
            v-if="canWrite && container"
            :label="t('common.edit')"
            icon="i-lucide-pencil"
            color="primary"
            variant="outline"
            @click="goToEdit"
          />
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar v-if="container" class="bg-surface-container-low/50">
        <ContainersContainerProfileNav
          :container-id="container.containerId"
          :container-number="container.containerNumber"
        />
      </UDashboardToolbar>
    </template>

    <template #body>
      <div class="ds-page-content">
        <div v-if="pending" class="flex justify-center py-12">
          <UIcon name="i-lucide-loader-circle" class="size-8 animate-spin text-primary-container" />
        </div>

        <template v-else-if="profile && container">
          <div class="ds-profile-hero">
            <div class="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p class="ds-profile-hero-label">Container Profile</p>
                <h1 class="ds-profile-hero-title">{{ container.containerNumber }}</h1>
                <div class="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 ds-body-sm">
                  <span class="inline-flex items-center gap-1">
                    <UIcon name="i-lucide-box" class="size-3.5" />
                    {{ container.isoType }}
                  </span>
                  <span class="font-mono">{{ container.containerSize }}ft</span>
                  <span>{{ container.containerCategory }}</span>
                  <span class="inline-flex items-center gap-1">
                    <UIcon name="i-lucide-building-2" class="size-3.5" />
                    {{ container.owner }}
                  </span>
                </div>
              </div>
              <ContainersContainerStatusBadge :status="container.status" />
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div class="ds-section-card">
              <div class="ds-section-header">
                <div class="ds-icon-badge">
                  <UIcon name="i-lucide-info" class="size-4 text-white" />
                </div>
                <h2 class="ds-section-title">General Information</h2>
              </div>
              <div class="ds-section-body">
                <ContainersProfileContainerGeneralInfo :container="container" />
              </div>
            </div>

            <div class="ds-section-card">
              <div class="ds-section-header">
                <div class="ds-icon-badge">
                  <UIcon name="i-lucide-activity" class="size-4 text-white" />
                </div>
                <h2 class="ds-section-title">Current Status</h2>
              </div>
              <div class="ds-section-body">
                <ContainersProfileContainerStatusCard
                  :current-status="profile.currentStatus"
                  :event-count="profile.eventCount"
                />
              </div>
            </div>

            <div class="ds-section-card">
              <div class="ds-section-header">
                <div class="ds-icon-badge">
                  <UIcon name="i-lucide-search-check" class="size-4 text-white" />
                </div>
                <h2 class="ds-section-title">Survey Summary</h2>
              </div>
              <div class="ds-section-body">
                <ContainersProfileContainerSurveySummary
                  :survey="profile.latestSurvey"
                  :container-id="container.containerId"
                  :can-sync="canWrite"
                  :syncing="syncing"
                  :data-source="profile.surveyDataSource"
                  @sync="handleSyncSurveys"
                />
              </div>
            </div>

            <div class="ds-section-card">
              <div class="ds-section-header justify-between">
                <div class="flex items-center gap-2">
                  <div class="ds-icon-badge">
                    <UIcon name="i-lucide-truck" class="size-4 text-white" />
                  </div>
                  <h2 class="ds-section-title">Movement Summary</h2>
                </div>
                <UButton
                  :label="t('common.viewMovements')"
                  icon="i-lucide-truck"
                  variant="ghost"
                  size="sm"
                  color="primary"
                  :to="`/containers/${container.containerId}/movements`"
                />
              </div>
              <div class="ds-section-body">
                <ContainersProfileContainerMovementSummary :movements="profile.recentMovements" />
              </div>
            </div>

            <div class="ds-section-card lg:col-span-2">
              <div class="ds-section-header">
                <div class="ds-icon-badge">
                  <UIcon name="i-lucide-paperclip" class="size-4 text-white" />
                </div>
                <h2 class="ds-section-title">Documents</h2>
              </div>
              <div class="ds-section-body">
                <ContainersProfileContainerDocumentsSummary
                  :container-id="container.containerId"
                  :documents="profile.documents"
                  :document-count="profile.documentCount"
                  :can-write="canWrite"
                />
              </div>
            </div>
          </div>

          <div class="ds-section-card">
            <div class="ds-section-header justify-between">
              <div class="flex items-center gap-2">
                <div class="ds-icon-badge">
                  <UIcon name="i-lucide-history" class="size-4 text-white" />
                </div>
                <h2 class="ds-section-title">Lifecycle Timeline</h2>
              </div>
              <UButton
                :label="t('common.viewFullLifecycle')"
                icon="i-lucide-history"
                variant="ghost"
                size="sm"
                color="primary"
                :to="`/containers/${container.containerId}/lifecycle`"
              />
            </div>
            <div class="ds-section-body">
              <ContainersContainerTimeline
                ref="timeline"
                :container-id="container.containerId"
                :can-write="canWrite"
              />
            </div>
          </div>
        </template>

        <UAlert
          v-else
          color="error"
          icon="i-lucide-alert-circle"
          :title="t('containers.notFound')"
          :description="t('containers.notFoundDesc')"
          class="rounded-md"
        />
      </div>
    </template>
  </UDashboardPanel>
</template>
