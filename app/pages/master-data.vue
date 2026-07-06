<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import {
  MASTER_DATA_CATEGORIES,
  MASTER_DATA_CATEGORY_ICONS,
  categoryToSlug
} from '~/utils/master-data'

definePageMeta({
  layout: 'default',
  roles: ['Administrator']
})

const { t } = useI18n()
const route = useRoute()

const links = computed(() => [[
  ...MASTER_DATA_CATEGORIES.map(category => ({
    label: t(`masterData.categories.${category}`),
    icon: MASTER_DATA_CATEGORY_ICONS[category],
    to: `/master-data/${categoryToSlug(category)}`
  }))
]] satisfies NavigationMenuItem[][])

const activeCategoryLabel = computed(() => {
  const slug = route.params.category as string | undefined
  if (!slug) return t('masterData.title')

  const category = MASTER_DATA_CATEGORIES.find(value => categoryToSlug(value) === slug)
  return category ? t(`masterData.categories.${category}`) : t('masterData.title')
})
</script>

<template>
  <UDashboardPanel id="master-data" grow>
    <template #header>
      <UDashboardNavbar :title="activeCategoryLabel">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <UNavigationMenu :items="links" highlight class="-mx-1 flex-1" />
      </UDashboardToolbar>
    </template>

    <template #body>
      <div class="flex flex-col gap-4 sm:gap-6">
        <NuxtPage />
      </div>
    </template>
  </UDashboardPanel>
</template>
