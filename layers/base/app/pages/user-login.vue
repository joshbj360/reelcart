<!-- layers/auth/app/pages/user-login.vue -->
<template>
  <AuthLayout 
    title="Welcome back" 
    subtitle="Sign in to continue your journey"
  >
    <!-- Error Message -->
    <div v-if="error" class="mb-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
      <p class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
    </div>

    <!-- Success Message -->
    <div v-if="message" class="mb-4 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
      <p class="text-sm text-green-600 dark:text-green-400">{{ message }}</p>
    </div>

    <!-- Login Form -->
    <form class="space-y-4" @submit.prevent="handleSubmit">
      <!-- Email Input -->
      <div>
        <input
          v-model="form.email"
          type="email"
          placeholder="Email address"
          :disabled="isLoading"
          :class="[
            'w-full px-4 py-3 rounded-xl border bg-transparent placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm',
            errors.email 
              ? 'border-red-300 dark:border-red-700' 
              : 'border-gray-200 dark:border-neutral-700 text-gray-900 dark:text-white'
          ]"
        />
        <p v-if="errors.email" class="mt-1.5 text-sm text-red-600 dark:text-red-400">
          {{ errors.email }}
        </p>
      </div>

      <!-- Password Input -->
      <div>
        <div class="relative">
          <input
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Password"
            :disabled="isLoading"
            :class="[
              'w-full px-4 py-3 pr-12 rounded-xl border bg-transparent placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm',
              errors.password 
                ? 'border-red-300 dark:border-red-700' 
                : 'border-gray-200 dark:border-neutral-700 text-gray-900 dark:text-white'
            ]"
          />
          <button
            type="button"
            :disabled="isLoading"
            class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
            @click="showPassword = !showPassword"
          >
            <Icon :name="showPassword ? 'mdi:eye-off' : 'mdi:eye'" class="w-5 h-5" />
          </button>
        </div>
        <p v-if="errors.password" class="mt-1.5 text-sm text-red-600 dark:text-red-400">
          {{ errors.password }}
        </p>
      </div>

      <!-- Forgot Password Link -->
      <div class="flex justify-end">
        <NuxtLink
          to="/forgot-password"
          class="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 transition-colors font-medium"
        >
          Forgot password?
        </NuxtLink>
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        :disabled="isLoading"
        class="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 text-white font-semibold shadow-md hover:shadow-lg hover:from-purple-700 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        <span v-if="isLoading" class="flex items-center justify-center gap-2">
          <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Signing in...
        </span>
        <span v-else>Sign In</span>
      </button>
    </form>

    <!-- Divider -->
    <div class="flex items-center my-6">
      <div class="flex-grow border-t border-gray-200 dark:border-neutral-700" />
      <span class="px-4 text-sm text-gray-400">or</span>
      <div class="flex-grow border-t border-gray-200 dark:border-neutral-700" />
    </div>

    <!-- Social Login (Placeholder) -->
    <div class="grid grid-cols-2 gap-3">
      <button
        type="button"
        :disabled="isLoading"
        class="flex items-center justify-center gap-2 py-2.5 border border-gray-200 dark:border-neutral-700 rounded-xl hover:bg-gray-50 dark:hover:bg-neutral-800 transition-all disabled:opacity-50 text-sm"
        @click="showComingSoon('Google')"
      >
        <Icon name="mdi:google" class="w-4 h-4 text-gray-600 dark:text-gray-300" />
        <span class="font-medium text-gray-700 dark:text-gray-300">Google</span>
      </button>

      <button
        type="button"
        :disabled="isLoading"
        class="flex items-center justify-center gap-2 py-2.5 border border-gray-200 dark:border-neutral-700 rounded-xl hover:bg-gray-50 dark:hover:bg-neutral-800 transition-all disabled:opacity-50 text-sm"
        @click="showComingSoon('Facebook')"
      >
        <Icon name="mdi:facebook" class="w-4 h-4 text-[#1877F2]" />
        <span class="font-medium text-gray-700 dark:text-gray-300">Facebook</span>
      </button>
    </div>

    <!-- Footer Slot -->
    <template #footer>
      <p class="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
        Don't have an account?
        <NuxtLink
          to="/user-register"
          class="text-purple-600 dark:text-purple-400 font-semibold hover:text-purple-700 dark:hover:text-purple-300 transition-colors ml-1"
        >
          Sign Up
        </NuxtLink>
      </p>
    </template>
  </AuthLayout>
</template>

<script setup lang="ts">
import { useAuth } from '../composables/useAuth'
import { reactive, ref, computed } from 'vue'
import AuthLayout from '../layouts/AuthLayout.vue'

definePageMeta({
  layout: false,
  middleware: 'guest'
})

const router = useRouter()
const { login: authLogin, isLoading: authLoading, error: authError } = useAuth()

const showPassword = ref(false)

const form = reactive({
  email: '',
  password: '',
})

const errors = reactive({
  email: '',
  password: '',
})

const isLoading = computed(() => authLoading.value)
const error = computed(() => authError.value)
const message = ref('')

// Simple client-side validation
const validateForm = () => {
  errors.email = ''
  errors.password = ''

  if (!form.email) {
    errors.email = 'Email is required'
    return false
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Please enter a valid email'
    return false
  }

  if (!form.password) {
    errors.password = 'Password is required'
    return false
  }

  if (form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters'
    return false
  }

  return true
}

const handleSubmit = async () => {
  if (!validateForm()) return

  try {
    await authLogin(form.email, form.password)
    // authLogin handles navigation on success
  } catch (err: any) {
    console.error('Login error:', err)
    // Error is already in authError
  }
}

const showComingSoon = (provider: string) => {
  message.value = `${provider} login coming soon!`
  setTimeout(() => {
    message.value = ''
  }, 3000)
}

// Clear errors on input
const clearEmailError = () => { errors.email = '' }
const clearPasswordError = () => { errors.password = '' }
</script>