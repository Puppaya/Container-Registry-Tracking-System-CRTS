<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

defineProps<{
  collapsed?: boolean
}>()

const { locale, locales, setLocale, t } = useI18n()

const items = computed<DropdownMenuItem[][]>(() => [
  [{
    type: 'label',
    label: t('language.label')
  }],
  (locales.value as Array<{ code: string, name?: string }>).map(entry => ({
    label: entry.name || entry.code,
    icon: locale.value === entry.code ? 'i-lucide-check' : undefined,
    onSelect() {
      setLocale(entry.code as 'en' | 'lo')
    }
  }))
])
</script>

<template>
  <UDropdownMenu
    :items="items"
    :content="{ align: 'start', collisionPadding: 12 }"
  >
    <UButton
      color="neutral"
      variant="ghost"
      :icon="locale === 'lo' ? 'i-lucide-languages' : 'i-lucide-languages'"
      :label="collapsed ? undefined : (locale === 'lo' ? 'ລາວ' : 'EN')"
      :square="collapsed"
      class="data-[state=open]:bg-elevated"
    />
  </UDropdownMenu>
</template>
