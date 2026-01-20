<template>
  <div class="verify-email-container">
    <div class="verify-email-card">
      <!-- Loading State -->
      <div v-if="loading" class="state loading">
        <div class="spinner"></div>
        <p>Verifying your email...</p>
      </div>

      <!-- Success State -->
      <div v-else-if="verified" class="state success">
        <div class="icon">✓</div>
        <h2>Email Verified!</h2>
        <p>Your email has been successfully verified.</p>
        <button @click="navigateToDashboard" class="btn btn-primary">
          Go to Dashboard
        </button>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="state error">
        <div class="icon">✕</div>
        <h2>Verification Failed</h2>
        <p>{{ error }}</p>
        <div class="actions">
          <button @click="requestNewToken" class="btn btn-secondary">
            Request New Token
          </button>
          <button @click="goToLogin" class="btn btn-outline">
            Back to Login
          </button>
        </div>
      </div>

      <!-- Expired State -->
      <div v-else-if="expired" class="state expired">
        <div class="icon">⏰</div>
        <h2>Token Expired</h2>
        <p>Your verification link has expired. Please request a new one.</p>
        <button @click="requestNewToken" class="btn btn-primary">
          Send New Verification Email
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const loading = ref(true)
const verified = ref(false)
const error = ref<string | null>(null)
const expired = ref(false)
const email = ref<string>('')

onMounted(async () => {
  const token = route.query.token as string

  if (!token) {
    error.value = 'No verification token provided'
    loading.value = false
    return
  }

  try {
    const response = await $fetch('/api/auth/verify-email', {
      method: 'POST',
      body: { token },
    })

    if (response.success) {
      verified.value = true
      email.value = response.email || ''
    } else {
      error.value = response.message || 'Verification failed'
    }
  } catch (err: any) {
    if (err.status === 400 && err.data?.code === 'TOKEN_EXPIRED') {
      expired.value = true
      email.value = err.data?.email || ''
    } else {
      error.value = err.data?.message || 'An error occurred during verification'
    }
  } finally {
    loading.value = false
  }
})

const navigateToDashboard = () => {
  router.push('/')
}

const goToLogin = () => {
  router.push('/user-login')
}

const requestNewToken = async () => {
  if (!email.value) {
    error.value = 'Email not found. Please try logging in again.'
    return
  }

  loading.value = true
  try {
    await $fetch('/api/auth/resend-verification', {
      method: 'POST',
      body: { email: email.value },
    })

    error.value = null
    // Show success message
    alert('A new verification email has been sent to ' + email.value)
  } catch (err: any) {
    error.value = err.data?.message || 'Failed to send verification email'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.verify-email-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.verify-email-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  padding: 2rem;
  width: 100%;
  max-width: 400px;
  text-align: center;
}

.state {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.state.success .icon {
  color: #10b981;
}

.state.error .icon {
  color: #ef4444;
}

.state.expired .icon {
  color: #f59e0b;
}

h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
}

p {
  margin: 0.5rem 0 1.5rem 0;
  color: #6b7280;
  font-size: 0.95rem;
  line-height: 1.5;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
}

.btn-secondary {
  background: #667eea;
  color: white;
}

.btn-secondary:hover {
  background: #5568d3;
}

.btn-outline {
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-outline:hover {
  background: #f3f4f6;
}
</style>