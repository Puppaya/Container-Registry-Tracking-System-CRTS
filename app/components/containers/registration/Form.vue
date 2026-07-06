<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import type { ContainerRegistrationSchema } from '~/utils/container-registration'
import {
  BIC_DOCUMENT_ACCEPT,
  formatDecimalInput,
  formatIntegerInput,
  MAX_BIC_DOCUMENT_SIZE_BYTES,
  UNIT_STATUS_OPTIONS
} from '~/utils/container-registration'

const props = withDefaults(defineProps<{
  mode?: 'create' | 'edit'
  state: ReturnType<typeof useContainerRegistration>['state']
  schema: ReturnType<typeof useContainerRegistration>['schema']
  bicDocuments: File[]
  containerValidated: boolean
  validationMessage: string | null
  validationError: string | null
  validating: boolean
  submitting: boolean
  checkDigitAuto: string | null
}>(), {
  mode: 'create'
})

const emit = defineEmits<{
  validate: []
  normalizePrefix: []
  submit: [event: FormSubmitEvent<ContainerRegistrationSchema>]
  attemptSubmit: []
  saveDraft: []
  bicDocuments: [files: File | File[] | null | undefined]
}>()

const sectionIds = {
  identification: 'section-identification',
  specifications: 'section-specifications',
  ownership: 'section-ownership',
  registration: 'section-registration'
} as const

defineExpose({ sectionIds })

const isEditMode = computed(() => props.mode === 'edit')
const submitLabel = computed(() => isEditMode.value ? 'Save Changes' : 'Register Container')

const { getOptions } = useMasterDataOptions()

const isoTypeOptions = computed(() => getOptions('IsoType'))
const categoryOptions = computed(() => getOptions('ContainerCategory'))
const sizeOptions = computed(() => getOptions('ContainerSize'))
const manufacturerOptions = computed(() => getOptions('Manufacturer'))
const ownerOptions = computed(() => getOptions('Owner'))
const locationOptions = computed(() => getOptions('Location'))

function updateIntegerField(field: 'tareWeight' | 'maxPayload', value: string) {
  props.state[field] = formatIntegerInput(value)
}

function updateDecimalField(value: string) {
  props.state.internalVolume = formatDecimalInput(value)
}
</script>

