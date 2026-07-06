<script setup lang="ts">
definePageMeta({
  layout: 'default',
  roles: ['Administrator', 'Management']
})

await navigateTo('/analytics/reports', { replace: true })
</script>

<template>
  <div />
</template>
