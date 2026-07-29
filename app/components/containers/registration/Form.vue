<script setup lang="ts">
import type { FormErrorEvent, FormSubmitEvent } from "@nuxt/ui";
import type { ContainerRegistrationSchema } from "~/utils/container-registration";
import {
  formatDecimalInput,
  formatIntegerInput,
} from "~/utils/container-registration";

const props = withDefaults(
  defineProps<{
    mode?: "create" | "edit";
    state: ReturnType<typeof useContainerRegistration>["state"];
    schema: ReturnType<typeof useContainerRegistration>["schema"];
    containerValidated: boolean;
    validationMessage: string | null;
    validationError: string | null;
    validating: boolean;
    submitting: boolean;
    checkDigitAuto: string | null;
    bicDocuments: File[];
  }>(),
  {
    mode: "create",
    bicDocuments: () => [],
  },
);

const emit = defineEmits<{
  validate: [];
  normalizePrefix: [];
  submit: [event: FormSubmitEvent<ContainerRegistrationSchema>];
  attemptSubmit: [];
  saveDraft: [];
  validationError: [field: string];
  bicDocumentsChange: [files: File | File[] | null | undefined];
}>();

const sectionIds = {
  identification: "section-identification",
  specifications: "section-specifications",
  ownership: "section-ownership",
  registration: "section-registration",
} as const;

const formErrors = ref<{ name: string; message: string }[]>([]);

const fieldLabels: Record<string, string> = {
  containerPrefix: "Container Number",
  checkDigit: "Check Digit",
  unitStatus: "Unit Status",
  isoType: "ISO Type",
  containerCategory: "Category",
  containerSize: "Size",
  tareWeight: "Tare Weight",
  maxPayload: "Max Payload",
  internalVolume: "Internal Volume",
  owner: "Legal Owner",
  leaseProvider: "Lease Provider",
  manufacturer: "Manufacturer",
  yearBuilt: "Year Built",
  registryLocation: "Registry Location",
  cscExpiryDate: "CSC Expiry Date",
  registrationDate: "Registration Date",
  certified: "Certification",
};

function getSectionForField(field: string): string {
  const map: Record<string, string> = {
    containerPrefix: "identification",
    checkDigit: "identification",
    unitStatus: "identification",
    isoType: "specifications",
    containerCategory: "specifications",
    containerSize: "specifications",
    tareWeight: "specifications",
    maxPayload: "specifications",
    internalVolume: "specifications",
    owner: "ownership",
    leaseProvider: "ownership",
    manufacturer: "ownership",
    yearBuilt: "ownership",
    registryLocation: "registration",
    cscExpiryDate: "registration",
    registrationDate: "registration",
    certified: "registration",
  };
  return map[field] ?? "identification";
}

function scrollToField(fieldName: string) {
  if (!import.meta.client) return;
  const el = document.querySelector(`[data-field="${fieldName}"]`);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    const input = el.querySelector<HTMLElement>("input, select, button, [tabindex]");
    input?.focus({ preventScroll: true });
  }
}

function handleFormError(event: FormErrorEvent) {
  if (event.errors?.length) {
    formErrors.value = event.errors.map((e) => ({
      name: e.name ?? "",
      message: e.message ?? "",
    }));
    const first = event.errors[0];
    emit("validationError", first?.name ?? "identification");
  }
}

function clearFormErrors() {
  formErrors.value = [];
}

defineExpose({ sectionIds, scrollToField });

const { t } = useI18n();

const isEditMode = computed(() => props.mode === "edit");
const submitLabel = computed(() =>
  isEditMode.value ? t("common.saveChanges") : t("containers.register"),
);

const autoMarkActive = computed(
  () => props.checkDigitAuto !== null && props.state.checkDigit === props.checkDigitAuto,
);

const autoMarkBadge = computed(() => {
  if (!props.checkDigitAuto) return null;
  return props.state.checkDigit === props.checkDigitAuto
    ? "done"
    : props.state.checkDigit
      ? "overridden"
      : "pending";
});

const unitStatusOptions = computed(() => [
  { label: t("containers.form.unitStatusOptions.new"), value: "New" },
  { label: t("containers.form.unitStatusOptions.active"), value: "Active" },
  { label: t("containers.form.unitStatusOptions.inactive"), value: "Inactive" },
]);

const { getOptions } = useMasterDataOptions();

