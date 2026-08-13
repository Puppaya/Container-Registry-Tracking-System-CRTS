<script setup lang="ts">
import type { Container } from '~/types'
import { formatDisplayDate } from '~/utils/date-format'

definePageMeta({
  layout: 'default',
  roles: ['Administrator', 'RegistryOfficer', 'SurveyTeam', 'Management']
})

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const page = ref(Number(route.query.page) || 1)
const pageSize = ref(Number(route.query.pageSize) || 10)

const filters = reactive({
  search: (route.query.q as string) || (route.query.search as string) || '',
  status: (route.query.status as string) || 'all',
  owner: (route.query.owner as string) || '',
  isoType: (route.query.isoType as string) || '',
  containerCategory: (route.query.containerCategory as string) || '',
  containerSize: (route.query.containerSize as string) || 'all',
  surveyStatus: (route.query.surveyStatus as string) || 'all',
  registrationDateFrom: (route.query.registrationDateFrom as string) || '',
  registrationDateTo: (route.query.registrationDateTo as string) || ''
})

function buildQueryParams() {
  const params = new URLSearchParams({
    page: page.value.toString(),
    pageSize: pageSize.value.toString()
  })

  if (filters.search) params.set('search', filters.search)
  if (filters.status && filters.status !== 'all') params.set('status', filters.status)
  if (filters.owner) params.set('owner', filters.owner)
  if (filters.isoType) params.set('isoType', filters.isoType)
  if (filters.containerCategory) params.set('containerCategory', filters.containerCategory)
  if (filters.containerSize && filters.containerSize !== 'all') params.set('containerSize', filters.containerSize)
  if (filters.surveyStatus && filters.surveyStatus !== 'all') params.set('surveyStatus', filters.surveyStatus)
  if (filters.registrationDateFrom) params.set('registrationDateFrom', filters.registrationDateFrom)
  if (filters.registrationDateTo) params.set('registrationDateTo', filters.registrationDateTo)

  return params.toString()
}

const apiUrl = computed(() => `/api/containers?${buildQueryParams()}`)

const { data: containers, pending, refresh } = useApi<any>(() => apiUrl.value)

function applyFilters() {
  page.value = 1
  router.replace({ query: Object.fromEntries(new URLSearchParams(buildQueryParams())) })
  refresh()
}

function resetFilters() {
  filters.search = ''
  filters.status = 'all'
  filters.owner = ''
  filters.isoType = ''
  filters.containerCategory = ''
  filters.containerSize = 'all'
  filters.surveyStatus = 'all'
  filters.registrationDateFrom = ''
  filters.registrationDateTo = ''
  page.value = 1
  router.replace({ path: '/containers/search' })
  refresh()
}

watch(page, () => {
  router.replace({ query: Object.fromEntries(new URLSearchParams(buildQueryParams())) })
})
</script>

