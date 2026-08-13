<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { Container } from '~/types'
import {
  normalizeContainerNumber,
  resolveContainerNumberInput,
  validateContainerNumber
} from '~/utils/container-validation'

const props = defineProps<{
  container?: Container | null
}>()

const emit = defineEmits(['success', 'cancel'])

const schema = z.object({
  containerNumber: z.string().min(1, 'ກະລຸນາປ້ອນເລກຕູຄອນເທນເນອກ'),
  isoType: z.string().min(1, 'ISO type is required'),
  containerSize: z.string().min(1, 'Size is required'),
  containerCategory: z.string().min(1, 'Category is required'),
  owner: z.string().min(1, 'Owner is required'),
  manufacturer: z.string().optional().or(z.literal('')),
  yearBuilt: z.coerce.number().int().min(1900).max(new Date().getFullYear()).optional().or(z.literal('')),
  registrationDate: z.string().min(1, 'Registration date is required'),
  status: z.enum(['Active', 'Inactive', 'Pending'])
}).superRefine((data, ctx) => {
  const resolved = resolveContainerNumberInput(data.containerNumber)
  const result = validateContainerNumber(resolved)
  if (!result.valid) {
    ctx.addIssue({
      code: 'custom',
      path: ['containerNumber'],
      message: result.error || 'ເລກຕູຄອນເທນເນອກບໍ່ຖືກຕ້ອງ'
    })
  }
})

type Schema = z.infer<typeof schema>

const defaultState = (): Schema => ({
  containerNumber: '',
  isoType: '',
  containerSize: '20',
  containerCategory: 'Dry',
  owner: '',
  manufacturer: '',
  yearBuilt: undefined,
  registrationDate: new Date().toISOString().slice(0, 10),
  status: 'Active'
})

const state = reactive<Schema>(defaultState())

const checkDigitHint = computed(() => {
  const normalized = normalizeContainerNumber(state.containerNumber)
  if (normalized.length < 10) return null

  try {
    const resolved = resolveContainerNumberInput(normalized)
    if (resolved.length === 11) {
      return `ເລກທີ່ຖືກຕ້ອງ: ${resolved}`
    }
  } catch {
    return null
  }

  return null
})

const { getOptions } = useMasterDataOptions()

const sizeOptions = computed(() => getOptions('ContainerSize'))
const categoryOptions = computed(() => getOptions('ContainerCategory'))
const isoTypeOptions = computed(() => getOptions('IsoType'))
const ownerOptions = computed(() => getOptions('Owner'))

const { execute: saveContainer, loading } = useApiAction()

function buildPayload(form: Schema) {
  return {
    ...form,
    containerNumber: resolveContainerNumberInput(form.containerNumber),
    manufacturer: form.manufacturer || undefined,
    yearBuilt: form.yearBuilt === '' || form.yearBuilt === undefined ? undefined : Number(form.yearBuilt)
  }
}

function normalizeContainerInput() {
  if (props.container) return

  const normalized = normalizeContainerNumber(state.containerNumber)
  if (normalized.length < 10) {
    state.containerNumber = normalized
    return
  }

  try {
    state.containerNumber = resolveContainerNumberInput(normalized)
  } catch {
    state.containerNumber = normalized
  }
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  const url = props.container
    ? `/api/containers/${props.container.containerId}`
    : '/api/containers'
  const method = props.container ? 'PUT' : 'POST'

  const { error } = await saveContainer(
    () => $fetch(url, { method, body: buildPayload(event.data) }) as Promise<any>,
    {
      successMessage: props.container
        ? 'ແກ້ໄຂຂໍ້ມູນຕູຄອນເທນເນອກສຳເລັດ'
        : 'ລົງທະບຽນຕູຄອນເທນເນອກສຳເລັດ'
    }
  )

  if (!error) {
    emit('success')
  }
}

watch(() => props.container, (container) => {
  if (container) {
    state.containerNumber = container.containerNumber
    state.isoType = container.isoType
    state.containerSize = container.containerSize
    state.containerCategory = container.containerCategory
    state.owner = container.owner
    state.manufacturer = container.manufacturer || ''
    state.yearBuilt = container.yearBuilt ?? undefined
    state.registrationDate = container.registrationDate.slice(0, 10)
    state.status = container.status
  } else {
    Object.assign(state, defaultState())
  }
}, { immediate: true })
</script>

<template>
  <UForm :schema="schema" :state="state" class="space-y-6" @submit="onSubmit">
    <UFormField
      label="ເລກຕູຄອນເທນເນອກ"
      name="containerNumber"
      :help="checkDigitHint || 'ປ້ອນ 4 ຕົວອັກສອນ + 6 ຕົວເລກ — ລະບົບຈະຄິດ check digit ໃຫ້ອັດຕະໂນມັດ'"
    >
      <UInput
        v-model="state.containerNumber"
        class="w-full font-mono uppercase"
        icon="i-lucide-hash"
        placeholder="MSCU123456"
        :disabled="!!container"
        @blur="normalizeContainerInput"
      />
    </UFormField>

    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <UFormField label="ISO Type" name="isoType">
        <USelect v-model="state.isoType" :items="isoTypeOptions" class="w-full" />
      </UFormField>

      <UFormField label="ຂະໜາດ" name="containerSize">
        <USelect v-model="state.containerSize" :items="sizeOptions" class="w-full" />
      </UFormField>
    </div>

    <UFormField label="ປະເພດ" name="containerCategory">
      <USelect v-model="state.containerCategory" :items="categoryOptions" class="w-full" />
    </UFormField>

    <UFormField label="ເຈົ້າຂອງ" name="owner">
      <USelect v-model="state.owner" :items="ownerOptions" class="w-full" icon="i-lucide-building-2" />
    </UFormField>

    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <UFormField label="ຜູ້ຜະລິດ" name="manufacturer">
        <UInput v-model="state.manufacturer" class="w-full" />
      </UFormField>

      <UFormField label="ປີຜະລິດ" name="yearBuilt">
        <UInput v-model="state.yearBuilt" type="number" class="w-full" placeholder="2020" />
      </UFormField>
    </div>

    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <UFormField label="ວັນລົງທະບຽນ" name="registrationDate">
        <AppDateInput v-model="state.registrationDate" class="w-full" />
      </UFormField>

      <UFormField label="ສະຖານະ" name="status">
        <USelect
          v-model="state.status"
          :items="[
            { label: 'Active', value: 'Active' },
            { label: 'Inactive', value: 'Inactive' }
          ]"
          class="w-full"
        />
      </UFormField>
    </div>

    <div class="flex justify-end gap-3 border-t border-default pt-6">
      <UButton label="ຍົກເລີກ" color="neutral" variant="ghost" @click="$emit('cancel')" />
      <UButton
        type="submit"
        :label="container ? 'ບັນທຶກ' : 'ລົງທະບຽນ'"
        :loading="loading"
        icon="i-lucide-save"
      />
    </div>
  </UForm>
</template>
