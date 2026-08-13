<script setup lang="ts">
import { z } from 'zod'
import {
  autoFillCheckDigit,
  CATEGORY_OPTIONS,
  formatContainerPrefixInput,
  ISO_TYPE_OPTIONS,
  MANUFACTURER_OPTIONS,
  resolveFullContainerNumber,
  SIZE_OPTIONS,
  validateBicDocument,
  validateContainerPrefixAndDigit
} from '~/utils/container-registration'

definePageMeta({ layout: 'public' })

const { t } = useI18n()
const toast = useToast()
const { execute, loading } = useApiAction()

const schema = computed(() => z.object({
  containerPrefix: z.string().min(10, t('containers.form.validation.prefixRequired')),
  checkDigit: z.string().length(1, t('containers.form.validation.checkDigitRequired')),
  isoType: z.string().min(1),
  containerSize: z.string().min(1),
  containerCategory: z.string().min(1),
  owner: z.string().min(1, t('containers.form.validation.ownerRequired')),
  manufacturer: z.string().optional(),
  yearBuilt: z.string().optional(),
  registryLocation: z.string().optional(),
  registrationDate: z.string().min(1),
  submitterName: z.string().min(1, t('public.validation.submitterNameRequired')),
  submitterEmail: z.string().email(t('public.validation.submitterEmailInvalid')),
  submitterPhone: z.string().optional(),
  certified: z.boolean().refine(value => value === true, { message: t('public.validation.certificationRequired') })
}))

const state = reactive({
  containerPrefix: '',
  checkDigit: '',
  isoType: '42G1',
  containerSize: '40',
  containerCategory: 'Dry',
  owner: '',
  manufacturer: '',
  yearBuilt: '',
  registryLocation: '',
  registrationDate: new Date().toISOString().slice(0, 10),
  submitterName: '',
  submitterEmail: '',
  submitterPhone: '',
  certified: false
})

const bicDocuments = ref<File[]>([])
const containerValidated = ref(false)
const validationError = ref<string | null>(null)
const validating = ref(false)
const success = ref<{ reference: string, containerNumber: string } | null>(null)
const formErrors = ref<Record<string, string>>({})

const checkDigitAuto = computed(() => autoFillCheckDigit(state.containerPrefix))

watch(() => state.containerPrefix, () => {
  containerValidated.value = false
  validationError.value = null
  const auto = checkDigitAuto.value
  if (auto && !state.checkDigit) state.checkDigit = auto
})

function normalizePrefix() {
  state.containerPrefix = formatContainerPrefixInput(state.containerPrefix)
}

function clearFieldError(field: string) {
  if (formErrors.value[field]) {
    const next = { ...formErrors.value }
    delete next[field]
    formErrors.value = next
  }
}

async function validateNumber() {
  validating.value = true
  validationError.value = null
  try {
    normalizePrefix()
    if (!state.checkDigit && checkDigitAuto.value) state.checkDigit = checkDigitAuto.value
    const result = validateContainerPrefixAndDigit(state.containerPrefix, state.checkDigit)
    if (!result.valid) {
      validationError.value = result.error || 'Invalid container number'
      containerValidated.value = false
      return false
    }
    containerValidated.value = true
    return true
  } finally {
    validating.value = false
  }
}

function onDocumentsChange(event: Event) {
  const input = event.target as HTMLInputElement
  const files = input.files ? Array.from(input.files) : []
  bicDocuments.value = files.filter(file => validateBicDocument(file).valid)
}

async function uploadDocuments(containerNumber: string, checkDigit: string) {
  for (const file of bicDocuments.value) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('containerNumber', containerNumber)
    formData.append('checkDigit', checkDigit)
    formData.append('documentType', 'Certificate')
    await $fetch('/api/public/containers/documents', { method: 'POST', body: formData })
  }
}

