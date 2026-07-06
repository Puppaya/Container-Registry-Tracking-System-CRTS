<script setup lang="ts">
definePageMeta({
  layout: 'default',
  roles: ['Administrator']
})

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const userId = route.params.id

const { data: user, pending, error } = useFetch(`/api/users/${userId}`)

const breadcrumbItems = computed(() => [
  { label: t('users.title'), to: '/users' },
  { label: user.value?.data?.name || t('users.editUser', { name: '' }) }
])

function onSuccess() {
  router.push('/users')
}

function onCancel() {
  router.back()
}
</script>

<template>
  <UDashboardPanel id="user-edit" grow>
    <template #header>
      <UDashboardNavbar :title="t('users.editUser', { name: user?.data?.name || '' })">
        <template #leading>
          <div class="flex items-center gap-2">
            <UDashboardSidebarCollapse />
            <UButton
              icon="i-lucide-arrow-left"
              color="neutral"
              variant="ghost"
              to="/users"
            />
          </div>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex min-h-full flex-col">
        <div class="flex-1 overflow-y-auto">
          <div class="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
            <div class="mb-6 space-y-3">
              <UBreadcrumb :items="breadcrumbItems" />
              
              <div>
                <h1 class="text-2xl font-bold tracking-tight font-display">
                  {{ t('users.editTitle') }}
                </h1>
                <p class="mt-1 text-sm text-muted">
                  {{ t('users.editDesc') }}
                </p>
              </div>
            </div>

            <UCard>
              <div v-if="pending" class="flex justify-center p-8">
                <UIcon name="i-lucide-loader-2" class="size-8 animate-spin text-primary" />
              </div>
              <div v-else-if="error" class="p-8 text-center text-error">
                <UIcon name="i-lucide-alert-circle" class="size-12 mx-auto mb-2 opacity-50" />
                <p>{{ t('users.notFound') }}</p>
              </div>
              <UsersUserForm 
                v-else-if="user?.data" 
                :user="user.data" 
                @success="onSuccess" 
                @cancel="onCancel" 
              />
            </UCard>
          </div>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
