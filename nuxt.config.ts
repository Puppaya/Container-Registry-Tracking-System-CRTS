// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@vueuse/nuxt',
    'nuxt-auth-utils'
  ],

  devtools: {
    enabled: true
  },

  devServer: {
    host: '0.0.0.0',
    port: 3000
  },

  css: ['~/assets/css/main.css'],

  routeRules: {
    '/api/**': {
      // Disabled explicit cors to avoid credential issues on same-origin IP access
      // cors: true 
    }
  },

  runtimeConfig: {
    session: {
      password: process.env.NUXT_SESSION_PASSWORD || '',
      cookie: {
        secure: false, // Ensure cookies work on HTTP IP access
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 1 week
      }
    }
  },

  compatibilityDate: '2024-07-11',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
