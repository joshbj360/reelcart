<template>
  <div class="forgot-password-container">
    <div class="forgot-password-card">
      <h1>Forgot Password?</h1>
      <p class="subtitle">
        Enter your email address and we'll send you a link to reset your password.
      </p>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" v-if="!submitted">
        <div class="form-group">
          <label for="email">Email Address</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="your@email.com"
            required
            :disabled="loading"
            class="input"
          />
          <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
        </div>

        <button type="submit" :disabled="loading" class="btn btn-primary">
          <span v-if="loading">Sending...</span>
          <span v-else>Send Reset Link</span>
        </button>

        <div class="links">
          <NuxtLink to="/user-login">Back to Login</NuxtLink>
          <NuxtLink to="/user-register">Create Account</NuxtLink>
        </div>
      </form>

      <!-- Success State -->
      <div v-else class="success-state">
        <div class="icon">✓</div>
        <h2>Check Your Email</h2>
        <p>
          We've sent a password reset link to:
        </p>
        <p class="email-highlight">{{ email }}</p>
        <p class="instructions">
          Click the link in the email to reset your password. The link will expire in 15 minutes.
        </p>

        <div class="actions">
          <button @click="reset" class="btn btn-secondary">
            Send Another Email
          </button>
          <NuxtLink to="/user-login" class="btn btn-outline">
            Back to Login
          </NuxtLink>
        </div>
      </div>

      <!-- Error State -->
      <div v-if="generalError" class="error-state">
        <p class="error-message">{{ generalError }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

const email = ref('')
const loading = ref(false)
const submitted = ref(false)
const generalError = ref('')
const errors = reactive<{ email?: string }>({})

const handleSubmit = async () => {
  // Validate
  errors.email = ''
  generalError.value = ''

  if (!email.value) {
    errors.email = 'Email is required'
    return
  }

  if (!email.value.includes('@')) {
    errors.email = 'Please enter a valid email'
    return
  }

  loading.value = true

  try {
    const response = await $fetch('/api/auth/forgot-password', {
      method: 'POST',
      body: { email: email.value },
    })

    if (response.success) {
      submitted.value = true
    } else {
      generalError.value = response.message || 'Failed to send reset link'
    }
  } catch (err: any) {
    generalError.value = err.data?.message || 'An error occurred. Please try again.'
  } finally {
    loading.value = false
  }
}

const reset = () => {
  submitted.value = false
  email.value = ''
  generalError.value = ''
}
</script>

<style scoped>
.forgot-password-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.forgot-password-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  padding: 2rem;
  width: 100%;
  max-width: 400px;
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
}

label {
  font-weight: 500;
  color: #374151;
  font-size: 0.9rem;
}

.input {
  padding: 0.75rem 1rem;
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

.btn-secondary {
  background: #667eea;
  color: white;
  flex: 1;
}

.btn-secondary:hover {
  background: #5568d3;
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

.links {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  margin-top: 0.5rem;
}

.links a {
  color: #667eea;
  text-decoration: none;
  transition: color 0.2s;
}

.links a:hover {
  color: #764ba2;
  text-decoration: underline;
}

.success-state {
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
  color: #10b981;
  margin-bottom: 1rem;
}

.success-state h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
}

.success-state p {
  color: #6b7280;
  margin: 0.5rem 0;
  line-height: 1.5;
}

.email-highlight {
  font-weight: 600;
  color: #1f2937;
  background: #f3f4f6;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  margin: 1rem 0;
  word-break: break-all;
}

.instructions {
  background: #fef3c7;
  border-left: 4px solid #f59e0b;
  padding: 1rem;
  border-radius: 4px;
  margin: 1rem 0;
  font-size: 0.9rem;
}

.actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.error-state {
  padding: 1rem;
  background: #fee2e2;
  border-left: 4px solid #ef4444;
  border-radius: 4px;
  margin-top: 1rem;
}
</style>