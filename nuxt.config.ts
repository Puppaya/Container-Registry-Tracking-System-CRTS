// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@vueuse/nuxt',
    '@pinia/nuxt',
    'nuxt-auth-utils',
    '@nuxtjs/i18n'
  ],

  i18n: {
    locales: [
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
      { code: 'lo', language: 'lo-LA', name: 'ລາວ', file: 'lo.json' }
    ],
    defaultLocale: 'lo',
    langDir: 'locales',
    strategy: 'no_prefix',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'crts_locale',
      fallbackLocale: 'lo'
    }
  },

  devtools: {
    enabled: process.env.NODE_ENV === 'development'
  },

  devServer: {
    host: '0.0.0.0',
    port: 3000
  },

  css: ['~/assets/css/main.css'],

  routeRules: {
    '/**': {
      headers: {
        'Content-Security-Policy': "default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval'; img-src 'self' https: data: blob:; font-src 'self' https: data:;",
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
      }
    },
    '/api/**': {
      headers: {
        'Cache-Control': 'no-store, max-age=0'
      }
    }
  },

  runtimeConfig: {
    // Server-only private keys
    SECRET_KEY: process.env.SECRET_KEY || 'default-secret-key-change-this',
    surveyApiUrl: process.env.SURVEY_API_URL || '',
    surveyApiKey: process.env.SURVEY_API_KEY || '',
    surveyApiTlsInsecure: process.env.SURVEY_API_TLS_INSECURE === 'true',
    surveySyncEnabled: process.env.SURVEY_SYNC_ENABLED !== 'false',
    s3Endpoint: process.env.S3_ENDPOINT || '',
    s3AccessKey: process.env.S3_ACCESS_KEY || '',
    s3SecretKey: process.env.S3_SECRET_KEY || '',
    s3Bucket: process.env.S3_BUCKET || 'crts-documents',
    s3Region: process.env.S3_REGION || 'us-east-1',
    s3PublicUrl: process.env.S3_PUBLIC_URL || process.env.MINIO_RETURN_PATH || '',
    storageLocalPath: process.env.STORAGE_LOCAL_PATH || '',
    session: {
      password: process.env.NUXT_SESSION_PASSWORD || '',
      cookie: {
        secure: process.env.NUXT_SESSION_COOKIE_SECURE === 'true',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 1 week
      }
    },
    public: {
      secretKey: process.env.SECRET_KEY || 'default-secret-key-change-this'
    }
  },

  sourcemap: {
    server: false,
    client: process.env.NODE_ENV === 'development'
  },

  compatibilityDate: '2024-07-11',

  nitro: {
    output: {
      dir: process.env.NITRO_OUTPUT_DIR || '.output'
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
