<script setup lang="ts">
import type { ContainerStatus } from '~/types'

defineProps<{
  status: ContainerStatus
}>()
</script>

<template>
  <UBadge
    :color="status === 'Active' ? 'success' : status === 'Pending' ? 'warning' : 'neutral'"
    variant="subtle"
    size="sm"
  >
    {{ status === 'Active' ? 'Active' : status === 'Pending' ? 'Pending' : 'Inactive' }}
  </UBadge>
</template>
