<template>
  <div class="reset-password-container">
    <div class="reset-password-card">
      <h1>Reset Password</h1>
      <p class="subtitle">Enter your new password below.</p>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" v-if="!submitted && !error">
        <div class="form-group">
          <label for="password">New Password</label>
          <div class="password-input-wrapper">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Enter new password"
              required
              :disabled="loading"
              @input="checkPasswordStrength"
              class="input"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="toggle-password"
            >
              {{ showPassword ? '👁️' : '👁️‍🗨️' }}
            </button>
          </div>

          <!-- Password Strength Meter -->
          <PasswordStrengthMeter :password="password" />

          <span v-if="errors.password" class="error-message">
            {{ errors.password }}
          </span>
        </div>

        <div class="form-group">
          <label for="confirm-password">Confirm Password</label>
          <input
            id="confirm-password"
            v-model="confirmPassword"
            :type="showConfirm ? 'text' : 'password'"
            placeholder="Confirm new password"
            required
            :disabled="loading"
            class="input"
          />
          <button
            type="button"
            @click="showConfirm = !showConfirm"
            class="toggle-password"
          >
            {{ showConfirm ? '👁️' : '👁️‍🗨️' }}
          </button>
          <span v-if="errors.confirmPassword" class="error-message">
            {{ errors.confirmPassword }}
          </span>
        </div>

        <button type="submit" :disabled="loading" class="btn btn-primary">
          <span v-if="loading">Resetting...</span>
          <span v-else>Reset Password</span>
        </button>

        <NuxtLink to="/user-login" class="back-link">Back to Login</NuxtLink>
      </form>

      <!-- Success State -->
      <div v-else-if="submitted && !error" class="success-state">
        <div class="icon">✓</div>
        <h2>Password Reset Successfully!</h2>
        <p>Your password has been reset. You can now log in with your new password.</p>
        <NuxtLink to="/user-login" class="btn btn-primary">
          Go to Login
        </NuxtLink>
      </div>

      <!-- Error State -->
      <div v-if="error" class="error-state">
        <div class="icon">✕</div>
        <h2>Reset Failed</h2>
        <p>{{ error }}</p>
        <div class="actions">
          <NuxtLink to="/forgot-password" class="btn btn-primary">
            Request New Reset Link
          </NuxtLink>
          <NuxtLink to="/user-login" class="btn btn-outline">
            Back to Login
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import PasswordStrengthMeter from '../components/PasswordStrengthMeter.vue'

const router = useRouter()
const route = useRoute()

const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirm = ref(false)
const loading = ref(false)
const submitted = ref(false)
const error = ref('')
const token = ref('')

const errors = reactive<{
  password?: string
  confirmPassword?: string
}>({})

onMounted(() => {
  token.value = route.query.token as string

  if (!token.value) {
    error.value = 'No reset token provided. Please request a new password reset.'
  }
})

const checkPasswordStrength = () => {
  // Clear any previous password errors
  errors.password = ''
}

const handleSubmit = async () => {
  // Validate
  errors.password = ''
  errors.confirmPassword = ''

  if (!password.value) {
    errors.password = 'Password is required'
    return
  }

  if (password.value.length < 12) {
    errors.password = 'Password must be at least 12 characters'
    return
  }

  if (!/[A-Z]/.test(password.value)) {
    errors.password = 'Password must contain an uppercase letter'
    return
  }

  if (!/[a-z]/.test(password.value)) {
    errors.password = 'Password must contain a lowercase letter'
    return
  }

  if (!/[0-9]/.test(password.value)) {
    errors.password = 'Password must contain a number'
    return
  }

  if (!/[!@#$%^&*]/.test(password.value)) {
    errors.password = 'Password must contain a special character (!@#$%^&*)'
    return
  }

  if (password.value !== confirmPassword.value) {
    errors.confirmPassword = 'Passwords do not match'
    return
  }

  loading.value = true

  try {
    const response = await $fetch('/api/auth/reset-password', {
      method: 'POST',
      body: {
        token: token.value,
        password: password.value,
      },
    })

    if (response.success) {
      submitted.value = true
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/user-login')
      }, 3000)
    } else {
      error.value = response.message || 'Failed to reset password'
    }
  } catch (err: any) {
    if (err.status === 400 && err.data?.code === 'TOKEN_EXPIRED') {
      error.value = 'Your reset link has expired. Please request a new one.'
    } else {
      error.value = err.data?.message || 'An error occurred. Please try again.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.reset-password-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.reset-password-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  padding: 2rem;
  width: 100%;
  max-width: 450px;
}

h1 {
  margin: 0 0 0.5rem 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: #1f2937;
  text-align: center;
}

.subtitle {
  text-align: center;
  color: #6b7280;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
  line-height: 1.5;
}

form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  position: relative;
}

label {
  font-weight: 500;
  color: #374151;
  font-size: 0.9rem;
}

.password-input-wrapper {
  position: relative;
  display: flex;
}

.input {
  flex: 1;
  padding: 0.75rem 2.5rem 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

.input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input:disabled {
  background: #f3f4f6;
  cursor: not-allowed;
}

.toggle-password {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  padding: 0.25rem;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.toggle-password:hover {
  opacity: 1;
}

.error-message {
  color: #ef4444;
  font-size: 0.85rem;
}

.btn {
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  width: 100%;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-outline {
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
  flex: 1;
}

.btn-outline:hover {
  background: #f3f4f6;
}

.back-link {
  text-align: center;
  color: #667eea;
  text-decoration: none;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  transition: color 0.2s;
}

.back-link:hover {
  color: #764ba2;
  text-decoration: underline;
}

.success-state,
.error-state {
  text-align: center;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.success-state .icon {
  color: #10b981;
}

.error-state .icon {
  color: #ef4444;
}

.success-state h2,
.error-state h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
}

.success-state p,
.error-state p {
  color: #6b7280;
  margin: 0.5rem 0 1rem 0;
  line-height: 1.5;
}

.actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
  flex-wrap: wrap;
}

.actions .btn {
  flex: 1;
  min-width: 150px;
}
</style>