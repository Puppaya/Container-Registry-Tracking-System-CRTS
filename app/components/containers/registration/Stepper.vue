<script setup lang="ts">
import { REGISTRATION_STEPS } from '~/utils/container-registration'

const props = defineProps<{
  activeStep: string
}>()

const emit = defineEmits<{
  'update:activeStep': [value: string]
  navigate: [sectionId: string]
}>()

const stepItems = REGISTRATION_STEPS.map(step => ({
  ...step,
  slot: step.value
}))

function scrollToSection(sectionId: string) {
  emit('update:activeStep', sectionId)
  emit('navigate', sectionId)
}
</script>

<template>
  <div class="space-y-6">
    <nav aria-label="Registration steps" class="space-y-1">
      <button
        v-for="(step, index) in stepItems"
        :key="step.value"
        type="button"
        class="flex w-full items-start gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-elevated/60"
        :class="activeStep === step.value ? 'bg-primary/5' : ''"
        @click="scrollToSection(step.value)"
      >
        <div class="flex flex-col items-center">
          <span
            class="flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold font-mono transition-colors"
            :class="activeStep === step.value
              ? 'bg-primary text-white shadow-sm'
              : 'bg-elevated text-muted border border-default'"
          >
            {{ index + 1 }}
          </span>
          <span
            v-if="index < stepItems.length - 1"
            class="my-1 h-8 w-px bg-default"
          />
        </div>

        <div class="min-w-0 pt-1">
          <p
            class="text-sm font-semibold font-mono tracking-tight"
            :class="activeStep === step.value ? 'text-primary' : 'text-default'"
          >
            {{ step.title }}
          </p>
        </div>
      </button>
    </nav>

    <UAlert
      color="info"
      variant="subtle"
      icon="i-lucide-info"
      title="Need Help?"
      description="The check digit is the 7th digit of the container number, calculated per ISO 6346 using the first 10 characters."
      :ui="{ root: 'text-xs' }"
    />
  </div>
</template>
