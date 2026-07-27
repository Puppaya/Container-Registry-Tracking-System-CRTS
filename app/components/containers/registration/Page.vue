<script setup lang="ts">
import type { Container } from '~/types'
import { REGISTRATION_STEPS, getRegistrationStepForField } from '~/utils/container-registration'

const { t } = useI18n()

const props = withDefaults(defineProps<{
  mode?: 'create' | 'edit'
  containerId?: number
  container?: Container | null
  loading?: boolean
}>(), {
  mode: 'create',
  container: null,
  loading: false
})

const isEditMode = computed(() => props.mode === 'edit')

const {
  state,
  schema,
  containerValidated,
  validationMessage,
  validationError,
  validating,
  submitting,
  activeStep,
  checkDigitAuto,
  bicDocuments,
  loadDraft,
  loadFromContainer,
  saveDraft,
  normalizePrefixInput,
  validateContainerNumberField,
  onBicDocumentsChange,
  attemptRegistration,
  submitRegistration
} = useContainerRegistration({
  mode: props.mode,
  containerId: computed(() => props.containerId)
})

const formRef = useTemplateRef<{ sectionIds: Record<string, string> }>('formRef')
const scrollContainer = useTemplateRef<HTMLElement>('scrollContainer')

const breadcrumbItems = computed(() => {
  if (isEditMode.value) {
    return [
      { label: t('common.registry'), to: '/containers' },
      {
        label: props.container?.containerNumber || t('containers.title'),
        to: props.containerId ? `/containers/${props.containerId}` : undefined
      },
      { label: t('common.edit') }
    ]
  }

  return [
    { label: t('common.registry'), to: '/containers' },
    { label: t('containers.registerNew') }
  ]
})

const pageTitle = computed(() =>
  isEditMode.value ? t('containers.edit') : t('containers.registerNew')
)

const pageDescription = computed(() =>
  isEditMode.value
    ? t('containers.editDesc')
    : t('containers.registerDesc')
)

const navbarTitle = computed(() => {
  if (isEditMode.value && props.container) {
    return `${t('common.edit')} — ${props.container.containerNumber}`
  }
  return isEditMode.value ? t('containers.edit') : t('containers.registerNew')
})

const backTo = computed(() =>
  isEditMode.value && props.containerId
    ? `/containers/${props.containerId}`
    : '/containers'
)

const sectionObserver = ref<IntersectionObserver | null>(null)

function scrollToSection(sectionId: string) {
  activeStep.value = sectionId
  const elementId = formRef.value?.sectionIds[sectionId]
  if (!elementId) return

  document.getElementById(elementId)?.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  })
}

async function handleAttemptRegistration() {
  const failedField = await attemptRegistration()
  if (failedField) {
    scrollToSection(getRegistrationStepForField(String(failedField)))
  }
}

function setupSectionObserver() {
  sectionObserver.value?.disconnect()

  if (!import.meta.client) return

  const sections = Object.values(formRef.value?.sectionIds || {})
  if (!sections.length) return

  sectionObserver.value = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)

      if (!visible.length) return

      const id = visible[0]?.target.id
      const match = Object.entries(formRef.value?.sectionIds || {}).find(([, value]) => value === id)
      if (match) {
        activeStep.value = match[0]
      }
    },
    {
      root: scrollContainer.value,
      rootMargin: '-20% 0px -55% 0px',
      threshold: [0.15, 0.35, 0.55]
    }
  )

  for (const sectionId of sections) {
    const element = document.getElementById(sectionId)
    if (element) {
      sectionObserver.value.observe(element)
    }
  }
}

watch(
  () => props.container,
  (container) => {
    if (isEditMode.value && container) {
      loadFromContainer(container)
      nextTick(() => setupSectionObserver())
    }
  },
  { immediate: true }
)

onMounted(() => {
  if (!isEditMode.value) {
    loadDraft()
  }
  nextTick(() => setupSectionObserver())
})

onBeforeUnmount(() => {
  sectionObserver.value?.disconnect()
})
</script>

