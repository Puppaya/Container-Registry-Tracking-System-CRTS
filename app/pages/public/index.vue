<script setup lang="ts">
definePageMeta({ layout: 'public' })

const { t } = useI18n()
</script>

<template>
  <div class="public-page space-y-6 sm:space-y-8">
    <div class="space-y-2 px-1 text-center sm:px-0">
      <h1 class="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
        {{ t('public.portalSubtitle') }}
      </h1>
    </div>

    <div class="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
      <UCard class="w-full shadow-lg border-slate-200/60 dark:border-slate-800/60 h-full">
        <div class="flex h-full flex-col gap-4 sm:gap-5">
          <div class="flex items-start gap-3">
            <div class="flex size-10 sm:size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <UIcon name="i-lucide-clipboard-plus" class="size-5" />
            </div>
            <div class="min-w-0">
              <h2 class="font-semibold text-base sm:text-lg">{{ t('public.registerTitle') }}</h2>
              <p class="mt-1 text-sm text-muted">{{ t('public.registerDesc') }}</p>
            </div>
          </div>
          <UButton
            :label="t('public.registerAction')"
            icon="i-lucide-arrow-right"
            block
            size="lg"
            class="mt-auto min-h-11"
            to="/public/register"
          />
        </div>
      </UCard>

      <UCard class="w-full shadow-lg border-slate-200/60 dark:border-slate-800/60 h-full">
        <div class="flex h-full flex-col gap-4 sm:gap-5">
          <div class="flex items-start gap-3">
            <div class="flex size-10 sm:size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <UIcon name="i-lucide-search" class="size-5" />
            </div>
            <div class="min-w-0">
              <h2 class="font-semibold text-base sm:text-lg">{{ t('public.trackTitle') }}</h2>
              <p class="mt-1 text-sm text-muted">{{ t('public.trackDesc') }}</p>
            </div>
          </div>
          <UButton
            :label="t('public.trackAction')"
            icon="i-lucide-arrow-right"
            color="neutral"
            variant="outline"
            block
            size="lg"
            class="mt-auto min-h-11"
            to="/public/track"
          />
        </div>
      </UCard>
    </div>
  </div>
</template>
