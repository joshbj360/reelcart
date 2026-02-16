<!-- layers/auth/components/AuthLayout.vue -->
<template>
  <div class="h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 px-4 py-4">
    <div class="w-full max-w-6xl flex overflow-hidden bg-white dark:bg-neutral-900 shadow-2xl rounded-3xl max-h-[90vh]">
      
      <!-- Left Section: Form -->
      <div class="flex-1 flex flex-col justify-center p-8 sm:p-12 lg:p-14 overflow-auto">
        <!-- Brand -->
        <div class="flex items-center gap-3 mb-8">
          <NuxtLink to="/" class="flex items-center gap-2">
            <img src="/assets/images/logo2.png" alt="Logo" class="w-14 h-14 object-contain" />
          </NuxtLink>
        </div>

        <!-- Title & Subtitle -->
        <div class="mb-8">
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {{ title }}
          </h1>
          <p v-if="subtitle" class="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
            {{ subtitle }}
          </p>
        </div>

        <!-- Form Content (Slot) -->
        <slot />

        <!-- Bottom Links (Slot for customization) -->
        <slot name="footer" />
      </div>

      <!-- Right Section: Visual Branding -->
      <div class="hidden lg:flex w-1/2 relative overflow-hidden">
        <!-- Background Image -->
        <div class="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80"
            alt="Fashion"
            class="w-full h-full object-cover"
          />
          <!-- Gradient Overlay -->
          <div class="absolute inset-0 bg-gradient-to-br from-text-brand-dark/90 via-text-brand-dark/85 to-text-brand/90" />
        </div>

        <!-- Content -->
        <div class="relative z-10 flex flex-col items-center justify-center p-8 text-white text-center">
          <div class="max-w-xs space-y-4">
            <!-- Main Heading -->
            <div class="space-y-3">
              <div class="inline-block">
                <div class="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
                  <Icon name="mdi:hanger" class="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 class="text-2xl font-bold leading-tight">
                Discover Your Perfect Style
              </h2>
              <p class="text-sm text-white/90 leading-relaxed">
                Shop from curated collections, connect with sellers worldwide, and express your unique fashion sense.
              </p>
            </div>

            <!-- Feature Icons -->
            <div class="flex justify-center gap-3 pt-6">
              <div class="group">
                <div class="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center transition-all group-hover:bg-white/30 group-hover:scale-110">
                  <Icon name="mdi:palette" class="w-5 h-5 text-white" />
                </div>
                <p class="text-xs mt-1 text-white/80">Curated</p>
              </div>
              <div class="group">
                <div class="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center transition-all group-hover:bg-white/30 group-hover:scale-110">
                  <Icon name="mdi:account-group" class="w-5 h-5 text-white" />
                </div>
                <p class="text-xs mt-1 text-white/80">Community</p>
              </div>
              <div class="group">
                <div class="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center transition-all group-hover:bg-white/30 group-hover:scale-110">
                  <Icon name="mdi:cart" class="w-5 h-5 text-white" />
                </div>
                <p class="text-xs mt-1 text-white/80">Seamless</p>
              </div>
            </div>
          </div>

          <!-- Bottom Stats -->
          <div class="absolute bottom-6 left-0 right-0 px-8">
            <div class="grid grid-cols-3 gap-3 text-center">
              <div class="bg-white/10 backdrop-blur-sm rounded-lg py-2 px-1">
                <div class="text-lg font-bold">500+</div>
                <div class="text-xs text-white/80">Sellers</div>
              </div>
              <div class="bg-white/10 backdrop-blur-sm rounded-lg py-2 px-1">
                <div class="text-lg font-bold">50K+</div>
                <div class="text-xs text-white/80">Products</div>
              </div>
              <div class="bg-white/10 backdrop-blur-sm rounded-lg py-2 px-1">
                <div class="text-lg font-bold">100K+</div>
                <div class="text-xs text-white/80">Users</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },
})
</script>