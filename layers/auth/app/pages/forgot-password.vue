<!-- layers/auth/pages/forgot-password.vue -->
<template>
  <AuthLayout 
    title="Forgot your password?" 
    subtitle="Enter your email and we'll send you a link to reset it"
  >
    <!-- Forgot Password Form -->
    <form class="space-y-4" @submit.prevent="handleSubmit">
      <!-- Email Input -->
      <div>
        <input
          v-model="form.email"
          type="email"
          placeholder="Enter your email address"
          :disabled="loading || submitted"
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

      <!-- Success Message -->
      <div v-if="submitted" class="p-4 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
        <div class="flex gap-3">
          <Icon name="mdi:check-circle" class="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 class="font-semibold text-green-900 dark:text-green-300 text-sm">Check your email</h3>
            <p class="text-green-800 dark:text-green-400 text-xs mt-1">
              We've sent a password reset link to {{ form.email }}. Please check your inbox and spam folder.
            </p>
          </div>
        </div>
      </div>

      <!-- Submit Button -->
      <button
        v-if="!submitted"
        type="submit"
        :disabled="loading"
        class="w-full py-3 rounded-xl bg-gradient-to-r from-text-brand-dark to-text-brand text-white font-semibold shadow-md hover:shadow-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        <span v-if="loading" class="flex items-center justify-center gap-2">
          <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Sending reset link...
        </span>
        <span v-else>Send Reset Link</span>
      </button>

      <!-- Send Again Button (after success) -->
      <button
        v-else
        type="button"
        @click="handleSendAgain"
        :disabled="loading"
        class="w-full py-3 rounded-xl border border-gray-200 dark:border-neutral-700 text-gray-900 dark:text-white font-semibold hover:bg-gray-50 dark:hover:bg-neutral-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        <span v-if="loading" class="flex items-center justify-center gap-2">
          <span class="w-4 h-4 border-2 border-gray-400/30 border-t-gray-900 dark:border-t-white rounded-full animate-spin" />
          Sending...
        </span>
        <span v-else>Send Link Again</span>
      </button>
    </form>

    <!-- Info Box -->
    <div class="mt-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
      <div class="flex gap-3">
        <Icon name="mdi:information" class="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <p class="text-blue-800 dark:text-blue-300 text-xs">
          The reset link will expire in 15 minutes. If you don't receive an email, check your spam folder or try again.
        </p>
      </div>
    </div>

    <!-- Footer Slot -->
    <template #footer>
      <p class="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
        Remember your password?
        <NuxtLink
          to="/user-login"
          class="text-brand dark:text-brand-light font-semibold hover:text-brand-dark dark:hover:text-brand transition-colors ml-1"
        >
          Sign In
        </NuxtLink>
      </p>
      <p class="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
        Don't have an account?
        <NuxtLink
          to="/user-register"
          class="text-brand dark:text-brand-light font-semibold hover:text-brand-dark dark:hover:text-brand transition-colors ml-1"
        >
          Create one
        </NuxtLink>
      </p>
    </template>
  </AuthLayout>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useAuthApi } from '../services/auth.api'
import { z } from 'zod'
import AuthLayout from '../layouts/AuthLayout.vue'


definePageMeta({
  layout: false,
})

const authApi = useAuthApi()

const loading = ref(false)
const submitted = ref(false)

const form = reactive({
  email: '',
})

const errors = reactive({
  email: '',
})

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

const validateForm = () => {
  errors.email = ''

  const result = emailSchema.safeParse(form)

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
    const response = await authApi.requestPasswordReset(form.email)
    
    if (response) {
      submitted.value = true
    }
  } catch (error: any) {
    errors.email = error.message || 'Failed to send reset link. Please try again.'
  } finally {
    loading.value = false
  }
}

const handleSendAgain = () => {
  submitted.value = false
  handleSubmit()
}
</script>