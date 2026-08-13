<template>
  <div class="public-portal relative min-h-dvh overflow-x-hidden bg-[var(--ui-bg)]">
    <div class="pointer-events-none absolute inset-0" aria-hidden="true">
      <div
        class="absolute inset-0 opacity-[0.35]"
        style="background-image: linear-gradient(to right, rgb(148 163 184 / 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgb(148 163 184 / 0.08) 1px, transparent 1px); background-size: 48px 48px;"
      />
      <div class="absolute -top-24 -left-24 size-64 sm:size-[480px] rounded-full blur-3xl bg-indigo-500/10 dark:bg-indigo-500/15" />
      <div class="absolute -bottom-32 -right-24 size-56 sm:size-[400px] rounded-full blur-3xl bg-violet-500/8 dark:bg-violet-500/12" />
    </div>

    <div class="relative z-10 flex min-h-dvh w-full flex-col">
      <header class="sticky top-0 z-20 w-full border-b border-slate-200/60 bg-white/90 backdrop-blur-md dark:border-slate-800/60 dark:bg-slate-900/90">
        <div class="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:py-4">
          <NuxtLink to="/public" class="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <img src="/favicon.svg" alt="CRTS" class="size-9 sm:size-10 shrink-0 rounded-xl shadow-md shadow-primary/20">
            <div class="min-w-0">
              <p class="truncate text-sm font-bold tracking-tight text-slate-900 dark:text-white">{{ $t('app.name') }}</p>
              <p class="truncate text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">{{ $t('public.portalTitle') }}</p>
            </div>
          </NuxtLink>

          <div class="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <LocaleSwitcher />
            <UButton
              :label="$t('public.staffLogin')"
              icon="i-lucide-log-in"
              color="neutral"
              variant="outline"
              size="sm"
              class="hidden sm:inline-flex"
              to="/login"
            />
            <UButton
              icon="i-lucide-log-in"
              color="neutral"
              variant="outline"
              size="sm"
              class="sm:hidden"
              :aria-label="$t('public.staffLogin')"
              to="/login"
            />
          </div>
        </div>
      </header>

      <main class="public-portal__main mx-auto w-full max-w-5xl flex-1 px-4 py-4 sm:px-6 sm:py-8">
        <slot />
      </main>

      <footer class="w-full border-t border-slate-200/60 px-4 py-4 sm:py-6 text-center text-[11px] sm:text-xs text-slate-400 dark:border-slate-800/60 dark:text-slate-500">
        &copy; {{ new Date().getFullYear() }} {{ $t('app.name') }}. {{ $t('app.copyright') }}
      </footer>
    </div>
  </div>
</template>

<style scoped>
.public-portal__main {
  display: block;
  width: 100%;
  box-sizing: border-box;
}

.public-portal__main :deep(> *) {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}
</style>
