<script setup lang="ts">
import type { ContainerDocument } from '~/types'
import { formatEventDate } from '~/utils/container-events'
import {
  getDocumentDownloadUrl,
  getDocumentPreviewUrl,
  isImageDocument
} from '~/utils/documents'

defineProps<{
  containerId: number
  documents: ContainerDocument[]
  documentCount: number
  canWrite?: boolean
}>()

const previewOpen = ref(false)
const previewDoc = ref<ContainerDocument | null>(null)

const previewUrl = computed(() => {
  if (!previewDoc.value) return ''
  return getDocumentPreviewUrl(
    previewDoc.value.containerId,
    previewDoc.value.documentId,
    previewDoc.value
  )
})

function openPreview(doc: ContainerDocument) {
  previewDoc.value = doc
  previewOpen.value = true
}

function closePreview() {
  previewOpen.value = false
  previewDoc.value = null
}

const { t } = useI18n()
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between gap-3">
      <p class="text-sm text-muted">
        {{ documentCount }} attached file(s)
      </p>
      <div class="flex items-center gap-2">
        <UButton
          label="View all"
          color="neutral"
          variant="ghost"
          size="xs"
          :to="`/containers/${containerId}/documents`"
        />
        <UButton
          v-if="canWrite"
          label="Upload"
          icon="i-lucide-upload"
          size="xs"
          :to="`/containers/${containerId}/documents/upload`"
        />
      </div>
    </div>

    <AppEmptyState
      v-if="documents.length === 0"
      icon="i-lucide-paperclip"
      :title="t('containers.documents.empty')"
      :action-label="canWrite ? t('common.upload') : undefined"
      :action-to="canWrite ? `/containers/${containerId}/documents/upload` : undefined"
      action-icon="i-lucide-upload"
      action-size="xs"
    />

    <ul v-else class="divide-y divide-default">
      <li
        v-for="doc in documents"
        :key="doc.documentId"
        class="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
      >
        <div class="flex items-center gap-3 min-w-0">
          <UIcon
            :name="isImageDocument(doc.fileName) ? 'i-lucide-image' : 'i-lucide-file'"
            class="size-4 text-muted shrink-0"
          />
          <div class="min-w-0">
            <p class="text-sm font-medium truncate">{{ doc.fileName }}</p>
            <p class="text-xs text-muted">{{ doc.documentType }} · {{ doc.uploadedBy }}</p>
          </div>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <span class="text-xs text-muted">{{ formatEventDate(doc.uploadedDate) }}</span>
          <UButton
            v-if="isImageDocument(doc.fileName)"
            icon="i-lucide-eye"
            color="neutral"
            variant="ghost"
            size="xs"
            aria-label="Preview image"
            @click="openPreview(doc)"
          />
          <UButton
            :to="getDocumentDownloadUrl(containerId, doc.documentId)"
            target="_blank"
            icon="i-lucide-download"
            color="neutral"
            variant="ghost"
            size="xs"
            aria-label="Download file"
          />
        </div>
      </li>
    </ul>

    <Teleport to="body">
      <div
        v-if="previewOpen && previewDoc"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
        @click.self="closePreview"
      >
        <div class="w-full max-w-5xl overflow-hidden rounded-lg border border-default bg-default shadow-xl">
          <div class="flex items-center justify-between gap-3 border-b border-default px-4 py-3">
            <div class="min-w-0">
              <p class="truncate font-medium">{{ previewDoc.fileName }}</p>
              <p class="text-xs text-muted">{{ previewDoc.documentType }} · {{ previewDoc.uploadedBy }}</p>
            </div>
            <div class="flex items-center gap-1 shrink-0">
              <UButton
                icon="i-lucide-download"
                color="neutral"
                variant="ghost"
                size="sm"
                :to="getDocumentDownloadUrl(containerId, previewDoc.documentId)"
                target="_blank"
                aria-label="Download image"
              />
              <UButton
                icon="i-lucide-x"
                color="neutral"
                variant="ghost"
                size="sm"
                aria-label="Close preview"
                @click="closePreview"
              />
            </div>
          </div>
          <div class="flex items-center justify-center bg-neutral-950/5 p-4 dark:bg-neutral-950/40">
            <img
              :src="previewUrl"
              :alt="previewDoc.fileName"
              class="max-h-[70vh] w-full object-contain"
            >
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
