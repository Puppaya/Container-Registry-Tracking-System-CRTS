<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const props = defineProps<{
  user?: any
}>()

const emit = defineEmits(['success', 'cancel'])

const isEdit = computed(() => !!props.user)

const roleOptions = [
  { label: 'Administrator', value: 'Administrator' },
  { label: 'Registry Officer', value: 'RegistryOfficer' },
  { label: 'Survey Team', value: 'SurveyTeam' },
  { label: 'Management', value: 'Management' }
]

const schema = z.object({
  username: z.string().min(3, 'Username ຕ້ອງມີຢ່າງໜ້ອຍ 3 ຕົວອັກສອນ'),
  name: z.string().min(2, 'ຊື່ສັ້ນເກີນໄປ'),
  email: z.string().email('ອີເມວບໍ່ຖືກຕ້ອງ'),
  password: z.string().min(6, 'Password ຕ້ອງມີຢ່າງໜ້ອຍ 6 ຕົວອັກສອນ').optional().or(z.literal('')),
  role: z.enum(['Administrator', 'RegistryOfficer', 'SurveyTeam', 'Management'])
})

type Schema = z.infer<typeof schema>

const defaultState = (): Schema => ({
  username: '',
  name: '',
  email: '',
  password: '',
  role: 'SurveyTeam'
})

const state = reactive<Schema>(defaultState())

const { encryptPassword } = useCrypto()
const { execute: saveUser, loading } = useApiAction()
const showPassword = ref(false)

async function onSubmit(event: FormSubmitEvent<Schema>) {
  const url = props.user ? `/api/users/${props.user.id}` : '/api/users'
  const method = props.user ? 'PATCH' : 'POST'

  const body = { ...event.data }
  if (props.user && !body.password) {
    delete (body as any).password
  } else if (body.password) {
    body.password = encryptPassword(body.password)
  }

  const { error } = await saveUser(
    () => $fetch(url as any, { method: method as any, body }) as any,
    { successMessage: props.user ? 'ແກ້ໄຂຂໍ້ມູນສຳເລັດ' : 'ສ້າງ User ສຳເລັດ' }
  )

  if (!error) {
    emit('success')
  }
}

watch(() => props.user, (newVal) => {
  if (newVal) {
    state.username = newVal.username
    state.name = newVal.name
    state.email = newVal.email
    state.role = newVal.role
    state.password = ''
  } else {
    Object.assign(state, defaultState())
  }
  showPassword.value = false
}, { immediate: true })
</script>

<template>
  <UForm
    id="user-form"
    :schema="schema"
    :state="state"
    class="space-y-6"
    @submit="onSubmit"
  >
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <UFormField label="Username" name="username" required>
        <UInput
          v-model="state.username"
          icon="i-lucide-at-sign"
          placeholder="username"
          class="w-full"
          :disabled="isEdit"
        />
      </UFormField>

      <UFormField label="ຊື່-ນາມສະກຸນ" name="name" required>
        <UInput
          v-model="state.name"
          icon="i-lucide-user"
          placeholder="Full Name"
          class="w-full"
        />
      </UFormField>
    </div>

    <UFormField label="ອີເມວ" name="email" required>
      <UInput
        v-model="state.email"
        type="email"
        icon="i-lucide-mail"
        placeholder="email@example.com"
        class="w-full"
      />
    </UFormField>

    <UFormField
      :label="isEdit ? 'ລະຫັດຜ່ານໃໝ່ (ບໍ່ບັງຄັບ)' : 'ລະຫັດຜ່ານ'"
      name="password"
      :required="!isEdit"
      :help="isEdit ? 'ປ່ອຍວ່າງຖ້າບໍ່ຕ້ອງການປ່ຽນ' : 'ຢ່າງໜ້ອຍ 6 ຕົວອັກສອນ'"
    >
      <UInput
        v-model="state.password"
        :type="showPassword ? 'text' : 'password'"
        icon="i-lucide-lock"
        placeholder="••••••••"
        class="w-full"
      >
        <template #trailing>
          <UButton
            color="neutral"
            variant="ghost"
            size="xs"
            :icon="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
            :aria-label="showPassword ? 'Hide password' : 'Show password'"
            @click="showPassword = !showPassword"
          />
        </template>
      </UInput>
    </UFormField>

    <UFormField label="ບົດບາດ" name="role" required>
      <USelect
        v-model="state.role"
        :items="roleOptions"
        class="w-full"
      />
    </UFormField>

    <div class="flex justify-end gap-3 pt-6 border-t border-default">
      <UButton
        label="ຍົກເລີກ"
        color="neutral"
        variant="ghost"
        @click="$emit('cancel')"
      />
      <UButton
        type="submit"
        :label="isEdit ? 'ບັນທຶກ' : 'ເພີ່ມຜູ້ໃຊ້'"
        :loading="loading"
        icon="i-lucide-save"
      />
    </div>
  </UForm>
</template>
