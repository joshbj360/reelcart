<!-- layers/auth/pages/user-register.vue -->
<template>
  <AuthLayout 
    title="Create your account" 
    subtitle="Join ReelCart today"
  >
    <!-- Error Message -->
    <div v-if="error" class="mb-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
      <p class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
    </div>

    <!-- Success Message -->
    <div v-if="message" class="mb-4 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
      <p class="text-sm text-green-600 dark:text-green-400">{{ message }}</p>
    </div>

    <!-- Register Form -->
    <form class="space-y-4" @submit.prevent="handleSubmit">
      <!-- Username Input -->
      <div>
        <input
          v-model="form.username"
          type="text"
          placeholder="Username"
          :disabled="isLoading"
          :class="[
            'w-full px-4 py-3 rounded-xl border bg-transparent placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm',
            errors.username 
              ? 'border-red-300 dark:border-red-700' 
              : 'border-gray-200 dark:border-neutral-700 text-gray-900 dark:text-white'
          ]"
        />
        <p v-if="errors.username" class="mt-1.5 text-sm text-red-600 dark:text-red-400">
          {{ errors.username }}
        </p>
      </div>

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
            placeholder="Password (min 8 characters)"
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

      <!-- Confirm Password Input -->
      <div>
        <div class="relative">
          <input
            v-model="form.confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            placeholder="Confirm password"
            :disabled="isLoading"
            :class="[
              'w-full px-4 py-3 pr-12 rounded-xl border bg-transparent placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm',
              errors.confirmPassword 
                ? 'border-red-300 dark:border-red-700' 
                : 'border-gray-200 dark:border-neutral-700 text-gray-900 dark:text-white'
            ]"
          />
          <button
            type="button"
            :disabled="isLoading"
            class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
            @click="showConfirmPassword = !showConfirmPassword"
          >
            <Icon :name="showConfirmPassword ? 'mdi:eye-off' : 'mdi:eye'" class="w-5 h-5" />
          </button>
        </div>
        <p v-if="errors.confirmPassword" class="mt-1.5 text-sm text-red-600 dark:text-red-400">
          {{ errors.confirmPassword }}
        </p>
      </div>

      <!-- Password Strength Meter -->
      <PasswordStrengthMeter v-if="form.password" :password="form.password" />

      <!-- Terms & Conditions -->
      <div class="flex items-start gap-3 pt-2">
        <input
          v-model="agreedToTerms"
          type="checkbox"
          id="terms"
          class="mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
        />
        <label for="terms" class="text-xs text-gray-600 dark:text-gray-400">
          I agree to the
          <a href="#" class="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 transition-colors font-medium">
            Terms of Service
          </a>
          and
          <a href="#" class="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 transition-colors font-medium">
            Privacy Policy
          </a>
        </label>
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        :disabled="isLoading || !agreedToTerms"
        class="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 text-white font-semibold shadow-md hover:shadow-lg hover:from-purple-700 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        <span v-if="isLoading" class="flex items-center justify-center gap-2">
          <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Creating account...
        </span>
        <span v-else>Create Account</span>
      </button>
    </form>

    <!-- Divider -->
    <div class="flex items-center my-6">
      <div class="flex-grow border-t border-gray-200 dark:border-neutral-700" />
      <span class="px-4 text-sm text-gray-400">or</span>
      <div class="flex-grow border-t border-gray-200 dark:border-neutral-700" />
    </div>

    <!-- Social Register (Placeholder) -->
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
        Already have an account?
        <NuxtLink
          to="/user-login"
          class="text-purple-600 dark:text-purple-400 font-semibold hover:text-purple-700 dark:hover:text-purple-300 transition-colors ml-1"
        >
          Sign In
        </NuxtLink>
      </p>
    </template>
  </AuthLayout>
</template>

<script setup lang="ts">
import { useAuth } from '../composables/useAuth'
import { reactive, ref, computed } from 'vue'
import AuthLayout from '../layouts/AuthLayout.vue'
import PasswordStrengthMeter from '../components/PasswordStrengthMeter.vue'

definePageMeta({
  layout: false,
 middleware: 'guest' // Redirect to dashboard if already logged in
})

const router = useRouter()
const { register: authRegister, isLoading: authLoading, error: authError, message: authMessage } = useAuth()

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const agreedToTerms = ref(false)

const form = reactive({
  email: '',
  username: '',
  password: '',
  confirmPassword: '',
})

const errors = reactive({
  email: '',
  username: '',
  password: '',
  confirmPassword: '',
})

const isLoading = computed(() => authLoading.value)
const error = computed(() => authError.value)
const message = computed(() => authMessage.value)

// Client-side validation
const validateForm = () => {
  errors.email = ''
  errors.username = ''
  errors.password = ''
  errors.confirmPassword = ''

  // Email validation
  if (!form.email) {
    errors.email = 'Email is required'
    return false
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Please enter a valid email'
    return false
  }

  // Username validation
  if (!form.username) {
    errors.username = 'Username is required'
    return false
  }

  if (form.username.length < 3) {
    errors.username = 'Username must be at least 3 characters'
    return false
  }

  if (form.username.length > 20) {
    errors.username = 'Username must be at most 20 characters'
    return false
  }

  // Password validation
  if (!form.password) {
    errors.password = 'Password is required'
    return false
  }

  if (form.password.length < 8) {
    errors.password = 'Password must be at least 8 characters'
    return false
  }

  // Confirm password validation
  if (!form.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password'
    return false
  }

  if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
    return false
  }

  // Terms validation
  if (!agreedToTerms.value) {
    // Don't show error, just prevent submit (button is disabled)
    return false
  }

  return true
}

const handleSubmit = async () => {
  if (!validateForm()) return

  try {
    await authRegister(
      form.email,
      form.username,
      form.password,
      form.confirmPassword
    )
    // authRegister handles navigation on success
  } catch (err: any) {
    console.error('Register error:', err)
    // Error is already in authError
  }
}

const showComingSoon = (provider: string) => {
  // Would show a toast notification
  console.log(`${provider} registration coming soon!`)
}
</script>