<template>
  <UDashboardPanel :id="isEditMode ? 'container-edit' : 'container-register'" grow>
    <template #header>
      <UDashboardNavbar :title="navbarTitle">
        <template #leading>
          <div class="flex items-center gap-2">
            <UDashboardSidebarCollapse />
            <UButton
              icon="i-lucide-arrow-left"
              color="neutral"
              variant="ghost"
              :to="backTo"
            />
          </div>
        </template>

        <template #right>
          <UBadge color="success" variant="subtle" class="font-mono hidden sm:inline-flex">
            <span class="size-1.5 rounded-full bg-success mr-1.5" />
            {{ t('common.active') }}
          </UBadge>
          <UBadge color="neutral" variant="outline" class="font-mono hidden md:inline-flex">
            BIC-ISO 6346
          </UBadge>
          <UButton
            v-if="!isEditMode"
            :label="t('common.quickEntry')"
            icon="i-lucide-plus"
            to="/containers/scan"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div v-if="loading" class="flex justify-center py-12">
        <UIcon name="i-lucide-loader-circle" class="size-8 animate-spin text-primary" />
      </div>

      <div v-else-if="isEditMode && !container" class="p-6">
        <UAlert color="error" icon="i-lucide-alert-circle" :title="t('containers.notFound')" />
      </div>

      <div v-else class="flex min-h-full flex-col">
        <div
          ref="scrollContainer"
          class="flex-1 overflow-y-auto"
        >
          <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div class="mb-6 space-y-3">
              <UBreadcrumb :items="breadcrumbItems" />

              <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h1 class="text-2xl font-bold tracking-tight font-display">
                    {{ pageTitle }}
                  </h1>
                  <p class="mt-1 text-sm text-muted">
                    {{ pageDescription }}
                  </p>
                  <p
                    v-if="isEditMode && container"
                    class="mt-1 font-mono text-sm text-muted"
                  >
                    {{ container.containerNumber }}
                  </p>
                </div>

                <div class="flex flex-wrap gap-2 lg:justify-end">
                  <UBadge color="success" variant="subtle" class="font-mono sm:hidden">
                    {{ t('common.active') }}
                  </UBadge>
                  <UBadge color="neutral" variant="outline" class="font-mono md:hidden">
                    BIC-ISO 6346
                  </UBadge>
                </div>
              </div>
            </div>

            <div class="mb-6 lg:hidden">
              <div class="flex gap-2 overflow-x-auto pb-1">
                <UButton
                  v-for="(step, index) in REGISTRATION_STEPS"
                  :key="step.value"
                  size="sm"
                  :color="activeStep === step.value ? 'primary' : 'neutral'"
                  :variant="activeStep === step.value ? 'solid' : 'outline'"
                  class="shrink-0 font-mono"
                  @click="scrollToSection(step.value)"
                >
                  {{ index + 1 }}. {{ t(`containers.registration.steps.${step.value}`) }}
                </UButton>
              </div>
            </div>

            <div class="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
              <aside class="hidden lg:block">
                <div class="sticky top-6">
                  <ContainersRegistrationStepper
                    :active-step="activeStep"
                    @update:active-step="scrollToSection"
                    @navigate="scrollToSection"
                  />
                </div>
              </aside>

              <div class="min-w-0">
                <ContainersRegistrationForm
                  ref="formRef"
                  :mode="mode"
                  :state="state"
                  :schema="schema"
                  :bic-documents="bicDocuments"
                  :container-validated="containerValidated"
                  :validation-message="validationMessage"
                  :validation-error="validationError"
                  :validating="validating"
                  :submitting="submitting"
                  :check-digit-auto="checkDigitAuto"
                  @validate="validateContainerNumberField"
                  @normalize-prefix="normalizePrefixInput"
                  @save-draft="saveDraft"
                  @bic-documents="onBicDocumentsChange"
                  @attempt-submit="handleAttemptRegistration"
                  @submit="handleAttemptRegistration"
                  @validation-error="scrollToSection(getRegistrationStepForField($event))"
                />
              </div>
            </div>
          </div>
        </div>

        <ContainersRegistrationFooter />
      </div>
    </template>
  </UDashboardPanel>
</template>
