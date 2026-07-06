<script setup lang="ts">
import type { Container } from '~/types'

definePageMeta({
  layout: 'default',
  roles: ['Administrator', 'RegistryOfficer']
})

const route = useRoute()
const containerId = computed(() => Number(route.params.id))

const { data: containerRes, pending } = useApi<Container>(() =>
  `/api/containers/${containerId.value}`
)

const container = computed(() => containerRes.value?.data)
</script>

<template>
  <ContainersRegistrationPage
    mode="edit"
    :container-id="containerId"
    :container="container"
    :loading="pending"
  />
</template>
