<script setup lang="ts">
const model = defineModel<string>({ required: true })

const props = defineProps<{
  options: Array<{ label: string, value: string }>
  placeholder?: string
  disabled?: boolean
}>()
</script>

<template>
  <div class="public-select">
    <select
      v-model="model"
      class="public-control public-control--select"
      :disabled="props.disabled"
    >      <option v-if="placeholder" disabled value="">{{ placeholder }}</option>
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>
    <UIcon name="i-lucide-chevron-down" class="public-select__icon" aria-hidden="true" />
  </div>
</template>
