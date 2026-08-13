<script setup lang="ts">
import type { PublicContainerTrackResponse } from '~/types'

definePageMeta({ layout: 'public' })

const { t } = useI18n()
const route = useRoute()

const containerNumber = computed(() => decodeURIComponent(String(route.params.number || '')))
const checkDigit = computed(() => containerNumber.value.slice(-1))

const pending = ref(true)
const error = ref<string | null>(null)
const data = ref<PublicContainerTrackResponse | null>(null)

async function loadTrackResult() {
  pending.value = true
  error.value = null

  try {
    const response = await $fetch<any>('/api/public/containers/track', {
      query: {
        containerNumber: containerNumber.value,
        checkDigit: checkDigit.value
      }
    })
    data.value = response.data as PublicContainerTrackResponse
  } catch {
    error.value = t('public.notFound')
    data.value = null
  } finally {
    pending.value = false
  }
}

await loadTrackResult()
</script>

<template>
  <div class="public-page space-y-4 sm:space-y-6">
    <PublicPageHeader
      :title="t('public.trackTitle')"
      :description="containerNumber"
      mono
      back-to="/public/track"
    />

    <div v-if="pending" class="flex justify-center py-12 sm:py-16">
      <UIcon name="i-lucide-loader-circle" class="size-8 animate-spin text-primary" />
    </div>

    <UAlert
      v-else-if="error"
      color="error"
      icon="i-lucide-circle-x"
      :title="t('public.notFound')"
      :description="error"
    >
      <template #actions>
        <UButton :label="t('public.trackAction')" to="/public/track" size="sm" block class="sm:w-auto min-h-10" />
      </template>
    </UAlert>

    <PublicTrackResult v-else-if="data" :data="data" />
  </div>
</template>
