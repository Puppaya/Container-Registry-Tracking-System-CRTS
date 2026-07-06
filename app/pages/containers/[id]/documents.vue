<script setup lang="ts">
import type { Container, ContainerDocument } from '~/types'
import { formatEventDate } from '~/utils/container-events'
import { getDocumentDownloadUrl } from '~/utils/documents'

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

const { data: docsRes, pending, refresh } = useApi<{
  container: Container
  documents: ContainerDocument[]
}>(() => `/api/containers/${containerId.value}/documents`)

const container = computed(() => docsRes.value?.data?.container)
const documents = computed(() => docsRes.value?.data?.documents || [])

const { execute: runDelete, loading: deleting } = useApiAction()

const confirmOpen = ref(false)
const deleteTarget = ref<ContainerDocument | null>(null)

function startDelete(doc: ContainerDocument) {
  deleteTarget.value = doc
  confirmOpen.value = true
}

async function confirmDelete() {
  if (!deleteTarget.value) return

  const { error } = await runDelete(
    () => $fetch(`/api/containers/${containerId.value}/documents/${deleteTarget.value!.documentId}`, {
      method: 'DELETE'
    }) as Promise<any>,
    { successMessage: 'ລົບເອກະສານສຳເລັດ' }
  )

  if (!error) {
    refresh()
  }

  confirmOpen.value = false
  deleteTarget.value = null
}

const columns = computed(() => [
  { accessorKey: 'fileName', header: t('containers.documents.fileName') },
  { accessorKey: 'documentType', header: t('containers.documents.type') },
  { accessorKey: 'uploadedBy', header: t('containers.documents.uploadedBy') },
  { accessorKey: 'uploadedDate', header: t('containers.documents.date') },
  { id: 'actions', header: '' }
])
</script>

<template>
  <UDashboardPanel id="container-documents" grow>
    <template #header>
      <UDashboardNavbar :title="container ? `${t('containers.documents')} — ${container.containerNumber}` : t('containers.documents')">
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
            v-if="canWrite"
            :label="t('common.upload')"
            icon="i-lucide-upload"
            :to="`/containers/${containerId}/documents/upload`"
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
      <ConfirmPanel
        v-model:open="confirmOpen"
        :title="t('containers.documents.deleteTitle')"
        :description="t('containers.documents.deleteDesc', { fileName: deleteTarget?.fileName })"
        :loading="deleting"
        @confirm="confirmDelete"
        @close="confirmOpen = false"
      />

      <UDashboardPanelContent class="p-4 md:p-6">
        <UCard>
          <AppEmptyState
            v-if="!pending && documents.length === 0"
            variant="inline"
            icon="i-lucide-paperclip"
            :title="t('containers.documents.empty')"
            :action-label="canWrite ? t('containers.uploadDocument') : undefined"
            :action-to="canWrite ? `/containers/${containerId}/documents/upload` : undefined"
            action-icon="i-lucide-upload"
          />
          <UTable
            v-else
            :data="documents"
            :columns="columns"
            :loading="pending"
            :ui="{
              base: 'table-fixed border-separate border-spacing-0',
              thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
              tbody: '[&>tr]:last:[&>td]:border-b-0',
              th: 'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
              td: 'border-b border-default'
            }"
          >
            <template #uploadedDate-cell="{ row }">
              <span class="text-sm text-neutral-500">
                {{ formatEventDate((row.original as unknown as ContainerDocument).uploadedDate) }}
              </span>
            </template>

            <template #actions-cell="{ row }">
              <div class="flex items-center justify-end gap-1">
                <UButton
                  icon="i-lucide-download"
                  color="neutral"
                  variant="ghost"
                  size="xs"
                  :to="getDocumentDownloadUrl(containerId, (row.original as unknown as ContainerDocument).documentId)"
                  target="_blank"
                />
                <UButton
                  v-if="canWrite"
                  icon="i-lucide-trash"
                  color="error"
                  variant="ghost"
                  size="xs"
                  @click="startDelete(row.original as unknown as ContainerDocument)"
                />
              </div>
            </template>
          </UTable>
        </UCard>
      </UDashboardPanelContent>
    </template>
  </UDashboardPanel>
</template>
