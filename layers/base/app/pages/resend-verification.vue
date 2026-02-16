<!-- layers/auth/pages/resend-verification.vue -->
<template>
  <AuthLayout 
    title="Verify Your Email" 
    subtitle="We need to verify your email before you can log in"
  >
    <!-- Status Messages -->
    <div v-if="verificationState === 'sent'" class="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 mb-6">
      <div class="flex gap-3">
        <Icon name="mdi:check-circle" class="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
        <div>
          <h3 class="font-semibold text-green-900 dark:text-green-300 text-sm">Email sent!</h3>
          <p class="text-green-800 dark:text-green-400 text-xs mt-1">
            We've sent a verification link to <strong>{{ email }}</strong>. Check your inbox.
          </p>
        </div>
      </div>
    </div>

    <div v-if="verificationState === 'pending' && email" class="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 mb-6">
      <div class="flex gap-3">
        <Icon name="mdi:information" class="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <h3 class="font-semibold text-blue-900 dark:text-blue-300 text-sm">Check your email</h3>
          <p class="text-blue-800 dark:text-blue-400 text-xs mt-1">
            We need to verify your email before you can log in. Please enter your email below to receive a verification link.
          </p>
        </div>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="mb-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
      <p class="text-red-600 dark:text-red-400 text-sm">{{ error }}</p>
    </div>

    <!-- Resend Form -->
    <form v-if="verificationState !== 'sent'" class="space-y-4" @submit.prevent="handleResend">
      <!-- Email Input -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Email Address
        </label>
        <input
          v-model="email"
          type="email"
          placeholder="Enter your email"
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

      <!-- Submit Button -->
      <button
        type="submit"
        :disabled="isLoading"
        class="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 text-white font-semibold shadow-md hover:shadow-lg hover:from-purple-700 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        <span v-if="isLoading" class="flex items-center justify-center gap-2">
          <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Sending...
        </span>
        <span v-else>Send Verification Email</span>
      </button>
    </form>

    <!-- After Sent -->
    <div v-if="verificationState === 'sent'" class="space-y-4">
      <div class="p-4 rounded-xl bg-gray-100 dark:bg-neutral-800">
        <p class="text-gray-700 dark:text-gray-300 text-sm">
          ✅ Verification email sent to <strong>{{ email }}</strong>
        </p>
        <p class="text-gray-600 dark:text-gray-400 text-xs mt-2">
          Please check your inbox and spam folder. The link expires in 24 hours.
        </p>
      </div>

      <!-- Back to Login Button -->
      <NuxtLink
        to="/user-login"
        class="block w-full py-3 rounded-xl border border-gray-200 dark:border-neutral-700 text-gray-900 dark:text-white font-semibold text-center hover:bg-gray-50 dark:hover:bg-neutral-800 transition-all text-sm"
      >
        Back to Login
      </NuxtLink>

      <!-- Resend Another -->
      <button
        @click="resetForm"
        type="button"
        class="w-full py-3 rounded-xl text-purple-600 dark:text-purple-400 font-semibold hover:text-purple-700 dark:hover:text-purple-300 transition-colors text-sm"
      >
        Resend to Different Email
      </button>
    </div>

    <!-- Info Box -->
    <div class="mt-6 p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
      <div class="flex gap-3">
        <Icon name="mdi:lightbulb" class="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
        <div>
          <p class="text-yellow-800 dark:text-yellow-300 text-xs">
            <strong>Tip:</strong> After verifying your email, you'll be able to log in. If you don't see the email, check your spam folder.
          </p>
        </div>
      </div>
    </div>

    <!-- Footer Slot -->
    <template #footer>
      <p class="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
        Already verified?
        <NuxtLink
          to="/user-login"
          class="text-purple-600 dark:text-purple-400 font-semibold hover:text-purple-700 dark:hover:text-purple-300 transition-colors ml-1"
        >
          Log in
        </NuxtLink>
      </p>
      <p class="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
        Don't have an account?
        <NuxtLink
          to="/user-register"
          class="text-purple-600 dark:text-purple-400 font-semibold hover:text-purple-700 dark:hover:text-purple-300 transition-colors ml-1"
        >
          Create one
        </NuxtLink>
      </p>
    </template>
  </AuthLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'nuxt/app'
import { useAuth } from '../composables/useAuth'
import AuthLayout from '../layouts/AuthLayout.vue'

definePageMeta({
  layout: false,
  middleware: 'guest'
})

const route = useRoute()
const { resendVerificationEmail, isLoading: authLoading, error: authError } = useAuth()

type VerificationState = 'pending' | 'sent'

const email = ref('')
const verificationState = ref<VerificationState>('pending')

const errors = reactive({
  email: '',
})

const isLoading = computed(() => authLoading.value)
const error = computed(() => authError.value)

// Client-side validation
const validateEmail = () => {
  errors.email = ''

  if (!email.value) {
    errors.email = 'Email is required'
    return false
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errors.email = 'Please enter a valid email address'
    return false
  }

  return true
}

const handleResend = async () => {
  if (!validateEmail()) return

  try {
    await resendVerificationEmail(email.value)
    verificationState.value = 'sent'
  } catch (err: any) {
    console.error('Resend error:', err)
    // Error is already in authError
  }
}

const resetForm = () => {
  email.value = ''
  verificationState.value = 'pending'
  errors.email = ''
}

onMounted(() => {
  // Pre-fill email from query parameter if provided
  const queryEmail = route.query.email as string
  if (queryEmail) {
    email.value = queryEmail
  }
})
</script>