<template>
  <UDashboardPanel id="container-search" grow>
    <template #header>
      <UDashboardNavbar :title="t('containers.advancedSearch')">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton
            :label="t('nav.items.qrScan')"
            icon="i-lucide-qr-code"
            color="neutral"
            variant="outline"
            to="/containers/scan"
          />
          <UButton
            :label="t('common.registry')"
            icon="i-lucide-container"
            color="neutral"
            variant="ghost"
            to="/containers"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UDashboardPanelContent scrollable>
        <UCard class="mb-4">
          <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <UFormField :label="t('common.search')">
              <UInput
                v-model="filters.search"
                icon="i-lucide-search"
                placeholder="ເລກຕູ / ເຈົ້າຂອງ / QR..."
                @keyup.enter="applyFilters"
              />
            </UFormField>

            <UFormField :label="t('containers.filters.status')">
              <USelect
                v-model="filters.status"
                :items="[
                  { label: 'ທຸກສະຖານະ', value: 'all' },
                  { label: 'Active', value: 'Active' },
                  { label: 'Inactive', value: 'Inactive' }
                ]"
              />
            </UFormField>

            <UFormField :label="t('containers.filters.owner')">
              <UInput v-model="filters.owner" placeholder="Owner name" />
            </UFormField>

            <UFormField :label="t('containers.columns.isoType')">
              <UInput v-model="filters.isoType" placeholder="22G1" />
            </UFormField>

            <UFormField :label="t('containers.columns.category')">
              <UInput v-model="filters.containerCategory" placeholder="Dry, Reefer..." />
            </UFormField>

            <UFormField :label="t('containers.columns.size')">
              <USelect
                v-model="filters.containerSize"
                :items="[
                  { label: 'ທຸກຂະໜາດ', value: 'all' },
                  { label: '20', value: '20' },
                  { label: '40', value: '40' },
                  { label: '45', value: '45' }
                ]"
              />
            </UFormField>

            <UFormField :label="t('containers.filters.survey')">
              <USelect
                v-model="filters.surveyStatus"
                :items="[
                  { label: 'ທັງໝົດ', value: 'all' },
                  { label: 'ມີ Survey', value: 'surveyed' },
                  { label: 'ຍັງບໍ່ Survey', value: 'not_surveyed' },
                  { label: 'Pass', value: 'pass' },
                  { label: 'Conditional', value: 'conditional' }
                ]"
              />
            </UFormField>

            <UFormField :label="t('containers.filters.regFrom')">
              <AppDateInput v-model="filters.registrationDateFrom" />
            </UFormField>

            <UFormField :label="t('containers.filters.regTo')">
              <AppDateInput v-model="filters.registrationDateTo" />
            </UFormField>
          </div>

          <div class="mt-4 flex flex-wrap gap-2">
            <UButton :label="t('common.search')" icon="i-lucide-search" @click="applyFilters" />
            <UButton :label="t('common.clear')" color="neutral" variant="outline" @click="resetFilters" />
          </div>
        </UCard>

        <UCard>
          <AppEmptyState
            v-if="!pending && !(containers?.data?.data?.length)"
            variant="inline"
            icon="i-lucide-search-x"
            :title="t('emptyState.search.title')"
            :description="t('emptyState.search.description')"
          />
          <UTable
            v-else
            :data="containers?.data?.data || []"
            :loading="pending"
            :columns="[
              { accessorKey: 'containerNumber', header: 'Container No.' },
              { accessorKey: 'isoType', header: 'ISO' },
              { accessorKey: 'containerSize', header: 'Size' },
              { accessorKey: 'owner', header: 'Owner' },
              { accessorKey: 'status', header: 'Status' },
              { accessorKey: 'registrationDate', header: 'Registered' }
            ]"
            :ui="{
              base: 'table-fixed border-separate border-spacing-0',
              thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
              tbody: '[&>tr]:last:[&>td]:border-b-0',
              th: 'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
              td: 'border-b border-default'
            }"
          >
            <template #containerNumber-cell="{ row }">
              <NuxtLink
                :to="`/containers/${(row.original as unknown as Container).containerId}`"
                class="font-mono font-medium text-primary hover:underline"
              >
                {{ (row.original as unknown as Container).containerNumber }}
              </NuxtLink>
            </template>

            <template #status-cell="{ row }">
              <ContainersContainerStatusBadge :status="(row.original as unknown as Container).status" />
            </template>

            <template #registrationDate-cell="{ row }">
              <span class="text-sm text-neutral-500">
                {{ formatDisplayDate((row.original as unknown as Container).registrationDate) }}
              </span>
            </template>
          </UTable>

          <div class="flex items-center justify-between gap-3 border-t border-default p-4 text-sm">
            <div class="text-neutral-500">
              {{ containers?.data?.meta?.total || 0 }} container(s)
            </div>

            <UPagination
              v-model:page="page"
              :total="containers?.data?.meta?.total || 0"
              :items-per-page="pageSize"
            />
          </div>
        </UCard>
      </UDashboardPanelContent>
    </template>
  </UDashboardPanel>
</template>
