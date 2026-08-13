import type { FormSubmitEvent } from '@nuxt/ui'
import type { Container } from '~/types'
import {
  autoFillCheckDigit,
  buildContainerPayload,
  createContainerRegistrationSchema,
  containerToRegistrationState,
  createDefaultRegistrationState,
  DRAFT_STORAGE_KEY,
  formatContainerPrefixInput,
  getRegistrationStepForField,
  type ContainerRegistrationFormState,
  type ContainerRegistrationSchema,
  validateBicDocument,
  validateContainerPrefixAndDigit
} from '~/utils/container-registration'

export interface UseContainerRegistrationOptions {
  mode?: 'create' | 'edit'
  containerId?: MaybeRef<number | undefined>
}

export function useContainerRegistration(options: UseContainerRegistrationOptions = {}) {
  const mode = options.mode ?? 'create'
  const isEditMode = mode === 'edit'
  const containerId = toRef(options.containerId)

  const toast = useToast()
  const router = useRouter()
  const { t } = useI18n()
  const schema = createContainerRegistrationSchema(t)
  const { execute: runAction, loading: submitting } = useApiAction()

  const state = reactive<ContainerRegistrationFormState>(createDefaultRegistrationState())
  const bicDocuments = ref<File[]>([])
  const containerValidated = ref(false)
  const validationMessage = ref<string | null>(null)
  const validationError = ref<string | null>(null)
  const validating = ref(false)
  const activeStep = ref<string>('identification')

  const checkDigitAuto = computed(() => autoFillCheckDigit(state.containerPrefix))

  watch(() => state.containerPrefix, () => {
    if (isEditMode) return

    containerValidated.value = false
    validationMessage.value = null
    validationError.value = null

    const auto = checkDigitAuto.value
    if (auto && !state.checkDigit) {
      state.checkDigit = auto
    }
  })

  watch(() => state.checkDigit, () => {
    if (isEditMode) return

    containerValidated.value = false
    validationMessage.value = null
    validationError.value = null
  })

  function loadDraft() {
    if (isEditMode || !import.meta.client) return

    try {
      const raw = localStorage.getItem(DRAFT_STORAGE_KEY)
      if (!raw) return

      const parsed = JSON.parse(raw) as Partial<ContainerRegistrationFormState>
      Object.assign(state, createDefaultRegistrationState(), parsed)
      toast.add({
        title: 'Draft restored',
        description: 'Your saved registration draft has been loaded.',
        color: 'info',
        icon: 'i-lucide-file-clock'
      })
    } catch {
      localStorage.removeItem(DRAFT_STORAGE_KEY)
    }
  }

  function loadFromContainer(container: Container) {
    Object.assign(state, containerToRegistrationState(container))
    containerValidated.value = true
    validationMessage.value = `Registered unit: ${container.containerNumber}`
    validationError.value = null
  }

  function saveDraft() {
    if (isEditMode || !import.meta.client) return

    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({ ...state }))
    toast.add({
      title: 'Draft saved',
      description: 'Registration progress saved locally.',
      color: 'success',
      icon: 'i-lucide-save'
    })
  }

  function clearDraft() {
    if (import.meta.client) {
      localStorage.removeItem(DRAFT_STORAGE_KEY)
    }
  }

  function resetForm() {
    Object.assign(state, createDefaultRegistrationState())
    bicDocuments.value = []
    containerValidated.value = false
    validationMessage.value = null
    validationError.value = null
  }

  function normalizePrefixInput() {
    if (isEditMode) return
    state.containerPrefix = formatContainerPrefixInput(state.containerPrefix)
  }

  async function validateContainerNumberField() {
    if (isEditMode) return true

    validating.value = true
    validationMessage.value = null
    validationError.value = null

    try {
      normalizePrefixInput()

      if (state.containerPrefix.length < 10) {
        validationError.value = 'Enter 4 letters followed by 6 digits before validating.'
        containerValidated.value = false
        return false
      }

      if (!state.checkDigit && checkDigitAuto.value) {
        state.checkDigit = checkDigitAuto.value
      }

      const result = validateContainerPrefixAndDigit(state.containerPrefix, state.checkDigit)

      if (!result.valid) {
        validationError.value = result.error || 'Container number validation failed'
        containerValidated.value = false
        toast.add({
          title: 'Validation failed',
          description: validationError.value,
          color: 'error',
          icon: 'i-lucide-circle-x'
        })
        return false
      }

      containerValidated.value = true
      validationMessage.value = `Valid BIC number: ${result.normalized}`
      toast.add({
        title: 'Validation passed',
        description: validationMessage.value,
        color: 'success',
        icon: 'i-lucide-circle-check'
      })
      return true
    } finally {
      validating.value = false
    }
  }

  function onBicDocumentsChange(files: File | File[] | null | undefined) {
    if (!files) {
      bicDocuments.value = []
      return
    }

    const incoming = Array.isArray(files) ? files : [files]
    const validFiles: File[] = []

    for (const file of incoming) {
      const result = validateBicDocument(file)
      if (!result.valid) {
        toast.add({
          title: 'Invalid file',
          description: result.error,
          color: 'error',
          icon: 'i-lucide-file-warning'
        })
        continue
      }
      validFiles.push(file)
    }

    bicDocuments.value = validFiles
  }

  async function uploadBicDocuments(targetContainerId: number) {
    for (const file of bicDocuments.value) {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('documentType', 'Certificate')

      await $fetch(`/api/containers/${targetContainerId}/documents`, {
        method: 'POST',
        body: formData
      })
    }
  }

  async function submitRegistration(_event?: FormSubmitEvent<ContainerRegistrationSchema>) {
    const parsed = containerRegistrationSchema.safeParse(state)
    if (!parsed.success) {
      const issue = parsed.error.issues[0]
      activeStep.value = getRegistrationStepForField(String(issue?.path[0] ?? 'identification'))
      toast.add({
        title: 'Cannot register container',
        description: issue?.message || 'Please review the highlighted fields.',
        color: 'error',
        icon: 'i-lucide-circle-x'
      })
      return issue?.path[0] as string | undefined
    }

    if (!isEditMode && !containerValidated.value) {
      const isValid = await validateContainerNumberField()
      if (!isValid) {
        activeStep.value = 'identification'
        return 'containerPrefix'
      }
    }

    const payload = buildContainerPayload(parsed.data, containerValidated.value)

    if (isEditMode) {
      const id = containerId.value
      if (!id) return

      const { containerNumber: _containerNumber, ...updatePayload } = payload

      const { error } = await runAction(
        () => $fetch(`/api/containers/${id}`, {
          method: 'PUT',
          body: updatePayload
        }) as Promise<any>,
        { successMessage: 'Container updated successfully' }
      )

      if (error) return undefined

      if (bicDocuments.value.length) {
        try {
          await uploadBicDocuments(id)
        } catch {
          toast.add({
            title: 'Partial success',
            description: 'Container was updated but some documents failed to upload.',
            color: 'warning',
            icon: 'i-lucide-alert-triangle'
          })
        }
      }

      await router.push(`/containers/${id}`)
      return undefined
    }

    const { data, error } = await runAction(
      () => $fetch('/api/containers', {
        method: 'POST',
        body: payload
      }) as Promise<any>,
      { successMessage: 'Container registered successfully' }
    )

    if (error || !data) {
      return undefined
    }

    const container = data as Container

    if (bicDocuments.value.length) {
      try {
        await uploadBicDocuments(container.containerId)
      } catch {
        toast.add({
          title: 'Partial success',
          description: 'Container was registered but some documents failed to upload.',
          color: 'warning',
          icon: 'i-lucide-alert-triangle'
        })
      }
    }

    clearDraft()
    resetForm()
    await router.push(`/containers/${container.containerId}`)
    return undefined
  }

  async function attemptRegistration() {
    const failedField = await submitRegistration()
    return failedField ?? null
  }

  return {
    isEditMode,
    state,
    schema,
    bicDocuments,
    containerValidated,
    validationMessage,
    validationError,
    validating,
    submitting,
    activeStep,
    checkDigitAuto,
    loadDraft,
    loadFromContainer,
    saveDraft,
    normalizePrefixInput,
    validateContainerNumberField,
    onBicDocumentsChange,
    attemptRegistration,
    submitRegistration
  }
}
