<script setup lang="ts">
import { parseQrScanInput } from '~/utils/qr-code'
import { resolveFullContainerNumber, formatContainerPrefixInput } from '~/utils/container-registration'

definePageMeta({ layout: 'public' })

const { t } = useI18n()
const router = useRouter()

const mode = ref<'number' | 'qr'>('number')
const containerPrefix = ref('')
const checkDigit = ref('')
const scanInput = ref('')
const loading = ref(false)
const error = ref<string | null>(null)

const fullPreview = computed(() => {
  if (containerPrefix.value.length < 10 || !checkDigit.value) return null
  try {
    return resolveFullContainerNumber(containerPrefix.value, checkDigit.value)
  } catch {
    return null
  }
})

async function submitNumberSearch() {
  error.value = null
  containerPrefix.value = formatContainerPrefixInput(containerPrefix.value)
  if (!fullPreview.value) {
    error.value = t('public.notFound')
    return
  }

  await router.push(`/public/track/${encodeURIComponent(fullPreview.value)}`)
}

async function submitQrSearch() {
  error.value = null
  const code = scanInput.value.trim()
  if (code.length < 3) return

  loading.value = true
  try {
    const parsed = parseQrScanInput(code)
    await router.push(`/public/track/${encodeURIComponent(parsed.containerNumber)}`)
  } catch {
    error.value = t('public.notFound')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="public-page">
    <PublicPageHeader
      :title="t('public.trackTitle')"
      :description="t('public.trackDesc')"
    />

    <div class="public-card">
      <div class="public-mode-tabs">
        <button
          type="button"
          class="public-mode-tab"
          :class="{ 'public-mode-tab--active': mode === 'number' }"
          @click="mode = 'number'"
        >
          <UIcon name="i-lucide-hash" class="size-4 shrink-0" />
          <span>{{ t('public.verifyTitle') }}</span>
        </button>
        <button
          type="button"
          class="public-mode-tab"
          :class="{ 'public-mode-tab--active': mode === 'qr' }"
          @click="mode = 'qr'"
        >
          <UIcon name="i-lucide-qr-code" class="size-4 shrink-0" />
          <span>{{ t('public.scanQr') }}</span>
        </button>
      </div>

      <div v-if="mode === 'number'" class="public-form">
        <label class="public-field">
          <span class="public-label">{{ t('public.containerPrefix') }}</span>
          <input
            v-model="containerPrefix"
            type="text"
            placeholder="MSCU123456"
            autocomplete="off"
            autocapitalize="characters"
            class="public-control font-mono uppercase"
          >
        </label>

        <label class="public-field public-field--short">
          <span class="public-label">{{ t('public.checkDigit') }}</span>
          <input
            v-model="checkDigit"
            type="text"
            maxlength="1"
            inputmode="numeric"
            class="public-control font-mono text-center"
          >
        </label>

        <p v-if="fullPreview" class="public-preview">
          <span class="text-muted">{{ t('public.fullNumber') }}:</span>
          <span class="font-mono font-medium">{{ fullPreview }}</span>
        </p>

        <UAlert v-if="error" color="error" icon="i-lucide-circle-x" :description="error" />

        <button
          type="button"
          class="public-submit"
          :disabled="!fullPreview"
          @click="submitNumberSearch"
        >
          <UIcon name="i-lucide-search" class="size-5" />
          {{ t('public.trackAction') }}
        </button>
      </div>

      <div v-else class="public-form">
        <p class="text-sm leading-relaxed text-muted">{{ t('public.scanHint') }}</p>

        <label class="public-field">
          <span class="public-label">{{ t('public.scanQr') }}</span>
          <input
            v-model="scanInput"
            type="text"
            :placeholder="t('public.scanPlaceholder')"
            autocomplete="off"
            class="public-control"
            @keyup.enter="submitQrSearch"
            @paste="() => nextTick(submitQrSearch)"
          >
        </label>

        <UAlert v-if="error" color="error" icon="i-lucide-circle-x" :description="error" />

        <button
          type="button"
          class="public-submit"
          :disabled="scanInput.trim().length < 3 || loading"
          @click="submitQrSearch"
        >
          <UIcon v-if="loading" name="i-lucide-loader-circle" class="size-5 animate-spin" />
          <UIcon v-else name="i-lucide-arrow-right" class="size-5" />
          {{ t('public.trackAction') }}
        </button>
      </div>
    </div>
  </div>
</template>
