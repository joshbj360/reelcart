<!-- layers/auth/pages/verify-email.vue -->
<template>
  <AuthLayout 
    title="Verifying your email" 
    subtitle="Just a moment..."
  >
    <!-- Loading State -->
    <div v-if="verifyingState === 'loading'" class="flex flex-col items-center justify-center py-12">
      <div class="w-16 h-16 rounded-full border-4 border-purple-200 dark:border-purple-900 border-t-purple-600 animate-spin mb-6" />
      <p class="text-gray-600 dark:text-gray-400 text-sm">Verifying your email...</p>
    </div>

    <!-- Success State -->
    <div v-else-if="verifyingState === 'success'" class="space-y-6">
      <div class="flex justify-center mb-6">
        <div class="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <Icon name="mdi:check" class="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
      </div>

      <div class="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
        <h3 class="font-semibold text-green-900 dark:text-green-300 text-sm">Email verified!</h3>
        <p class="text-green-800 dark:text-green-400 text-xs mt-1">
          Your email has been successfully verified. You can now log in to your account.
        </p>
      </div>

      <!-- Redirect Message -->
      <div class="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <p class="text-blue-800 dark:text-blue-400 text-sm">
          Redirecting to login in <strong>{{ redirectCountdown }}</strong> seconds...
        </p>
      </div>

      <!-- Manual Link -->
      <NuxtLink
        to="/user-login"
        class="block w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 text-white font-semibold text-center hover:shadow-lg hover:from-purple-700 hover:to-purple-600 transition-all text-sm"
      >
        Go to Login Now
      </NuxtLink>
    </div>

    <!-- Error State -->
    <div v-else-if="verifyingState === 'error'" class="space-y-6">
      <div class="flex justify-center mb-6">
        <div class="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <Icon name="mdi:alert-circle" class="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
      </div>

      <div class="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
        <h3 class="font-semibold text-red-900 dark:text-red-300 text-sm">Verification failed</h3>
        <p class="text-red-800 dark:text-red-400 text-xs mt-1">
          {{ errorMessage || 'The verification link is invalid or has expired. Please request a new one.' }}
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="space-y-3">
        <NuxtLink
          to="/resend-verification"
          class="block w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 text-white font-semibold text-center hover:shadow-lg hover:from-purple-700 hover:to-purple-600 transition-all text-sm"
        >
          Request New Verification Link
        </NuxtLink>

        <NuxtLink
          to="/user-login"
          class="block w-full py-3 rounded-xl border border-gray-200 dark:border-neutral-700 text-gray-900 dark:text-white font-semibold text-center hover:bg-gray-50 dark:hover:bg-neutral-800 transition-all text-sm"
        >
          Back to Login
        </NuxtLink>
      </div>
    </div>

    <!-- Info Box -->
    <div class="mt-8 p-4 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700">
      <div class="flex gap-3">
        <Icon name="mdi:information" class="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0 mt-0.5" />
        <div>
          <p class="text-gray-700 dark:text-gray-300 text-xs">
            <strong>Info:</strong> Verification links expire after 24 hours. If your link has expired, you can request a new one.
          </p>
        </div>
      </div>
    </div>
  </AuthLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'nuxt/app'
import { useAuth } from '../composables/useAuth'
import AuthLayout from '../layouts/AuthLayout.vue'

definePageMeta({
  layout: false,
  middleware: 'guest'
})

const route = useRoute()
const router = useRouter()
const { verifyEmail } = useAuth()

type VerifyingState = 'loading' | 'success' | 'error'

const verifyingState = ref<VerifyingState>('loading')
const errorMessage = ref('')
const redirectCountdown = ref(5)

const performVerification = async () => {
  try {
    const token = route.query.token as string

    if (!token) {
      verifyingState.value = 'error'
      errorMessage.value = 'No verification token provided. Please check your email link.'
      return
    }

    // Call verify email from composable
    await verifyEmail(token)

    // Success!
    verifyingState.value = 'success'

    // Start countdown and redirect
    const interval = setInterval(() => {
      redirectCountdown.value--

      if (redirectCountdown.value <= 0) {
        clearInterval(interval)
        router.push('/user-login')
      }
    }, 1000)
  } catch (error: any) {
    console.error('Email verification error:', error)
    verifyingState.value = 'error'
    errorMessage.value = error.response?.data?.statusMessage || error.message || 'Failed to verify email'
  }
}

onMounted(() => {
  performVerification()
})
</script>