<template>
  <UForm
    :schema="schema"
    :state="state"
    class="space-y-6"
    @submit="emit('submit', $event)"
  >
    <!-- Identification -->
    <UCard
      :id="sectionIds.identification"
      class="scroll-mt-24 ring-1 ring-default"
      :ui="{ body: 'space-y-4 p-5 sm:p-6' }"
    >
      <template #header>
        <div class="flex items-center justify-between gap-3 px-5 py-4 sm:px-6">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-fingerprint" class="size-5 text-primary" />
            <h2 class="text-base font-semibold font-mono tracking-tight">
              Identification
            </h2>
          </div>
          <UButton
            label="Scan Unit"
            icon="i-lucide-qr-code"
            color="neutral"
            variant="ghost"
            size="sm"
            to="/containers/scan"
          />
        </div>
      </template>

      <div
        class="grid gap-4 lg:items-end"
        :class="isEditMode ? 'sm:grid-cols-2' : 'lg:grid-cols-[minmax(0,1fr)_80px_auto]'"
      >
        <UFormField
          label="Container Number (BIC)"
          name="containerPrefix"
          help="Standard format: 4 letters + 6 digits + 1 check digit (ISO 6346)"
        >
          <UInput
            v-model="state.containerPrefix"
            class="w-full max-w-xs font-mono uppercase"
            placeholder="MSCU123456"
            icon="i-lucide-hash"
            :disabled="isEditMode"
            @blur="emit('normalizePrefix')"
          />
        </UFormField>

        <UFormField label="Check Digit" name="checkDigit">
          <UInput
            v-model="state.checkDigit"
            class="w-full font-mono text-center"
            placeholder="7"
            maxlength="1"
            inputmode="numeric"
            :disabled="isEditMode"
          />
        </UFormField>

        <UButton
          v-if="!isEditMode"
          label="Validate"
          icon="i-lucide-shield-check"
          class="lg:mb-0.5"
          :loading="validating"
          :color="containerValidated ? 'success' : 'primary'"
          @click="emit('validate')"
        />
      </div>

      <div>
        <p v-if="checkDigitAuto && !state.checkDigit" class="text-xs text-muted font-mono">
          Suggested check digit: {{ checkDigitAuto }}
        </p>

        <UAlert
          v-if="validationMessage"
          class="mt-3"
          color="success"
          variant="subtle"
          icon="i-lucide-circle-check"
          :description="validationMessage"
        />

        <UAlert
          v-if="validationError"
          class="mt-3"
          color="error"
          variant="subtle"
          icon="i-lucide-circle-x"
          :description="validationError"
        />
      </div>

      <UFormField label="Unit Status" name="unitStatus">
        <USelect
          v-model="state.unitStatus"
          :items="UNIT_STATUS_OPTIONS"
          class="w-full sm:max-w-xs"
        />
      </UFormField>
    </UCard>

    <!-- Specifications -->
    <UCard
      :id="sectionIds.specifications"
      class="scroll-mt-24 ring-1 ring-default"
      :ui="{ body: 'space-y-4 p-5 sm:p-6' }"
    >
      <template #header>
        <div class="flex items-center gap-2 px-5 py-4 sm:px-6">
          <UIcon name="i-lucide-settings-2" class="size-5 text-primary" />
          <h2 class="text-base font-semibold font-mono tracking-tight">
            Specifications
          </h2>
        </div>
      </template>

      <div class="grid gap-4 sm:grid-cols-2">
        <UFormField label="ISO Type" name="isoType">
          <USelect
            v-model="state.isoType"
            :items="isoTypeOptions"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Category" name="containerCategory">
          <USelect
            v-model="state.containerCategory"
            :items="categoryOptions"
            class="w-full"
          />
        </UFormField>
      </div>

      <UFormField label="Size" name="containerSize">
        <URadioGroup
          v-model="state.containerSize"
          :items="sizeOptions"
          orientation="horizontal"
          variant="table"
        />
      </UFormField>

      <div class="grid gap-4 sm:grid-cols-3">
        <UFormField label="Tare Weight (KG)" name="tareWeight">
          <UInput
            :model-value="state.tareWeight"
            type="text"
            inputmode="numeric"
            class="w-full font-mono"
            placeholder="3,750"
            @update:model-value="updateIntegerField('tareWeight', $event)"
          />
        </UFormField>

        <UFormField label="Max Payload (KG)" name="maxPayload">
          <UInput
            :model-value="state.maxPayload"
            type="text"
            inputmode="numeric"
            class="w-full font-mono"
            placeholder="28,750"
            @update:model-value="updateIntegerField('maxPayload', $event)"
          />
        </UFormField>

        <UFormField label="Internal Volume (M³)" name="internalVolume">
          <UInput
            :model-value="state.internalVolume"
            type="text"
            inputmode="decimal"
            class="w-full font-mono"
            placeholder="67.7"
            @update:model-value="updateDecimalField"
          />
        </UFormField>
      </div>
    </UCard>

    <!-- Ownership -->
    <UCard
      :id="sectionIds.ownership"
      class="scroll-mt-24 ring-1 ring-default"
      :ui="{ body: 'space-y-4 p-5 sm:p-6' }"
    >
      <template #header>
        <div class="flex items-center gap-2 px-5 py-4 sm:px-6">
          <UIcon name="i-lucide-building-2" class="size-5 text-primary" />
          <h2 class="text-base font-semibold font-mono tracking-tight">
            Ownership &amp; Asset History
          </h2>
        </div>
      </template>

      <UFormField label="Legal Owner" name="owner" required>
        <USelect
          v-model="state.owner"
          :items="ownerOptions"
          class="w-full"
          icon="i-lucide-building-2"
          placeholder="Select owner"
        />
      </UFormField>

      <UFormField label="Lease Provider (If Applicable)" name="leaseProvider">
        <UInput
          v-model="state.leaseProvider"
          class="w-full"
          placeholder="Triton International"
        />
      </UFormField>

      <div class="grid gap-4 sm:grid-cols-2">
        <UFormField label="Manufacturer" name="manufacturer">
          <USelect
            v-model="state.manufacturer"
            :items="manufacturerOptions"
            class="w-full"
            placeholder="Select manufacturer"
          />
        </UFormField>

        <UFormField label="Year Built" name="yearBuilt">
          <UInput
            v-model="state.yearBuilt"
            type="number"
            min="1900"
            :max="new Date().getFullYear()"
            class="w-full font-mono"
            placeholder="2024"
          />
        </UFormField>
      </div>
    </UCard>

    <!-- Registration -->
    <UCard
      :id="sectionIds.registration"
      class="scroll-mt-24 ring-1 ring-default"
      :ui="{ body: 'space-y-4 p-5 sm:p-6' }"
    >
      <template #header>
        <div class="flex items-center gap-2 px-5 py-4 sm:px-6">
          <UIcon name="i-lucide-clipboard-check" class="size-5 text-primary" />
          <h2 class="text-base font-semibold font-mono tracking-tight">
            Registration Details
          </h2>
        </div>
      </template>

      <div class="grid gap-4 sm:grid-cols-2">
        <UFormField label="Registry Location" name="registryLocation">
          <USelect
            v-model="state.registryLocation"
            :items="locationOptions"
            class="w-full"
            icon="i-lucide-map-pin"
            placeholder="Select location"
          />
        </UFormField>

        <UFormField label="CSC Expiry Date" name="cscExpiryDate">
          <AppDateInput v-model="state.cscExpiryDate" class="w-full" />
        </UFormField>
      </div>

      <UFormField label="Registration Date" name="registrationDate">
        <AppDateInput v-model="state.registrationDate" class="w-full sm:max-w-xs" />
      </UFormField>

      <UFormField label="BIC Certification Documents">
        <UFileUpload
          :model-value="bicDocuments"
          variant="area"
          icon="i-lucide-cloud-upload"
          label="Upload BIC Certification Documents"
          :description="`PDF, JPEG, or PNG (Max ${MAX_BIC_DOCUMENT_SIZE_BYTES / (1024 * 1024)}MB)`"
          :accept="BIC_DOCUMENT_ACCEPT"
          multiple
          @update:model-value="emit('bicDocuments', $event)"
        />
      </UFormField>
    </UCard>

    <div class="rounded-lg border border-warning/30 bg-warning/5 p-4">
      <div class="flex items-start gap-3">
        <UIcon name="i-lucide-badge-check" class="mt-0.5 size-5 shrink-0 text-warning" />
        <UFormField
          name="certified"
          required
          class="min-w-0 flex-1"
          :ui="{ label: 'text-sm text-default' }"
        >
          <UCheckbox
            v-model="state.certified"
            label="I certify that the information provided is accurate and corresponds to the official BIC registration plate affixed to the physical unit."
          />
        </UFormField>
      </div>
    </div>

    <div class="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end pb-2">
      <UButton
        v-if="!isEditMode"
        label="Save Draft"
        icon="i-lucide-save"
        color="neutral"
        variant="outline"
        type="button"
        @click="emit('saveDraft')"
      />
      <UButton
        type="button"
        :label="submitLabel"
        :icon="isEditMode ? 'i-lucide-save' : 'i-lucide-arrow-right'"
        :loading="submitting"
        @click="emit('attemptSubmit')"
      />
    </div>
  </UForm>
</template>
