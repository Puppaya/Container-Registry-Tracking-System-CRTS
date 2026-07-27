<script setup lang="ts">
const { t } = useI18n()

const statusFilter = defineModel<string>('statusFilter', { default: 'all' })
const ownerFilter = defineModel<string>('ownerFilter', { default: 'all' })
const sizeFilter = defineModel<string>('sizeFilter', { default: 'all' })

defineProps<{
  ownerOptions?: Array<{ label: string, value: string }>
  exporting?: boolean
}>()

const emit = defineEmits<{
  clear: []
  export: []
}>()

const statusOptions = [
  { label: t('common.allStatuses'), value: 'all' },
  { label: t('common.active'), value: 'Active' },
  { label: t('common.inactive'), value: 'Inactive' }
]

const sizeOptions = [
  { label: "20'", value: '20' },
  { label: "40'", value: '40' },
  { label: "45'", value: '45' }
]
</script>

<template>
  <div class="registry-filter-bar">
    <div class="registry-filter-fields">
      <div class="registry-filter-field">
        <label class="ds-field-label">{{ t('containers.filters.status') }}</label>
        <USelect
          v-model="statusFilter"
          :items="statusOptions"
          class="min-w-40"
        />
      </div>

      <div class="registry-filter-field">
        <label class="ds-field-label">{{ t('containers.filters.owner') }}</label>
        <USelect
          v-model="ownerFilter"
          :items="ownerOptions || [{ label: t('common.allOwners'), value: 'all' }]"
          class="min-w-44"
        />
      </div>

      <div class="registry-filter-field">
        <label class="ds-field-label">{{ t('containers.filters.isoSize') }}</label>
        <div class="registry-size-toggle">
          <button
            v-for="option in sizeOptions"
            :key="option.value"
            type="button"
            class="registry-size-toggle__btn"
            :class="{ 'registry-size-toggle__btn--active': sizeFilter === option.value }"
            @click="sizeFilter = sizeFilter === option.value ? 'all' : option.value"
          >
            {{ option.label }}
          </button>
        </div>
      </div>
    </div>

    <div class="registry-filter-actions">
      <button
        type="button"
        class="registry-filter-clear"
        @click="emit('clear')"
      >
        {{ t('common.clearFilters') }}
      </button>
      <UButton
        :label="$t('common.exportCsv')"
        icon="i-lucide-download"
        color="neutral"
        variant="outline"
        size="sm"
        :loading="exporting"
        @click="emit('export')"
      />
    </div>
  </div>
</template>

<style scoped>
.registry-filter-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem 1.5rem;
  padding: 1rem 1.25rem;
  border: 1px solid color-mix(in srgb, var(--ds-border) 80%, transparent);
  border-radius: var(--radius-md);
  background: var(--color-surface-container-low);
}

.registry-filter-fields {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 1rem 1.5rem;
  flex: 1;
  min-width: 0;
}

.registry-filter-field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.registry-size-toggle {
  display: inline-flex;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--ds-border) 80%, transparent);
  border-radius: var(--radius-md);
  background: white;
}

.registry-size-toggle__btn {
  min-width: 3rem;
  padding: 0.5rem 0.875rem;
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-on-surface-variant);
  transition: background-color 0.15s, color 0.15s;
}

.registry-size-toggle__btn:not(:last-child) {
  border-right: 1px solid color-mix(in srgb, var(--ds-border) 80%, transparent);
}

.registry-size-toggle__btn:hover {
  background: color-mix(in srgb, var(--color-primary) 4%, white);
  color: var(--color-primary);
}

.registry-size-toggle__btn--active {
  background: var(--color-primary);
  color: white;
}

.registry-size-toggle__btn--active:hover {
  background: var(--color-primary-container);
  color: white;
}

.registry-filter-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
}

.registry-filter-clear {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-primary-container);
  transition: color 0.15s;
}

.registry-filter-clear:hover {
  color: var(--color-primary);
}
</style>
