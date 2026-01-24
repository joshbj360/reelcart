<!-- layers/auth/pages/verify-email.vue -->
<template>
  <AuthLayout 
    title="Verify your email" 
    subtitle="We've sent you a verification link"
  >
    <div v-if="verificationState === 'loading'" class="flex flex-col items-center justify-center py-8">
      <div class="w-12 h-12 border-4 border-brand/30 border-t-brand rounded-full animate-spin mb-4" />
      <p class="text-gray-600 dark:text-gray-400 text-sm">Verifying your email...</p>
    </div>

    <div v-else-if="verificationState === 'success'" class="space-y-6">
      <div class="p-6 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-center">
        <div class="flex justify-center mb-4">
          <div class="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <Icon name="mdi:check-circle" class="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <h2 class="text-xl font-bold text-green-900 dark:text-green-300 mb-2">Email verified!</h2>
        <p class="text-green-800 dark:text-green-400 text-sm mb-4">
          Your email has been successfully verified. You can now log in to your account.
        </p>
      </div>

      <NuxtLink
        to="/user-login"
        class="block w-full py-3 rounded-xl bg-gradient-to-r from-text-brand-dark to-text-brand text-white font-semibold text-center shadow-md hover:shadow-lg hover:opacity-90 transition-all text-sm"
      >
        Go to Login
      </NuxtLink>
    </div>

    <div v-else-if="verificationState === 'expired'" class="space-y-6">
      <div class="p-6 rounded-xl bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800">
        <div class="flex gap-4">
          <Icon name="mdi:clock-alert" class="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <h2 class="font-bold text-yellow-900 dark:text-yellow-300 mb-2">Verification link expired</h2>
            <p class="text-yellow-800 dark:text-yellow-400 text-sm mb-4">
              Your verification link has expired. We can send you a new one.
            </p>
          </div>
        </div>
      </div>

      <form @submit.prevent="handleResendEmail" class="space-y-4">
        <div>
          <input
            v-model="email"
            type="email"
            placeholder="Enter your email address"
            :disabled="resendLoading"
            :class="[
              'w-full px-4 py-3 rounded-xl border bg-transparent placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm',
              emailError 
                ? 'border-red-300 dark:border-red-700' 
                : 'border-gray-200 dark:border-neutral-700 text-gray-900 dark:text-white'
            ]"
          />
          <p v-if="emailError" class="mt-1.5 text-sm text-red-600 dark:text-red-400">
            {{ emailError }}
          </p>
        </div>

        <button
          type="submit"
          :disabled="resendLoading"
          class="w-full py-3 rounded-xl bg-gradient-to-r from-text-brand-dark to-text-brand text-white font-semibold shadow-md hover:shadow-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          <span v-if="resendLoading" class="flex items-center justify-center gap-2">
            <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Sending...
          </span>
          <span v-else>Send New Verification Link</span>
        </button>
      </form>
    </div>

    <div v-else-if="verificationState === 'error'" class="space-y-6">
      <div class="p-6 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
        <div class="flex gap-4">
          <Icon name="mdi:alert-circle" class="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h2 class="font-bold text-red-900 dark:text-red-300 mb-2">Verification failed</h2>
            <p class="text-red-800 dark:text-red-400 text-sm mb-4">
              {{ errorMessage || 'An error occurred while verifying your email. Please try again.' }}
            </p>
          </div>
        </div>
      </div>

      <NuxtLink
        to="/user-login"
        class="block w-full py-3 rounded-xl border border-gray-200 dark:border-neutral-700 text-gray-900 dark:text-white font-semibold text-center hover:bg-gray-50 dark:hover:bg-neutral-800 transition-all text-sm"
      >
        Back to Login
      </NuxtLink>
    </div>

    <div v-else class="space-y-6">
      <div class="p-6 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
        <div class="flex gap-4">
          <Icon name="mdi:information" class="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h2 class="font-bold text-blue-900 dark:text-blue-300 mb-2">Check your email</h2>
            <p class="text-blue-800 dark:text-blue-400 text-sm">
              We've sent a verification link to your email. Please click the link in the email to verify your account.
            </p>
          </div>
        </div>
      </div>

      <button
        @click="handleResendEmail"
        :disabled="resendLoading"
        class="w-full py-3 rounded-xl border border-gray-200 dark:border-neutral-700 text-gray-900 dark:text-white font-semibold hover:bg-gray-50 dark:hover:bg-neutral-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        <span v-if="resendLoading" class="flex items-center justify-center gap-2">
          <span class="w-4 h-4 border-2 border-gray-400/30 border-t-gray-900 dark:border-t-white rounded-full animate-spin" />
          Sending...
        </span>
        <span v-else>Didn't receive it? Resend</span>
      </button>
    </div>

    <!-- Footer Slot -->
    <template #footer>
      <p class="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
        Already verified?
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
import { ref, onMounted } from 'vue'
import { useRoute } from 'nuxt/app'
import { useAuthApi } from '../services/auth.api'
import { z } from 'zod'
import AuthLayout from '../layouts/AuthLayout.vue'


definePageMeta({
  layout: false,
})

const route = useRoute()
const authApi = useAuthApi()

type VerificationState = 'loading' | 'success' | 'expired' | 'error' | 'pending'

const verificationState = ref<VerificationState>('pending')
const errorMessage = ref('')
const resendLoading = ref(false)
const email = ref('')
const emailError = ref('')

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

const verifyEmail = async () => {
  const token = route.query.token as string
  
  if (!token) {
    verificationState.value = 'pending'
    return
  }

  verificationState.value = 'loading'

  try {
    const response = await authApi.verifyEmailToken(token)

    if (response) {
      verificationState.value = 'success'
    }
  } catch (error: any) {
    const statusCode = error.statusCode || error.response?.status
    const message = error.message

    if (statusCode === 410 || message?.includes('expired')) {
      verificationState.value = 'expired'
    } else {
      verificationState.value = 'error'
      errorMessage.value = message || 'Verification failed'
    }
  }
}

const handleResendEmail = async () => {
  if (verificationState.value === 'pending') {
    // Resend on pending state
    emailError.value = ''
    
    if (!email.value) {
      emailError.value = 'Please enter your email'
      return
    }

    const result = emailSchema.safeParse({ email: email.value })
    if (!result.success) {
      emailError.value = 'Please enter a valid email'
      return
    }
  }

  resendLoading.value = true

  try {
    const emailToUse = email.value || (route.query.email as string)
    
    const response = await authApi.resendEmailVerification(emailToUse)

    if (response) {
      verificationState.value = 'pending'
      email.value = ''
    }
  } catch (error: any) {
    emailError.value = error.message || 'Failed to resend verification email'
  } finally {
    resendLoading.value = false
  }
}

onMounted(() => {
  verifyEmail()
})
</script>