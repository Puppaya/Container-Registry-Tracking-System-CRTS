<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

defineProps<{
  collapsed?: boolean
}>()

const { t } = useI18n()
const colorMode = useColorMode()

const { user: sessionUserRef } = useUserSession()

const user = computed(() => {
  const sessionUser = sessionUserRef.value as {
    name?: string
    username?: string
    role?: string
    avatar?: string
  } | null

  return {
    name: sessionUser?.name || sessionUser?.username || 'User',
    role: sessionUser?.role || '',
    avatar: {
      src: sessionUser?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${sessionUser?.username || 'U'}`,
      alt: sessionUser?.name || 'User'
    }
  }
})

const toast = useToast()

const logout = async () => {
  await $fetch('/api/auth/logout', { method: 'POST' })

  toast.add({
    title: t('auth.logoutSuccess'),
    icon: 'i-lucide-check',
    color: 'success'
  })

  window.location.href = '/login'
}

const items = computed<DropdownMenuItem[][]>(() => ([[{
  type: 'label',
  label: user.value.name,
  avatar: user.value.avatar
}, {
  type: 'label',
  label: user.value.role,
  class: 'text-xs text-muted -mt-1'
}], [{
  label: t('userMenu.appearance'),
  icon: 'i-lucide-sun-moon',
  children: [{
    label: t('userMenu.light'),
    icon: 'i-lucide-sun',
    type: 'checkbox',
    checked: colorMode.value === 'light',
    onSelect(e: Event) {
      e.preventDefault()
      colorMode.preference = 'light'
    }
  }, {
    label: t('userMenu.dark'),
    icon: 'i-lucide-moon',
    type: 'checkbox',
    checked: colorMode.value === 'dark',
    onUpdateChecked(checked: boolean) {
      if (checked) {
        colorMode.preference = 'dark'
      }
    },
    onSelect(e: Event) {
      e.preventDefault()
    }
  }]
}], [{
  label: t('auth.logout'),
  icon: 'i-lucide-log-out',
  onSelect: logout
}]]))
</script>

<template>
  <UDropdownMenu
    :items="items"
    :content="{ align: 'center', collisionPadding: 12 }"
    :ui="{ content: collapsed ? 'w-48' : 'w-(--reka-dropdown-menu-trigger-width)' }"
  >
    <UButton
      v-bind="{
        ...user,
        label: collapsed ? undefined : user?.name,
        trailingIcon: collapsed ? undefined : 'i-lucide-chevrons-up-down'
      }"
      color="neutral"
      variant="ghost"
      block
      :square="collapsed"
      class="data-[state=open]:bg-elevated"
      :ui="{
        trailingIcon: 'text-dimmed'
      }"
    />
  </UDropdownMenu>
</template>
