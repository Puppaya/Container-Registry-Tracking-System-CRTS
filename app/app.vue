<script setup lang="ts">
import { en_gb } from '@nuxt/ui/locale'

const colorMode = useColorMode()
const { t, locale } = useI18n()

const color = computed(() => colorMode.value === 'dark' ? '#1a1c24' : '#faf8ff')

const siteUrl = useRequestURL().origin

useHead({
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { key: 'theme-color', name: 'theme-color', content: color }
  ],
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
    { rel: 'icon', type: 'image/png', sizes: '192x192', href: '/favicon-192.png' },
    { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&family=Noto+Sans+Lao:wght@400;500;600;700&display=swap' }
  ],
  htmlAttrs: {
    lang: locale
  }
})

useSeoMeta({
  title: t('app.name'),
  description: t('app.description'),
  ogTitle: t('app.name'),
  ogDescription: t('app.description'),
  ogType: 'website',
  ogImage: `${siteUrl}/og-image.png`,
  ogImageWidth: 1536,
  ogImageHeight: 1024,
  ogImageAlt: t('app.name'),
  twitterCard: 'summary_large_image',
  twitterTitle: t('app.name'),
  twitterDescription: t('app.description'),
  twitterImage: `${siteUrl}/og-image.png`
})
</script>

<template>
  <UApp :locale="en_gb">
    <NuxtLoadingIndicator color="var(--ui-primary)" />
    <ClientOnly>
      <AppLoading />
    </ClientOnly>

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <UToaster />
    <UOverlayProvider />
  </UApp>
</template>
