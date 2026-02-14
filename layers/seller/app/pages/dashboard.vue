// FILE PATH: layers/seller/pages/dashboard.vue

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-neutral-900">
    <!-- Header -->
    <div class="bg-white dark:bg-neutral-800 border-b border-gray-200 dark:border-neutral-700 sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">My Stores</h1>
            <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">Manage and monitor your seller profiles</p>
          </div>
          <NuxtLink
            to="/seller/create"
            class="px-4 py-2 rounded-lg bg-gradient-to-r from-brand-dark to-brand text-white font-semibold hover:shadow-lg transition-all"
          >
            Create Store
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center items-center py-12">
        <div class="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin" />
      </div>

      <!-- Error State -->
      <div v-if="error" class="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
        <p class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
      </div>

      <!-- Message -->
      <div v-if="message" class="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 mb-6">
        <p class="text-sm text-green-600 dark:text-green-400">{{ message }}</p>
      </div>

      <!-- Empty State -->
      <div v-if="!isLoading && !hasSellers" class="text-center py-12">
        <Icon name="mdi:store-outline" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">No stores yet</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-6">Create your first seller profile to start selling</p>
        <NuxtLink
          to="/seller/create"
          class="inline-block px-6 py-3 rounded-lg bg-brand text-white font-semibold hover:shadow-lg transition-all"
        >
          Create Your First Store
        </NuxtLink>
      </div>

      <!-- Sellers Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="seller in sellers"
          :key="seller.id"
          class="bg-white dark:bg-neutral-800 rounded-xl border border-gray-200 dark:border-neutral-700 overflow-hidden hover:shadow-lg transition-all"
        >
          <!-- Banner -->
          <div
            v-if="seller.store_banner"
            class="h-32 bg-gradient-to-r from-brand-dark to-brand"
            :style="{ backgroundImage: `url(${seller.store_banner})`, backgroundSize: 'cover' }"
          />
          <div v-else class="h-32 bg-gradient-to-r from-brand-dark to-brand" />

          <!-- Content -->
          <div class="p-6">
            <!-- Logo -->
            <div class="flex items-center gap-4 mb-4">
              <div v-if="seller.store_logo" class="w-12 h-12 rounded-full overflow-hidden">
                <img :src="seller.store_logo" :alt="seller.store_name" class="w-full h-full object-cover" />
              </div>
              <div v-else class="w-12 h-12 rounded-full bg-gray-200 dark:bg-neutral-700" />

              <div class="flex-1">
                <h3 class="font-semibold text-gray-900 dark:text-white">{{ seller.store_name }}</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">@{{ seller.store_slug }}</p>
              </div>
            </div>

            <!-- Status -->
            <div class="flex items-center gap-2 mb-4">
              <span
                :class="[
                  'px-3 py-1 rounded-full text-sm font-medium',
                  seller.is_active
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                ]"
              >
                {{ seller.is_active ? 'Active' : 'Inactive' }}
              </span>
              <span
                v-if="seller.is_verified"
                class="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 flex items-center gap-1"
              >
                <Icon name="mdi:check-circle" class="w-4 h-4" />
                Verified
              </span>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-3 gap-4 py-4 border-t border-b border-gray-200 dark:border-neutral-700 mb-4">
              <div class="text-center">
                <p class="text-2xl font-bold text-gray-900 dark:text-white">0</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">Products</p>
              </div>
              <div class="text-center">
                <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ seller.followers_count }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">Followers</p>
              </div>
              <div class="text-center">
                <p class="text-2xl font-bold text-gray-900 dark:text-white">0</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">Orders</p>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex gap-2">
              <NuxtLink
                :to="`/seller/${seller.id}/edit`"
                class="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-neutral-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors text-sm font-medium text-center"
              >
                Edit
              </NuxtLink>
              <button
                @click="toggleSellerStatus(seller)"
                :disabled="isLoading"
                :class="[
                  'flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  seller.is_active
                    ? 'border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                    : 'border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                ]"
              >
                {{ seller.is_active ? 'Deactivate' : 'Activate' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSellerManagement } from '../composables/useSellerManagement'


definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

const { sellers, isLoading, error, message, loadUserSellers, activateSeller, deactivateSeller, hasSellers } = useSellerManagement()

// Load sellers on mount
onMounted(async () => {
  try {
    await loadUserSellers()
  } catch (error) {
    console.error('Failed to load sellers:', error)
  }
})

const toggleSellerStatus = async (seller: any) => {
  if (seller.is_active) {
    await deactivateSeller(seller.id)
  } else {
    await activateSeller(seller.id)
  }
}
</script>