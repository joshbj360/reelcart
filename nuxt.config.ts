// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  extends: [
    './layers/auth',     // ← this makes auth server routes available
    './layers/base',
    './layers/social',
    './layers/marketplace',
    './layers/commerce',
    // ... other layers
  ],
  modules: [
    '@nuxt/icon',
    '@nuxtjs/supabase',
    '@pinia/nuxt',
    'nuxt3-notifications',
    '@nuxt/test-utils/module',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
    'pinia-plugin-persistedstate/nuxt',
  ],
  colorMode: {
    preference: 'system', // default preference: 'system' | 'light' | 'dark'
    fallback: 'light',    // fallback if no preference detected/stored
    globalName: '__NUXT_COLOR_MODE__',
    componentName: 'ColorScheme',
    classPrefix: 'theme-',
    classSuffix: '-mode',
    storageKey: 'nuxt-color-mode'
  },
   supabase: {
    redirect: false,
    redirectOptions: {
      login: '/auth/login',
      callback: '/auth/callback',
      exclude: ['/'],
    }
  },
  runtimeConfig: {
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    openaiApiKey: process.env.OPENAI_API_KEY, 
    grokApiKey: process.env.GROK_API_KEY,
    googleApiKey: process.env.GOOGLE_API_KEY,
    paystackSecretKey: process.env.PAYSTACK_SECRET_KEY, // TODO move to private
    platformCommissionRate: process.env.PLATFORM_COMMISSION_RATE,
    supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY,
    public: {
      siteName: process.env.NUXT_PUBLIC_SITE_NAME,
      baseURL: process.env.NUXT_PUBLIC_BASE_URL || 'http://localhost:3000',
      paystackPk: process.env.PAYSTACK_PUBLIC_KEY,
      CloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      cloudinaryUploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET,
      supabaseUrl: process.env.SUPABASE_URL
    },
    private: {
      
      cloudinary: {
        apiSecret: process.env.CLOUDINARY_API_SECRET
      }

    }
  }
})