const isoTypeOptions = computed(() => getOptions("IsoType"));
const categoryOptions = computed(() => getOptions("ContainerCategory"));
const sizeOptions = computed(() => getOptions("ContainerSize"));
const manufacturerOptions = computed(() => getOptions("Manufacturer"));
const ownerOptions = computed(() => getOptions("Owner"));
const locationOptions = computed(() => getOptions("Location"));

function updateIntegerField(field: "tareWeight" | "maxPayload", value: string) {
  props.state[field] = formatIntegerInput(value);
}

function updateDecimalField(value: string) {
  props.state.internalVolume = formatDecimalInput(value);
}

const fileInputRef = ref<HTMLInputElement | null>(null);
const dragging = ref(false);

function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files?.length) {
    emit("bicDocumentsChange", Array.from(input.files));
  }
  input.value = "";
}

function handleDrop(event: DragEvent) {
  dragging.value = false;
  if (event.dataTransfer?.files?.length) {
    emit("bicDocumentsChange", Array.from(event.dataTransfer.files));
  }
}

function removeBicDocument(index: number) {
  const remaining = props.bicDocuments.filter((_, i) => i !== index);
  emit("bicDocumentsChange", remaining);
}

function getFileUrl(file: File): string {
  return URL.createObjectURL(file);
}

