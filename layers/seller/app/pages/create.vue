// FILE PATH: layers/seller/pages/create.vue

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-neutral-900">
    <!-- Header -->
    <div class="bg-white dark:bg-neutral-800 border-b border-gray-200 dark:border-neutral-700">
      <div class="max-w-2xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Create Your Store</h1>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">Set up your seller profile and start selling</p>
      </div>
    </div>

    <!-- Form -->
    <div class="max-w-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div class="bg-white dark:bg-neutral-800 rounded-xl border border-gray-200 dark:border-neutral-700 p-6">
        
        <!-- Error -->
        <div v-if="error" class="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
        </div>

        <form class="space-y-6" @submit.prevent="handleSubmit">
          <!-- Store Name -->
          <div>
            <label class="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Store Name *
            </label>
            <input
              v-model="form.store_name"
              type="text"
              placeholder="My Awesome Store"
              :disabled="isLoading"
              class="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-neutral-700 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-brand focus:border-transparent transition-all text-sm"
            />
            <p v-if="errors.store_name" class="mt-1.5 text-sm text-red-600 dark:text-red-400">
              {{ errors.store_name }}
            </p>
          </div>

          <!-- Store Slug -->
          <div>
            <label class="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Store URL / Slug *
            </label>
            <div class="relative">
              <span class="absolute left-4 top-3 text-gray-500">store.reelcart.com/</span>
              <input
                v-model="form.store_slug"
                type="text"
                placeholder="my-awesome-store"
                :disabled="isLoading"
                @change="checkSlugAvailable"
                class="w-full pl-56 pr-4 py-3 rounded-lg border border-gray-200 dark:border-neutral-700 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-brand focus:border-transparent transition-all text-sm"
              />
              <div v-if="slugChecking" class="absolute right-4 top-3">
                <div class="w-4 h-4 border-2 border-brand border-t-transparent rounded-full animate-spin" />
              </div>
              <Icon
                v-else-if="slugAvailable === true"
                name="mdi:check-circle"
                class="absolute right-4 top-3 w-5 h-5 text-green-500"
              />
              <Icon
                v-else-if="slugAvailable === false"
                name="mdi:alert-circle"
                class="absolute right-4 top-3 w-5 h-5 text-red-500"
              />
            </div>
            <p v-if="errors.store_slug" class="mt-1.5 text-sm text-red-600 dark:text-red-400">
              {{ errors.store_slug }}
            </p>
            <p v-else-if="slugAvailable === false" class="mt-1.5 text-sm text-red-600 dark:text-red-400">
              This slug is already taken
            </p>
            <p v-else-if="slugAvailable === true" class="mt-1.5 text-sm text-green-600 dark:text-green-400">
              This slug is available
            </p>
            <button
              v-if="form.store_name"
              type="button"
              @click="suggestSlug"
              :disabled="isLoading"
              class="mt-2 text-sm text-brand hover:text-brand-dark dark:text-brand-light dark:hover:text-brand font-medium"
            >
              Get suggestions
            </button>
          </div>

          <!-- Slug Suggestions -->
          <div v-if="slugSuggestions.length > 0" class="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p class="text-sm font-medium text-blue-900 dark:text-blue-100 mb-3">Suggested slugs:</p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="slug in slugSuggestions"
                :key="slug"
                type="button"
                @click="form.store_slug = slug; checkSlugAvailable()"
                class="px-3 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/60 text-sm font-medium transition-colors"
              >
                {{ slug }}
              </button>
            </div>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Store Description
            </label>
            <textarea
              v-model="form.store_description"
              placeholder="Tell customers about your store..."
              :disabled="isLoading"
              rows="4"
              class="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-neutral-700 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-brand focus:border-transparent transition-all text-sm"
            />
            <p v-if="errors.store_description" class="mt-1.5 text-sm text-red-600 dark:text-red-400">
              {{ errors.store_description }}
            </p>
          </div>

          <!-- Contact Info -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Phone Number
              </label>
              <input
                v-model="form.store_phone"
                type="tel"
                placeholder="+1234567890"
                :disabled="isLoading"
                class="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-neutral-700 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-brand focus:border-transparent transition-all text-sm"
              />
              <p v-if="errors.store_phone" class="mt-1.5 text-sm text-red-600 dark:text-red-400">
                {{ errors.store_phone }}
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Location
              </label>
              <input
                v-model="form.store_location"
                type="text"
                placeholder="City, Country"
                :disabled="isLoading"
                class="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-neutral-700 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-brand focus:border-transparent transition-all text-sm"
              />
            </div>
          </div>

          <!-- Website -->
          <div>
            <label class="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Website
            </label>
            <input
              v-model="form.store_website"
              type="url"
              placeholder="https://example.com"
              :disabled="isLoading"
              class="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-neutral-700 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-brand focus:border-transparent transition-all text-sm"
            />
            <p v-if="errors.store_website" class="mt-1.5 text-sm text-red-600 dark:text-red-400">
              {{ errors.store_website }}
            </p>
          </div>

          <!-- Submit Button -->
          <div class="flex gap-3 pt-6 border-t border-gray-200 dark:border-neutral-700">
            <button
              type="button"
              @click="$router.back()"
              :disabled="isLoading"
              class="flex-1 px-6 py-3 rounded-lg border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-all font-semibold disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isLoading || !slugAvailable"
              class="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-brand-dark to-brand text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span v-if="isLoading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>{{ isLoading ? 'Creating...' : 'Create Store' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useSellerManagement } from '../composables/useSellerManagement'

definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

const { createSeller, checkSlugAvailability, suggestSlugs, isLoading, error } = useSellerManagement()

const form = reactive({
  store_name: '',
  store_slug: '',
  store_description: '',
  store_phone: '',
  store_location: '',
  store_website: ''
})

const errors = reactive({
  store_name: '',
  store_slug: '',
  store_description: '',
  store_phone: '',
  store_website: ''
})

const slugAvailable = ref<boolean | null>(null)
const slugChecking = ref(false)
const slugSuggestions = ref<string[]>([])

const checkSlugAvailable = async () => {
  if (!form.store_slug) return

  slugChecking.value = true
  try {
    const available = await checkSlugAvailability(form.store_slug)
    slugAvailable.value = available
  } catch (error) {
    console.error('Error checking slug:', error)
  } finally {
    slugChecking.value = false
  }
}

const suggestSlug = async () => {
  if (!form.store_name) return

  try {
    const suggestions = await suggestSlugs(form.store_name)
    slugSuggestions.value = suggestions
  } catch (error) {
    console.error('Error suggesting slugs:', error)
  }
}

const handleSubmit = async () => {
  // Clear errors
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = ''
  })

  try {
    await createSeller(form)
  } catch (error) {
    console.error('Failed to create seller:', error)
  }
}
</script>