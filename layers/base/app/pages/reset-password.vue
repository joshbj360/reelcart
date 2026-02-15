<!-- layers/auth/pages/reset-password.vue -->
<template>
  <AuthLayout 
    title="Reset your password" 
    subtitle="Create a new password for your account"
  >
    <!-- Token Invalid Message -->
    <div v-if="tokenInvalid" class="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 mb-6">
      <div class="flex gap-3">
        <Icon name="mdi:alert-circle" class="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
        <div>
          <h3 class="font-semibold text-red-900 dark:text-red-300 text-sm">Invalid reset link</h3>
          <p class="text-red-800 dark:text-red-400 text-xs mt-1">
            This reset link has expired or is invalid. Please request a new one.
          </p>
          <NuxtLink
            to="/forgot-password"
            class="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium text-xs mt-2 inline-block"
          >
            Request new link →
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Error Message -->
    <div v-else-if="error" class="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 mb-6">
      <p class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
    </div>

    <!-- Reset Password Form -->
    <form v-else class="space-y-4" @submit.prevent="handleSubmit">
      <!-- New Password Input -->
      <div>
        <div class="relative">
          <input
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="New password (min 12 characters)"
            :disabled="isLoading || success"
            :class="[
              'w-full px-4 py-3 pr-12 rounded-xl border bg-transparent placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm',
              errors.password 
                ? 'border-red-300 dark:border-red-700' 
                : 'border-gray-200 dark:border-neutral-700 text-gray-900 dark:text-white'
            ]"
          />
          <button
            type="button"
            :disabled="isLoading || success"
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
            placeholder="Confirm new password"
            :disabled="isLoading || success"
            :class="[
              'w-full px-4 py-3 pr-12 rounded-xl border bg-transparent placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm',
              errors.confirmPassword 
                ? 'border-red-300 dark:border-red-700' 
                : 'border-gray-200 dark:border-neutral-700 text-gray-900 dark:text-white'
            ]"
          />
          <button
            type="button"
            :disabled="isLoading || success"
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

      <!-- Success Message -->
      <div v-if="success" class="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
        <div class="flex gap-3">
          <Icon name="mdi:check-circle" class="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 class="font-semibold text-green-900 dark:text-green-300 text-sm">Password reset successfully!</h3>
            <p class="text-green-800 dark:text-green-400 text-xs mt-1">
              Your password has been updated. Redirecting to login...
            </p>
          </div>
        </div>
      </div>

      <!-- Submit Button -->
      <button
        v-if="!success"
        type="submit"
        :disabled="isLoading"
        class="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 text-white font-semibold shadow-md hover:shadow-lg hover:from-purple-700 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        <span v-if="isLoading" class="flex items-center justify-center gap-2">
          <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Resetting password...
        </span>
        <span v-else>Reset Password</span>
      </button>
    </form>

    <!-- Footer Slot -->
    <template #footer>
      <p v-if="!success" class="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
        Remember your password?
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
import { reactive, ref, onMounted, computed } from 'vue'
import { useRoute } from 'nuxt/app'
import { useAuth } from '../composables/useAuth'
import AuthLayout from '../layouts/AuthLayout.vue'
import PasswordStrengthMeter from '../components/PasswordStrengthMeter.vue'

definePageMeta({
  layout: false,
   middleware: 'guest'
})

const route = useRoute()
const router = useRouter()
const { resetPassword: authResetPassword, isLoading: authLoading, error: authError } = useAuth()

const success = ref(false)
const tokenInvalid = ref(false)

const showPassword = ref(false)
const showConfirmPassword = ref(false)

const form = reactive({
  password: '',
  confirmPassword: '',
})

const errors = reactive({
  password: '',
  confirmPassword: '',
})

const isLoading = computed(() => authLoading.value)
const error = computed(() => authError.value)

// Client-side validation
const validateForm = () => {
  errors.password = ''
  errors.confirmPassword = ''

  // Password validation
  if (!form.password) {
    errors.password = 'Password is required'
    return false
  }

  if (form.password.length < 12) {
    errors.password = 'Password must be at least 12 characters'
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

  return true
}

const handleSubmit = async () => {
  if (!validateForm()) return

  const token = route.query.token as string

  try {
    await authResetPassword(token, form.password, form.confirmPassword)
    success.value = true
    // authResetPassword handles navigation on success
  } catch (err: any) {
    console.error('Reset password error:', err)
    // Error is already in authError
  }
}

onMounted(() => {
  // Check if token exists
  const token = route.query.token as string
  if (!token) {
    tokenInvalid.value = true
  }
})
</script>