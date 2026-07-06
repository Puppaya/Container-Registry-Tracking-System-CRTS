<script setup lang="ts">
import type { Container } from '~/types'
import { parseQrScanInput } from '~/utils/qr-code'

definePageMeta({
  layout: 'default',
  roles: ['Administrator', 'RegistryOfficer', 'SurveyTeam', 'Management']
})

const { t } = useI18n()
const scanInput = ref('')
const parsedPreview = computed(() => {
  const value = scanInput.value.trim()
  if (value.length < 3) return null
  try {
    return parseQrScanInput(value)
  } catch {
    return null
  }
})

const { execute: lookup, loading } = useApiAction()
const lastResult = ref<Container | null>(null)

async function submitScan() {
  const code = scanInput.value.trim()
  if (code.length < 3) return

  const { data, error } = await lookup(
    () => $fetch('/api/containers/by-qr', {
      query: { code }
    }) as Promise<any>
  )

  if (!error && data) {
    lastResult.value = data as Container
    await navigateTo(`/containers/${(data as Container).containerId}`)
  }
}

function onPaste(event: ClipboardEvent) {
  const text = event.clipboardData?.getData('text') || ''
  if (text) {
    scanInput.value = text.trim()
    nextTick(() => submitScan())
  }
}
</script>

<template>
  <UDashboardPanel id="container-scan" grow>
    <template #header>
      <UDashboardNavbar :title="t('containers.qrTracking')">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton
            :label="t('containers.advancedSearch')"
            icon="i-lucide-search"
            color="neutral"
            variant="outline"
            to="/containers/search"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UDashboardPanelContent class="mx-auto w-full">
        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-qr-code" class="size-5 text-primary" />
              <span class="font-semibold">{{ t('containers.scan.title') }}</span>
            </div>
          </template>

          <p class="text-sm text-neutral-500 mb-4">
            {{ t('containers.scan.instructions') }}
          </p>

          <UFormField :label="t('containers.scan.field')">
            <UInput
              v-model="scanInput"
              icon="i-lucide-scan-line"
              placeholder="CRTS:MSCU1234566"
              size="lg"
              autofocus
              @keyup.enter="submitScan"
              @paste="onPaste"
            />
          </UFormField>

          <div v-if="parsedPreview" class="mt-3 rounded-lg bg-elevated/50 p-3 text-sm">
            <div class="text-neutral-500">{{ t('common.preview') }}</div>
            <div class="font-mono font-medium">{{ parsedPreview.containerNumber }}</div>
            <div class="text-xs text-neutral-400">{{ parsedPreview.qrContent }}</div>
          </div>

          <div class="mt-6 flex gap-2">
            <UButton
              :label="t('common.search')"
              icon="i-lucide-arrow-right"
              :loading="loading"
              :disabled="scanInput.trim().length < 3"
              @click="submitScan"
            />
            <UButton
              :label="t('common.clear')"
              color="neutral"
              variant="outline"
              @click="scanInput = ''"
            />
          </div>
        </UCard>

        <UCard v-if="lastResult" class="mt-4">
          <div class="text-sm text-neutral-500 mb-1">{{ t('containers.scan.latestResult') }}</div>
          <NuxtLink
            :to="`/containers/${lastResult.containerId}`"
            class="font-mono font-medium text-primary hover:underline"
          >
            {{ lastResult.containerNumber }}
          </NuxtLink>
          <div class="text-sm text-neutral-500 mt-1">{{ lastResult.owner }} · {{ lastResult.status }}</div>
        </UCard>
      </UDashboardPanelContent>
    </template>
  </UDashboardPanel>
</template>
