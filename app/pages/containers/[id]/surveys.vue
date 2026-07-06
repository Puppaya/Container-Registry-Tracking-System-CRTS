<script setup lang="ts">
import type { Container, ContainerSurvey } from '~/types'
import { formatSurveyDate, getSurveyResultColor } from '~/utils/survey-inspection'

definePageMeta({
  layout: 'default',
  roles: ['Administrator', 'RegistryOfficer', 'SurveyTeam', 'Management']
})

const { t } = useI18n()
const route = useRoute()
const containerId = computed(() => Number(route.params.id))

const { user } = useUserSession()
const canSync = computed(() =>
  ['Administrator', 'RegistryOfficer'].includes((user.value as { role?: string })?.role || '')
)

function openDetail(record: ContainerSurvey) {
  navigateTo(`/survey/inspections/${record.surveyId}`)
}

const { data: surveyRes, pending, refresh } = useApi<{
  container: Container
  surveys: ContainerSurvey[]
  dataSource: 'database' | 'mock'
}>(() => `/api/containers/${containerId.value}/surveys`)

const container = computed(() => surveyRes.value?.data?.container)
const surveys = computed(() => surveyRes.value?.data?.surveys || [])
const dataSource = computed(() => surveyRes.value?.data?.dataSource || 'database')

const { sync: syncSurveys, syncing } = useSurveySync()

async function handleSyncSurveys() {
  await syncSurveys({
    containerId: containerId.value,
    onSuccess: refresh
  })
}
</script>

<template>
  <UDashboardPanel id="container-surveys" grow>
    <template #header>
      <UDashboardNavbar :title="container ? `${t('containers.surveys')} — ${container.containerNumber}` : t('containers.surveys')">
        <template #leading>
          <div class="flex items-center gap-2">
            <UDashboardSidebarCollapse />
            <UButton
              icon="i-lucide-arrow-left"
              color="neutral"
              variant="ghost"
              :to="`/containers/${containerId}`"
            />
          </div>
        </template>

        <template #right>
          <UButton
            v-if="canSync"
            :label="t('common.syncSurvey')"
            icon="i-lucide-refresh-cw"
            :loading="syncing"
            :disabled="syncing"
            @click="handleSyncSurveys"
          />
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
      <UDashboardPanelContent class="space-y-4 p-4 md:p-6">
        <UAlert
          v-if="dataSource === 'mock'"
          color="info"
          icon="i-lucide-info"
          :title="t('survey.containerMockAlert')"
          :description="t('survey.containerMockAlertDesc')"
        />

        <AppEmptyState
          v-if="!pending && surveys.length === 0"
          icon="i-lucide-clipboard-list"
          :title="t('survey.empty')"
          :description="t('survey.emptyHint')"
          :action-label="canSync ? t('common.syncSurvey') : undefined"
          action-icon="i-lucide-refresh-cw"
          action-variant="outline"
          :action-loading="syncing"
          @action="handleSyncSurveys"
        />

        <UTable
          v-else
          :data="surveys"
          :columns="[
            { accessorKey: 'surveyReferenceNo', header: 'Reference No.' },
            { accessorKey: 'surveyDate', header: 'Date' },
            { accessorKey: 'inspector', header: 'Inspector' },
            { accessorKey: 'result', header: 'Result' },
            { accessorKey: 'damageSummary', header: 'Damage' },
            { id: 'actions', header: '' }
          ]"
          :loading="pending"
          :ui="{
            base: 'table-fixed border-separate border-spacing-0',
            thead: '[&>tr]:bg-elevated/50',
            th: 'py-2 border-y border-default',
            td: 'py-2 border-b border-default'
          }"
        >
          <template #surveyReferenceNo-cell="{ row }">
            <div class="flex items-center gap-2">
              <span class="font-mono text-sm">{{ (row.original as unknown as ContainerSurvey).surveyReferenceNo }}</span>
              <UBadge
                v-if="(row.original as unknown as ContainerSurvey).isMock"
                color="neutral"
                variant="subtle"
                size="sm"
              >
                Mock
              </UBadge>
            </div>
          </template>

          <template #surveyDate-cell="{ row }">
            <span class="text-sm text-muted">{{ formatSurveyDate((row.original as unknown as ContainerSurvey).surveyDate) }}</span>
          </template>

          <template #inspector-cell="{ row }">
            <span class="text-sm">{{ (row.original as unknown as ContainerSurvey).inspector || '—' }}</span>
          </template>

          <template #result-cell="{ row }">
            <UBadge
              :color="getSurveyResultColor((row.original as unknown as ContainerSurvey).result)"
              variant="subtle"
              size="sm"
            >
              {{ (row.original as unknown as ContainerSurvey).result }}
            </UBadge>
          </template>

          <template #damageSummary-cell="{ row }">
            <span class="text-sm text-muted truncate block max-w-xs">
              {{ (row.original as unknown as ContainerSurvey).damageSummary || '—' }}
            </span>
          </template>

          <template #actions-cell="{ row }">
            <UButton
              icon="i-lucide-eye"
              color="neutral"
              variant="ghost"
              size="sm"
              @click="openDetail(row.original as unknown as ContainerSurvey)"
            />
          </template>
        </UTable>
      </UDashboardPanelContent>
    </template>
  </UDashboardPanel>
</template>
