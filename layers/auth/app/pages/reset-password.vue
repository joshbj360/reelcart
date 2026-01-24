<!-- layers/auth/pages/reset-password.vue -->
<template>
  <AuthLayout 
    title="Reset your password" 
    subtitle="Create a new password for your account"
  >
    <!-- Token Invalid Message -->
    <div v-if="tokenInvalid" class="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 mb-6">
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

    <!-- Reset Password Form -->
    <form v-else class="space-y-4" @submit.prevent="handleSubmit">
      <!-- New Password Input -->
      <div>
        <div class="relative">
          <input
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="New password"
            :disabled="loading || success"
            :class="[
              'w-full px-4 py-3 pr-12 rounded-xl border bg-transparent placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm',
              errors.password 
                ? 'border-red-300 dark:border-red-700' 
                : 'border-gray-200 dark:border-neutral-700 text-gray-900 dark:text-white'
            ]"
          />
          <button
            type="button"
            class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
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
            :disabled="loading || success"
            :class="[
              'w-full px-4 py-3 pr-12 rounded-xl border bg-transparent placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm',
              errors.confirmPassword 
                ? 'border-red-300 dark:border-red-700' 
                : 'border-gray-200 dark:border-neutral-700 text-gray-900 dark:text-white'
            ]"
          />
          <button
            type="button"
            class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
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
      <PasswordStrengthMeter :password="form.password" />

      <!-- Success Message -->
      <div v-if="success" class="p-4 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
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
        :disabled="loading"
        class="w-full py-3 rounded-xl bg-gradient-to-r from-text-brand-dark to-text-brand text-white font-semibold shadow-md hover:shadow-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        <span v-if="loading" class="flex items-center justify-center gap-2">
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
          class="text-brand dark:text-brand-light font-semibold hover:text-brand-dark dark:hover:text-brand transition-colors ml-1"
        >
          Sign In
        </NuxtLink>
      </p>
    </template>
  </AuthLayout>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useRoute, navigateTo } from 'nuxt/app'
import { useAuthApi } from '../services/auth.api'
import { z } from 'zod'
import AuthLayout from '../layouts/AuthLayout.vue'


definePageMeta({
  layout: false,
})

const route = useRoute()
const authApi = useAuthApi()

const loading = ref(false)
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

const passwordSchema = z.object({
  password: z
    .string()
    .min(12, 'Password must be at least 12 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
})

const validateForm = () => {
  errors.password = ''
  errors.confirmPassword = ''

  if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
    return false
  }

  const result = passwordSchema.safeParse(form)

  if (!result.success) {
    result.error.issues.forEach((issue) => {
      const path = issue.path[0] as keyof typeof errors
      if (path in errors) {
        errors[path] = issue.message
      }
    })
    return false
  }
  return true
}

const handleSubmit = async () => {
  if (!validateForm()) return

  loading.value = true

  try {
    const token = route.query.token as string
    
    const response = await authApi.completePasswordReset(token, form.password)

    if (response) {
      success.value = true
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigateTo('/user-login')
      }, 2000)
    }
  } catch (error: any) {
    errors.password = error.message || 'Failed to reset password. Please try again.'
  } finally {
    loading.value = false
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