async function onSubmit() {
  formErrors.value = {}

  if (!containerValidated.value) {
    const ok = await validateNumber()
    if (!ok) return
  }

  const parsed = schema.value.safeParse(state)
  if (!parsed.success) {
    const errors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? '')
      if (key && !errors[key]) errors[key] = issue.message
    }
    formErrors.value = errors
    return
  }

  const checkDigit = state.checkDigit
  const { data, error } = await execute(
    () => $fetch('/api/public/containers/register', {
      method: 'POST',
      body: parsed.data
    }) as Promise<any>,
    { successMessage: t('public.registerSuccessTitle') }
  )

  if (error || !data) return

  const result = data as { reference: string, containerNumber: string }

  if (bicDocuments.value.length) {
    try {
      await uploadDocuments(result.containerNumber, checkDigit)
    } catch {
      toast.add({
        title: t('public.registerSuccessTitle'),
        description: t('public.uploadDocumentsHint'),
        color: 'warning'
      })
    }
  }

  success.value = result
}
</script>

<template>
  <div class="public-page">
    <PublicPageHeader
      :title="t('public.registerTitle')"
      :description="t('public.registerDesc')"
    />

    <div v-if="success" class="public-card">
      <div class="public-form text-center">
        <UIcon name="i-lucide-circle-check" class="size-10 sm:size-12 text-success mx-auto" />
        <div>
          <h2 class="text-base sm:text-lg font-semibold">{{ t('public.registerSuccessTitle') }}</h2>
          <p class="text-sm text-muted mt-1">{{ t('public.registerSuccessDesc') }}</p>
        </div>
        <div class="public-preview text-left sm:text-center space-y-2">
          <div class="break-all">
            <span class="text-muted">{{ t('public.referenceNo') }}:</span>
            <span class="font-mono font-semibold ms-1">{{ success.reference }}</span>
          </div>
          <div class="break-all">
            <span class="text-muted">{{ t('public.fullNumber') }}:</span>
            <span class="font-mono font-semibold ms-1">{{ success.containerNumber }}</span>
          </div>
        </div>
        <div class="public-form">
          <NuxtLink :to="`/public/track/${success.containerNumber}`" class="public-submit no-underline">
            <UIcon name="i-lucide-search" class="size-5" />
            {{ t('public.trackAnother') }}
          </NuxtLink>
          <NuxtLink to="/public/register" class="public-btn-secondary no-underline" @click="success = null">
            {{ t('public.submitAnother') }}
          </NuxtLink>
        </div>
      </div>
    </div>

    <form v-else class="public-card public-form" @submit.prevent="onSubmit">
      <section class="public-section">
        <h2 class="public-section-title">{{ t('public.containerSection') }}</h2>

        <label class="public-field">
          <span class="public-label">{{ t('public.containerPrefix') }}</span>
          <input
            v-model="state.containerPrefix"
            type="text"
            placeholder="MSCU123456"
            autocomplete="off"
            autocapitalize="characters"
            class="public-control font-mono uppercase"
            @blur="normalizePrefix"
            @input="clearFieldError('containerPrefix')"
          >
          <p v-if="formErrors.containerPrefix" class="public-field-error">{{ formErrors.containerPrefix }}</p>
        </label>

        <label class="public-field public-field--short">
          <span class="public-label">{{ t('public.checkDigit') }}</span>
          <input
            v-model="state.checkDigit"
            type="text"
            maxlength="1"
            inputmode="numeric"
            class="public-control font-mono text-center"
            @input="clearFieldError('checkDigit')"
          >
          <p v-if="formErrors.checkDigit" class="public-field-error">{{ formErrors.checkDigit }}</p>
        </label>

        <div class="public-form">
          <button
            type="button"
            class="public-btn-secondary"
            :disabled="validating"
            @click="validateNumber"
          >
            <UIcon v-if="validating" name="i-lucide-loader-circle" class="size-4 animate-spin" />
            <UIcon v-else name="i-lucide-shield-check" class="size-4" />
            {{ t('common.validate') }}
          </button>
          <p v-if="containerValidated" class="text-sm text-success break-all font-mono">
            {{ resolveFullContainerNumber(state.containerPrefix, state.checkDigit) }}
          </p>
          <p v-if="validationError" class="public-field-error">{{ validationError }}</p>
        </div>

        <div class="public-field">
          <span class="public-label">{{ t('containers.form.isoType') }}</span>
          <PublicSelect
            v-model="state.isoType"
            :options="ISO_TYPE_OPTIONS"
            @update:model-value="clearFieldError('isoType')"
          />
        </div>

        <div class="public-field">
          <span class="public-label">{{ t('containers.form.size') }}</span>
          <PublicSelect
            v-model="state.containerSize"
            :options="SIZE_OPTIONS"
            @update:model-value="clearFieldError('containerSize')"
          />
        </div>

        <div class="public-field">
          <span class="public-label">{{ t('containers.form.category') }}</span>
          <PublicSelect
            v-model="state.containerCategory"
            :options="CATEGORY_OPTIONS"
            @update:model-value="clearFieldError('containerCategory')"
          />
        </div>

        <label class="public-field">
          <span class="public-label">{{ t('containers.form.owner') }}</span>
          <input
            v-model="state.owner"
            type="text"
            class="public-control"
            @input="clearFieldError('owner')"
          >
          <p v-if="formErrors.owner" class="public-field-error">{{ formErrors.owner }}</p>
        </label>

        <div class="public-field">
          <span class="public-label">{{ t('containers.form.manufacturer') }}</span>
          <PublicSelect
            v-model="state.manufacturer"
            :options="MANUFACTURER_OPTIONS"
            :placeholder="t('common.choose')"
            @update:model-value="clearFieldError('manufacturer')"
          />
        </div>

        <label class="public-field">
          <span class="public-label">{{ t('containers.form.yearBuilt') }}</span>
          <input
            v-model="state.yearBuilt"
            type="text"
            inputmode="numeric"
            class="public-control"
          >
        </label>

        <label class="public-field">
          <span class="public-label">{{ t('containers.form.registryLocation') }}</span>
          <input
            v-model="state.registryLocation"
            type="text"
            class="public-control"
          >
        </label>

        <div class="public-field">
          <span class="public-label">{{ t('containers.form.registrationDate') }}</span>
          <PublicDateField v-model="state.registrationDate" @update:model-value="clearFieldError('registrationDate')" />
          <p v-if="formErrors.registrationDate" class="public-field-error">{{ formErrors.registrationDate }}</p>
        </div>
      </section>

      <section class="public-section">
        <h2 class="public-section-title">{{ t('public.submitterSection') }}</h2>

        <label class="public-field">
          <span class="public-label">{{ t('public.submitterName') }}</span>
          <input
            v-model="state.submitterName"
            type="text"
            autocomplete="name"
            class="public-control"
            @input="clearFieldError('submitterName')"
          >
          <p v-if="formErrors.submitterName" class="public-field-error">{{ formErrors.submitterName }}</p>
        </label>

        <label class="public-field">
          <span class="public-label">{{ t('public.submitterEmail') }}</span>
          <input
            v-model="state.submitterEmail"
            type="email"
            inputmode="email"
            autocomplete="email"
            class="public-control"
            @input="clearFieldError('submitterEmail')"
          >
          <p v-if="formErrors.submitterEmail" class="public-field-error">{{ formErrors.submitterEmail }}</p>
        </label>

        <label class="public-field">
          <span class="public-label">{{ t('public.submitterPhone') }}</span>
          <input
            v-model="state.submitterPhone"
            type="tel"
            inputmode="tel"
            autocomplete="tel"
            class="public-control"
          >
        </label>
      </section>

      <section class="public-section">
        <h2 class="public-section-title">{{ t('public.uploadDocuments') }}</h2>
        <p class="text-sm text-muted">{{ t('public.uploadDocumentsHint') }}</p>
        <label class="public-field">
          <input
            type="file"
            multiple
            accept=".pdf,.png,.jpg,.jpeg"
            class="public-control public-control--file"
            @change="onDocumentsChange"
          >
        </label>
        <ul v-if="bicDocuments.length" class="space-y-1 text-sm text-muted">
          <li v-for="file in bicDocuments" :key="file.name" class="break-all">{{ file.name }}</li>
        </ul>
      </section>

      <label class="public-checkbox-row">
        <input
          v-model="state.certified"
          type="checkbox"
          @change="clearFieldError('certified')"
        >
        <span>{{ t('containers.registration.certify') }}</span>
      </label>
      <p v-if="formErrors.certified" class="public-field-error">{{ formErrors.certified }}</p>

      <div class="public-sticky-submit">
        <button type="submit" class="public-submit" :disabled="loading">
          <UIcon v-if="loading" name="i-lucide-loader-circle" class="size-5 animate-spin" />
          <UIcon v-else name="i-lucide-send" class="size-5" />
          {{ t('public.registerAction') }}
        </button>
      </div>
    </form>
  </div>
</template>
