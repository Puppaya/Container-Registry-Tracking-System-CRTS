<script setup lang="ts">
const props = withDefaults(defineProps<{
  icon?: string
  title: string
  description?: string
  variant?: 'default' | 'inline' | 'positive' | 'compact'
  actionLabel?: string
  actionTo?: string
  actionIcon?: string
  actionVariant?: 'solid' | 'outline' | 'link' | 'ghost' | 'subtle'
  actionSize?: 'xs' | 'sm' | 'md'
  actionLoading?: boolean
}>(), {
  icon: 'i-lucide-inbox',
  variant: 'default',
  actionVariant: 'outline',
  actionSize: 'sm'
})

const emit = defineEmits<{ action: [] }>()

const containerClass = computed(() => {
  switch (props.variant) {
    case 'inline':
      return 'py-10 px-4 text-center'
    case 'compact':
      return 'py-8 px-4 text-center'
    case 'positive':
      return 'flex items-center justify-center py-8 px-4'
    default:
      return 'rounded-lg border border-dashed border-default p-6 sm:p-8 text-center'
  }
})

const iconClass = computed(() => {
  if (props.variant === 'positive') {
    return 'size-4 shrink-0 text-success'
  }
  if (props.variant === 'compact') {
    return 'size-6 text-muted mx-auto mb-2'
  }
  return 'size-8 text-muted mx-auto mb-2'
})

const titleClass = computed(() => {
  if (props.variant === 'positive') {
    return 'text-sm text-success'
  }
  return 'text-sm font-medium text-highlighted'
})

const descriptionClass = 'text-xs text-muted mt-1 max-w-sm mx-auto'
</script>

<template>
  <div :class="containerClass">
    <div
      v-if="variant === 'positive'"
      class="flex items-center gap-2"
    >
      <UIcon :name="icon" :class="iconClass" />
      <p :class="titleClass">
        {{ title }}
      </p>
    </div>

    <template v-else>
      <UIcon :name="icon" :class="iconClass" />
      <p :class="titleClass">
        {{ title }}
      </p>
      <p v-if="description" :class="descriptionClass">
        {{ description }}
      </p>
      <UButton
        v-if="actionLabel && actionTo"
        :label="actionLabel"
        :icon="actionIcon"
        :variant="actionVariant"
        :size="actionSize"
        :to="actionTo"
        class="mt-3"
      />
      <UButton
        v-else-if="actionLabel"
        :label="actionLabel"
        :icon="actionIcon"
        :variant="actionVariant"
        :size="actionSize"
        :loading="actionLoading"
        :disabled="actionLoading"
        class="mt-3"
        @click="emit('action')"
      />
      <slot name="action" />
    </template>
  </div>
</template>