function previewFile(file: File) {
  const url = getFileUrl(file);
  window.open(url, "_blank");
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
</script>

<template>
  <UForm
    :schema="schema"
    :state="state"
    class="space-y-6"
    @submit="emit('submit', $event)"
    @error="handleFormError"
    @change="clearFormErrors"
  >
    <Transition name="form-alert">
      <UAlert
        v-if="formErrors.length"
        icon="i-lucide-alert-triangle"
        color="error"
        variant="outline"
        class="mb-2"
      >
        <template #title>
          <span class="font-semibold">{{ t("containers.form.validationErrorTitle", { count: formErrors.length }) }}</span>
        </template>
        <template #description>
          <ul class="mt-1 space-y-1">
            <li
              v-for="err in formErrors"
              :key="err.name"
              class="flex items-center gap-2"
            >
              <button
                type="button"
                class="text-xs underline underline-offset-2 hover:text-error/80 transition-colors text-left"
                @click="scrollToField(err.name)"
              >
                <span class="font-mono font-medium">{{ fieldLabels[err.name] || err.name }}</span>
                <span class="text-error/70"> — {{ err.message }}</span>
              </button>
            </li>
          </ul>
        </template>
      </UAlert>
    </Transition>

    <!-- Identification -->
    <UCard
      :id="sectionIds.identification"
      class="scroll-mt-24 relative overflow-hidden ring-1 ring-default transition-shadow hover:shadow-sm"
      :ui="{ body: 'space-y-4 p-5 sm:p-6', header: 'px-5 py-4 sm:px-6' }"
    >
      <div class="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-primary via-primary/60 to-primary/10" />

      <template #header>
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <span class="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary font-mono">1</span>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-fingerprint" class="size-5 text-primary" />
              <h2 class="text-base font-semibold font-mono tracking-tight">
                {{ t("containers.registration.steps.identification") }}
              </h2>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <UBadge
              v-if="containerValidated"
              color="success"
              variant="subtle"
              size="sm"
            >
              <span class="size-1.5 rounded-full bg-success mr-1" />
              {{ t("common.validated") }}
            </UBadge>
            <UButton
              :label="t('common.scanUnit')"
              icon="i-lucide-qr-code"
              color="neutral"
              variant="ghost"
              size="sm"
              to="/containers/scan"
            />
          </div>
        </div>
      </template>

      <div
        class="grid gap-4 lg:items-end"
        :class="
          isEditMode
            ? 'sm:grid-cols-2'
            : 'lg:grid-cols-[minmax(0,1fr)_100px_auto]'
        "
      >
        <UFormField
          data-field="containerPrefix"
          :label="t('containers.form.containerNumber')"
          name="containerPrefix"
          :help="t('containers.form.containerNumberHelp')"
        >
          <UInput
            v-model="state.containerPrefix"
            class="w-full max-w-xs font-mono uppercase"
            :placeholder="t('containers.form.placeholders.containerNumber')"
            icon="i-lucide-hash"
            :disabled="isEditMode"
            @blur="emit('normalizePrefix')"
          />
        </UFormField>

        <UFormField data-field="checkDigit" :label="t('containers.form.checkDigit')" name="checkDigit">
          <div class="relative" :class="autoMarkActive ? 'ring-2 ring-success/40 rounded-lg' : ''">
            <UInput
              v-model="state.checkDigit"
              class="w-full font-mono text-center"
              :placeholder="t('containers.form.placeholders.checkDigit')"
              maxlength="1"
              inputmode="numeric"
              :disabled="isEditMode"
            />
            <div
              v-if="checkDigitAuto && !isEditMode"
              class="absolute -top-2 -right-2"
            >
              <UBadge
                v-if="autoMarkBadge === 'done'"
                color="success"
                variant="solid"
                size="xs"
                class="text-[10px] px-1.5"
              >
                AUTO
              </UBadge>
              <UBadge
                v-else-if="autoMarkBadge === 'pending'"
                color="warning"
                variant="solid"
                size="xs"
                class="text-[10px] px-1.5 animate-pulse"
              >
                AUTO
              </UBadge>
            </div>
          </div>
          <template #help>
            <span v-if="autoMarkActive" class="text-success font-mono text-xs flex items-center gap-1">
              <UIcon name="i-lucide-wand-2" class="size-3" />
              {{ t("containers.form.autoMarkedCheckDigit", { digit: checkDigitAuto }) }}
            </span>
            <span v-else-if="checkDigitAuto && state.checkDigit && state.checkDigit !== checkDigitAuto" class="text-warning font-mono text-xs flex items-center gap-1">
              <UIcon name="i-lucide-pencil" class="size-3" />
              {{ t("containers.form.suggestedCheckDigit", { digit: checkDigitAuto }) }}
            </span>
          </template>
        </UFormField>

        <UButton
          v-if="!isEditMode"
          :label="containerValidated ? t('common.validated') : t('common.validate')"
          icon="i-lucide-shield-check"
          class="lg:mb-0.5"
          :loading="validating"
          :color="containerValidated ? 'success' : 'primary'"
          :variant="containerValidated ? 'outline' : 'solid'"
          @click="emit('validate')"
        />
      </div>

      <Transition name="form-alert">
        <div v-if="validationMessage || validationError">
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
      </Transition>

      <USeparator class="my-2" />

      <UFormField data-field="unitStatus" :label="t('containers.form.unitStatus')" name="unitStatus" required>
        <USelect
          v-model="state.unitStatus"
          :items="unitStatusOptions"
          class="w-full sm:max-w-xs"
        />
      </UFormField>
    </UCard>

    <!-- Specifications -->
    <UCard
      :id="sectionIds.specifications"
      class="scroll-mt-24 relative overflow-hidden ring-1 ring-default transition-shadow hover:shadow-sm"
      :ui="{ body: 'space-y-4 p-5 sm:p-6', header: 'px-5 py-4 sm:px-6' }"
    >
      <div class="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-info via-info/60 to-info/10" />

      <template #header>
        <div class="flex items-center gap-3">
          <span class="flex size-7 shrink-0 items-center justify-center rounded-full bg-info/10 text-xs font-bold text-info font-mono">2</span>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-settings-2" class="size-5 text-info" />
            <h2 class="text-base font-semibold font-mono tracking-tight">
              {{ t("containers.registration.steps.specifications") }}
            </h2>
          </div>
        </div>
      </template>

      <div class="grid gap-4 sm:grid-cols-2">
        <UFormField data-field="isoType" :label="t('containers.form.isoType')" name="isoType" required>
          <USelect
            v-model="state.isoType"
            :items="isoTypeOptions"
            class="w-full"
          />
        </UFormField>

        <UFormField
          data-field="containerCategory"
          :label="t('containers.form.category')"
          name="containerCategory"
          required
        >
          <USelect
            v-model="state.containerCategory"
            :items="categoryOptions"
            class="w-full"
          />
        </UFormField>
      </div>

      <UFormField data-field="containerSize" :label="t('containers.form.size')" name="containerSize" required>
        <URadioGroup
          v-model="state.containerSize"
          :items="sizeOptions"
          orientation="horizontal"
          variant="table"
        />
      </UFormField>

      <div class="grid gap-4 sm:grid-cols-3">
        <UFormField data-field="tareWeight" :label="t('containers.form.tareWeight')" name="tareWeight">
          <UInput
            :model-value="state.tareWeight"
            type="text"
            inputmode="numeric"
            class="w-full font-mono"
            :placeholder="t('containers.form.placeholders.tareWeight')"
            @update:model-value="updateIntegerField('tareWeight', $event)"
          />
        </UFormField>

        <UFormField data-field="maxPayload" :label="t('containers.form.maxPayload')" name="maxPayload">
          <UInput
            :model-value="state.maxPayload"
            type="text"
            inputmode="numeric"
            class="w-full font-mono"
            :placeholder="t('containers.form.placeholders.maxPayload')"
            @update:model-value="updateIntegerField('maxPayload', $event)"
          />
        </UFormField>

        <UFormField
          data-field="internalVolume"
          :label="t('containers.form.internalVolume')"
          name="internalVolume"
        >
          <UInput
            :model-value="state.internalVolume"
            type="text"
            inputmode="decimal"
            class="w-full font-mono"
            :placeholder="t('containers.form.placeholders.internalVolume')"
            @update:model-value="updateDecimalField"
          />
        </UFormField>
      </div>
    </UCard>

    <!-- Ownership -->
    <UCard
      :id="sectionIds.ownership"
      class="scroll-mt-24 relative overflow-hidden ring-1 ring-default transition-shadow hover:shadow-sm"
      :ui="{ body: 'space-y-4 p-5 sm:p-6', header: 'px-5 py-4 sm:px-6' }"
    >
      <div class="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-warning via-warning/60 to-warning/10" />

      <template #header>
        <div class="flex items-center gap-3">
          <span class="flex size-7 shrink-0 items-center justify-center rounded-full bg-warning/10 text-xs font-bold text-warning font-mono">3</span>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-building-2" class="size-5 text-warning" />
            <h2 class="text-base font-semibold font-mono tracking-tight">
              {{ t("containers.registration.sectionTitles.ownership") }}
            </h2>
          </div>
        </div>
      </template>

      <UFormField data-field="owner" :label="t('containers.form.owner')" name="owner" required>
        <USelect
          v-model="state.owner"
          :items="ownerOptions"
          class="w-full"
          icon="i-lucide-building-2"
          :placeholder="t('containers.form.placeholders.owner')"
        />
      </UFormField>

      <UFormField
        data-field="leaseProvider"
        :label="t('containers.form.leaseProvider')"
        name="leaseProvider"
      >
        <UInput
          v-model="state.leaseProvider"
          class="w-full"
          :placeholder="t('containers.form.placeholders.leaseProvider')"
        />
      </UFormField>

      <div class="grid gap-4 sm:grid-cols-2">
        <UFormField
          data-field="manufacturer"
          :label="t('containers.form.manufacturer')"
          name="manufacturer"
        >
          <USelect
            v-model="state.manufacturer"
            :items="manufacturerOptions"
            class="w-full"
            :placeholder="t('containers.form.placeholders.manufacturer')"
          />
        </UFormField>

        <UFormField data-field="yearBuilt" :label="t('containers.form.yearBuilt')" name="yearBuilt">
          <UInput
            v-model="state.yearBuilt"
            type="number"
            min="1900"
            :max="new Date().getFullYear()"
            class="w-full font-mono"
            :placeholder="t('containers.form.placeholders.yearBuilt')"
          />
        </UFormField>
      </div>
    </UCard>

    <!-- Registration -->
    <UCard
      :id="sectionIds.registration"
      class="scroll-mt-24 relative overflow-hidden ring-1 ring-default transition-shadow hover:shadow-sm"
      :ui="{ body: 'space-y-4 p-5 sm:p-6', header: 'px-5 py-4 sm:px-6' }"
    >
      <div class="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-success via-success/60 to-success/10" />

      <template #header>
        <div class="flex items-center gap-3">
          <span class="flex size-7 shrink-0 items-center justify-center rounded-full bg-success/10 text-xs font-bold text-success font-mono">4</span>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-clipboard-check" class="size-5 text-success" />
            <h2 class="text-base font-semibold font-mono tracking-tight">
              {{ t("containers.registration.sectionTitles.registrationDetails") }}
            </h2>
          </div>
        </div>
      </template>

      <div class="grid gap-4 sm:grid-cols-2">
        <UFormField
          data-field="registryLocation"
          :label="t('containers.form.registryLocation')"
          name="registryLocation"
        >
          <USelect
            v-model="state.registryLocation"
            :items="locationOptions"
            class="w-full"
            icon="i-lucide-map-pin"
            :placeholder="t('containers.form.placeholders.registryLocation')"
          />
        </UFormField>

        <UFormField
          data-field="cscExpiryDate"
          :label="t('containers.form.cscExpiryDate')"
          name="cscExpiryDate"
        >
          <AppDateInput v-model="state.cscExpiryDate" class="w-full" />
        </UFormField>
      </div>

      <UFormField
        data-field="registrationDate"
        :label="t('containers.form.registrationDate')"
        name="registrationDate"
        required
      >
        <AppDateInput
          v-model="state.registrationDate"
          class="w-full sm:max-w-xs"
        />
      </UFormField>

      <USeparator class="my-2" />

      <div>
        <p class="text-sm font-medium mb-2">{{ t("containers.form.bicDocuments") }}</p>
        <p class="text-xs text-default-500 mb-3">{{ t("containers.form.bicDocumentsDesc", { size: 10 }) }}</p>

        <div
          class="relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors cursor-pointer"
          :class="dragging ? 'border-primary bg-primary/5' : 'border-default-300 hover:border-default-400'"
          @dragover.prevent="dragging = true"
          @dragleave="dragging = false"
          @drop.prevent="handleDrop"
          @click="fileInputRef?.click()"
        >
          <UIcon name="i-lucide-upload" class="size-6 text-default-400" />
          <p class="text-xs text-default-500">{{ t("common.upload") }}</p>
          <input
            ref="fileInputRef"
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            multiple
            class="hidden"
            @change="handleFileChange"
          />
        </div>

        <ul v-if="bicDocuments.length" class="mt-3 space-y-2">
          <li
            v-for="(file, index) in bicDocuments"
            :key="index"
            class="flex items-center gap-3 rounded-lg border border-default-200 bg-default-50 px-3 py-2"
          >
            <div class="size-10 shrink-0 overflow-hidden rounded-md bg-default-200 flex items-center justify-center text-default-500">
              <UIcon :name="file.type.startsWith('image/') ? 'i-lucide-image' : 'i-lucide-file-text'" class="size-5" />
            </div>
            <div class="flex min-w-0 flex-1 flex-col">
              <span class="truncate text-sm font-medium">{{ file.name }}</span>
              <span class="text-xs text-default-400">{{ (file.size / 1024 / 1024).toFixed(1) }}MB</span>
            </div>
            <div class="flex items-center gap-1">
               <UButton
                 icon="i-lucide-eye"
                 color="neutral"
                 variant="ghost"
                 size="xs"
                 @click="previewFile(file)"
               />
               <UButton
                 icon="i-lucide-x"
                 color="neutral"
                 variant="ghost"
                 size="xs"
                 @click="removeBicDocument(index)"
               />
            </div>
          </li>
         </ul>
       </div>

     </UCard>

    <div class="rounded-xl border border-warning/30 bg-gradient-to-br from-warning/5 to-warning/[0.02] p-4 sm:p-5 transition-shadow hover:shadow-sm">
      <div class="flex items-start gap-3">
        <div class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-warning/10">
          <UIcon
            name="i-lucide-badge-check"
            class="size-4 text-warning"
          />
        </div>
        <UFormField
          data-field="certified"
          name="certified"
          required
          class="min-w-0 flex-1"
          :ui="{ label: 'text-sm text-default' }"
        >
          <UCheckbox
            v-model="state.certified"
            :label="t('containers.registration.certify')"
          />
        </UFormField>
      </div>
    </div>

    <div class="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between sm:items-center pb-2 pt-2">
      <div class="flex items-center gap-2">
        <UButton
          v-if="!isEditMode && containerValidated"
          :label="t('common.autoMark')"
          icon="i-lucide-wand-2"
          color="primary"
          variant="ghost"
          size="sm"
          :disabled="!checkDigitAuto"
          @click="
            if (checkDigitAuto) {
              state.checkDigit = checkDigitAuto;
            }
          "
        />
      </div>
      <div class="flex flex-col-reverse gap-3 sm:flex-row">
        
        <UButton
          v-if="!isEditMode"
          :label="t('common.saveDraft')"
          icon="i-lucide-save"
          color="neutral"
          variant="outline"
          type="button"
          @click="emit('saveDraft')"
        />
        <UButton
          type="submit"
          :label="submitLabel"
          :trailing-icon="isEditMode ? undefined : 'i-lucide-arrow-right'"
          :icon="isEditMode ? 'i-lucide-save' : undefined"
          :loading="submitting"
          size="lg"
          class="px-6"
        />
      </div>
    </div>
  </UForm>
</template>

<style scoped>
.form-alert-enter-active {
  transition: all 0.25s ease-out;
}
.form-alert-leave-active {
  transition: all 0.2s ease-in;
}
.form-alert-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}
.form-alert-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
