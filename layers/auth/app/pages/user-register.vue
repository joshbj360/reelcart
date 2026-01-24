<!-- layers/auth/pages/user-register.vue -->
<template>
  <AuthLayout 
    title="Create your account" 
    subtitle="Join the style community today"
  >
    <!-- Register Form -->
    <form class="space-y-4" @submit.prevent="handleSubmit">
      <!-- Email Input -->
      <div>
        <input
          v-model="form.email"
          type="email"
          placeholder="Email address"
          :disabled="loading"
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
            placeholder="Password (min 12 characters)"
            :disabled="loading"
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
            placeholder="Confirm password"
            :disabled="loading"
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

      <!-- Terms & Conditions -->
      <div class="flex items-start gap-3 pt-2">
        <input
          v-model="agreedToTerms"
          type="checkbox"
          id="terms"
          class="mt-1 rounded border-gray-300 text-brand focus:ring-brand"
        />
        <label for="terms" class="text-xs text-gray-600 dark:text-gray-400">
          I agree to the
          <a href="#" class="text-brand hover:text-brand-dark dark:text-brand-light transition-colors font-medium">
            Terms of Service
          </a>
          and
          <a href="#" class="text-brand hover:text-brand-dark dark:text-brand-light transition-colors font-medium">
            Privacy Policy
          </a>
        </label>
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        :disabled="loading || !agreedToTerms"
        class="w-full py-3 rounded-xl bg-gradient-to-r from-text-brand-dark to-text-brand text-white font-semibold shadow-md hover:shadow-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        <span v-if="loading" class="flex items-center justify-center gap-2">
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

    <!-- Social Register -->
    <div class="grid grid-cols-2 gap-3">
      <button
        :disabled="loading"
        class="flex items-center justify-center gap-2 py-2.5 border border-gray-200 dark:border-neutral-700 rounded-xl hover:bg-gray-50 dark:hover:bg-neutral-800 transition-all disabled:opacity-50 text-sm"
        @click="handleOAuthLogin('google')"
      >
        <Icon name="mdi:google" class="w-4 h-4 text-gray-600 dark:text-gray-300" />
        <span class="font-medium text-gray-700 dark:text-gray-300">Google</span>
      </button>

      <button
        :disabled="loading"
        class="flex items-center justify-center gap-2 py-2.5 border border-gray-200 dark:border-neutral-700 rounded-xl hover:bg-gray-50 dark:hover:bg-neutral-800 transition-all disabled:opacity-50 text-sm"
        @click="handleOAuthLogin('facebook')"
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
          class="text-brand dark:text-brand-light font-semibold hover:text-brand-dark dark:hover:text-brand transition-colors ml-1"
        >
          Sign In
        </NuxtLink>
      </p>
    </template>
  </AuthLayout>
</template>

<script setup lang="ts">
import { useAuth } from '../composables/useAuth'
import { reactive, ref, watch } from 'vue'
import { registerSchema } from '~~/server/utils/auth/auth.schema'
import AuthLayout from '../layouts/AuthLayout.vue'
import PasswordStrengthMeter from '../components/PasswordStrengthMeter.vue'


definePageMeta({
  layout: false,
})

const { register, loginWithOAuth, loading } = useAuth()

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const agreedToTerms = ref(false)

const form = reactive({
  email: '',
  password: '',
  confirmPassword: '',
})

const errors = reactive({
  email: '',
  password: '',
  confirmPassword: '',
})

const validateForm = () => {
  errors.email = ''
  errors.password = ''
  errors.confirmPassword = ''

  if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
    return false
  }

  if (!agreedToTerms.value) {
    // Show error in UI or just don't allow submit
    return false
  }

  const result = registerSchema.safeParse(form)

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

  const result = await register({
    email: form.email,
    password: form.password,
  })

  if (result?.success) {
    form.email = ''
    form.password = ''
    form.confirmPassword = ''
    showPassword.value = false
    showConfirmPassword.value = false
    agreedToTerms.value = false
  }
}

const handleOAuthLogin = async (provider: 'google' | 'facebook') => {
  await loginWithOAuth(provider)
}

watch(() => form.email, () => { errors.email = '' })
watch(() => form.password, () => { errors.password = '' })
watch(() => form.confirmPassword, () => { errors.confirmPassword = '' })
</script>