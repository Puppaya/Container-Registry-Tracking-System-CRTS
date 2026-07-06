<script setup lang="ts">
import { refDebounced } from '@vueuse/core'
import type { Container } from '~/types'

const props = defineProps<{
  collapsed?: boolean
}>()

const { t } = useI18n()

const query = ref('')
const debouncedQuery = refDebounced(query, 300)
const isFocused = ref(false)
const results = ref<Container[]>([])
const pending = ref(false)

watch(debouncedQuery, async (value) => {
  const term = value.trim()
  if (term.length < 2) {
    results.value = []
    return
  }

  pending.value = true
  try {
    const response = await $fetch<{ data: Container[] }>('/api/containers/search', {
      query: { q: term, limit: 8 }
    })
    results.value = response.data || []
  } catch {
    results.value = []
  } finally {
    pending.value = false
  }
})

const showDropdown = computed(() =>
  isFocused.value && debouncedQuery.value.trim().length >= 2
)

function goToAdvancedSearch() {
  navigateTo(`/containers/search?q=${encodeURIComponent(query.value.trim())}`)
}

function selectContainer(container: Container) {
  query.value = ''
  isFocused.value = false
  navigateTo(`/containers/${container.containerId}`)
}

function onBlur() {
  setTimeout(() => {
    isFocused.value = false
  }, 150)
}
</script>

<template>
  <div class="relative px-2 mb-2">
    <UInput
      v-model="query"
      :placeholder="t('containers.quickSearch.placeholder')"
      icon="i-lucide-search"
      size="sm"
      class="w-full"
      @focus="isFocused = true"
      @blur="onBlur"
      @keyup.enter="goToAdvancedSearch"
    />

    <div
      v-if="showDropdown"
      class="absolute left-2 right-2 top-full z-50 mt-1 rounded-lg border border-default bg-white dark:bg-neutral-900 shadow-lg overflow-hidden"
    >
      <div v-if="pending" class="p-3 text-sm text-neutral-500">
        {{ t('containers.quickSearch.searching') }}
      </div>

      <ul v-else-if="results.length" class="max-h-64 overflow-y-auto">
        <li
          v-for="item in results"
          :key="item.containerId"
        >
          <button
            type="button"
            class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-elevated/50"
            @mousedown.prevent="selectContainer(item)"
          >
            <UIcon name="i-lucide-container" class="size-4 shrink-0 text-neutral-400" />
            <div class="min-w-0 flex-1">
              <div class="font-mono font-medium truncate">{{ item.containerNumber }}</div>
              <div class="text-xs text-neutral-500 truncate">{{ item.owner }}</div>
            </div>
            <ContainersContainerStatusBadge :status="item.status" />
          </button>
        </li>
      </ul>

      <div v-else class="p-3 text-sm text-neutral-500">
        {{ t('containers.quickSearch.noResults') }}
      </div>

      <button
        type="button"
        class="w-full border-t border-default px-3 py-2 text-left text-xs text-primary hover:bg-elevated/50"
        @mousedown.prevent="goToAdvancedSearch"
      >
        {{ t('containers.quickSearch.advanced') }}
      </button>
    </div>
  </div>
</template>
