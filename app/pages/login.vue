<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { encryptPassword } from '~/utils/crypto'

definePageMeta({
  layout: 'auth'
})

const schema = z.object({
  username: z.string().min(3, 'ຊື່ຜູ້ໃຊ້ຕ້ອງມີຢ່າງໜ້ອຍ 3 ຕົວອັກສອນ'),
  password: z.string().min(6, 'ລະຫັດຜ່ານຕ້ອງມີຢ່າງໜ້ອຍ 6 ຕົວອັກສອນ')
})

type Schema = z.output<typeof schema>

const state = reactive({
  username: '',
  password: ''
})

const loading = ref(false)
const showPassword = ref(false)
const toast = useToast()

async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true
  
  try {
    const encryptedBody = {
      ...event.data,
      password: encryptPassword(event.data.password)
    }

    await $fetch('/api/auth/login', {
      method: 'POST',
      body: encryptedBody
    })

    // Sync session state before navigation
    const { fetch } = useUserSession()
    await fetch()

    toast.add({
      title: 'ເຂົ້າສຳເລັດ',
      description: 'ຍິນດີຕ້ອນຮັບກັບເຂົ້າສູ່ລະບົບ',
      color: 'success'
    })
    
    await navigateTo('/dashboard')
  } catch (err: any) {
    toast.add({
      title: 'ເຂົ້າບ່ອນຜິດພາດ',
      description: err.data?.message || 'ເກີດຂໍ້ຜິດພາດບາງຢ່າງ',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="w-full max-w-sm">
    <div class="mb-8 flex justify-center">
       <div class="size-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 rotate-3">
         <UIcon name="i-lucide-layout-dashboard" class="size-10 text-white" />
       </div>
    </div>

    <UCard class="w-full shadow-xl border-neutral-200/50 dark:border-neutral-800/50 backdrop-blur-sm bg-white/80 dark:bg-neutral-900/80">
      <template #header>
        <div class="flex flex-col items-center gap-2 text-center">
          <h1 class="text-2xl font-bold tracking-tight">ເຂົ້າສູ່ລະບົບ</h1>
          <p class="text-sm text-neutral-500 dark:text-neutral-400">
            ປ້ອນຂໍ້ມູນເພື່ອເຂົ້າສູ່ລະບົບ
          </p>
        </div>
      </template>

      <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
        <UFormField label="Username" name="username">
          <UInput 
            v-model="state.username" 
            placeholder="Username" 
            icon="i-lucide-user"
            size="lg"
            class="w-full" 
          />
        </UFormField>

        <UFormField label="Password" name="password">
          <template #label>
            <div class="flex items-center justify-between w-full">
              <span>Password</span>
              <NuxtLink to="#" class="text-xs text-primary hover:underline">ລືມລະຫັດຜ່ານ?</NuxtLink>
            </div>
          </template>
          <UInput 
            v-model="state.password" 
            :type="showPassword ? 'text' : 'password'" 
            placeholder="••••••••" 
            icon="i-lucide-lock"
            size="lg"
            class="w-full" 
          >
            <template #trailing>
              <UButton
                color="neutral"
                variant="ghost"
                :icon="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                class="-me-1"
                @click="showPassword = !showPassword"
              />
            </template>
          </UInput>
        </UFormField>

        <UButton type="submit" block :loading="loading" size="lg" class="mt-6 font-semibold">
          ເຂົ້າສູ່ລະບົບ
        </UButton>
      </UForm>

      <template #footer>
        <p class="text-center text-sm text-neutral-500">
          ຍັງບໍ່ມີບັນຊີ? 
          <NuxtLink to="#" class="text-primary font-medium hover:underline">ສະໝັກສະມາຊິກ</NuxtLink>
        </p>
      </template>
    </UCard>
    
    <div class="mt-8 text-center">
      <p class="text-xs text-neutral-400">
        &copy; 2024 Admin Portal. All rights reserved.
      </p>
    </div>
  </div>
</template>
