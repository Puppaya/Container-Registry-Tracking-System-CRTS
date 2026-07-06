<script setup lang="ts">
import type { ContainerStatus } from '~/types'

defineProps<{
  status: ContainerStatus
}>()
</script>

<template>
  <UBadge
    :color="status === 'Active' ? 'success' : 'neutral'"
    variant="subtle"
    size="sm"
  >
    {{ status === 'Active' ? 'Active' : 'Inactive' }}
  </UBadge>
</template>
