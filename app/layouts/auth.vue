<template>
  <div class="relative min-h-screen overflow-hidden bg-[var(--ui-bg)]">
    <div class="pointer-events-none absolute inset-0" aria-hidden="true">
      <div
        class="absolute inset-0 opacity-[0.35]"
        style="background-image: linear-gradient(to right, rgb(148 163 184 / 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgb(148 163 184 / 0.08) 1px, transparent 1px); background-size: 48px 48px;"
      />
      <div class="absolute -top-24 -left-24 size-[480px] rounded-full blur-3xl bg-indigo-500/10 dark:bg-indigo-500/15" />
      <div class="absolute -bottom-32 -right-24 size-[400px] rounded-full blur-3xl bg-violet-500/8 dark:bg-violet-500/12" />
    </div>

    <div class="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div class="absolute top-4 right-4">
        <LocaleSwitcher />
      </div>

      <div class="mb-8 flex flex-col items-center gap-3 text-center">
        <img
          src="/favicon.svg"
          alt="CRTS"
          class="size-14 rounded-2xl shadow-lg shadow-primary/25"
        >
        <div>
          <p class="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            {{ $t('app.name') }}
          </p>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            {{ $t('app.subtitle') }}
          </p>
        </div>
      </div>

      <slot />

      <p class="mt-10 text-center text-xs text-slate-400 dark:text-slate-500">
        &copy; {{ new Date().getFullYear() }} {{ $t('app.name') }}. {{ $t('app.copyright') }}
      </p>
    </div>
  </div>
</template>
