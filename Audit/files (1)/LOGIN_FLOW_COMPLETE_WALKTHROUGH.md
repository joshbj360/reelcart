# 🔐 Complete Login Flow - From Page to Authentication

Let me walk you through the **entire login flow** from the login page to successful authentication.

---

## 🎯 High-Level Flow Diagram

```
┌─────────────────────┐
│  Login Page Loads   │  (user-login.vue)
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────┐
│ Generate CSRF Token         │  (middleware)
│ Set in HttpOnly Cookie      │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ User Enters Credentials     │
│ • Email                     │
│ • Password                  │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ Submit Form                 │  (POST /api/auth/login)
│ Include CSRF Token          │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ 1. Validate CSRF Token      │
│ 2. Check Rate Limit         │  (Rate limiter checks IP)
│ 3. Validate Input (Zod)     │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ Authenticate with Supabase  │
│ • Email/password to Supabase│
│ • Get access token          │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ Check Email Verification    │  (if REQUIRE_EMAIL_VERIFICATION=true)
│ • Must be verified          │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ Fetch/Create DB Profile     │  (Local Postgres)
│ • Find or create user       │
│ • Get seller info if seller │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ Sanitize Response with Zod  │  (Remove sensitive fields)
│ • Only safe fields returned │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ Log to Audit Trail          │  (AuditLog table)
│ • Event: LOGIN_SUCCESS      │
│ • IP, User-Agent            │
│ • Clear rate limit counter  │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ Return Safe Response        │
│ • User data (no sensitive)  │
│ • Session tokens            │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ Client Updates Auth Store   │  (Pinia)
│ • Save user profile         │
│ • Mark as authenticated     │
│ • Store session tokens      │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ Navigate to Dashboard       │  (useAuth composable)
│ • User redirected           │
│ • Page loads                │
└─────────────────────────────┘
```

---

## 📍 STEP 1: Login Page Loads

### File: `layers/auth/pages/user-login.vue`

```vue
<template>
  <div class="login-container">
    <!-- Email Input -->
    <input 
      v-model="form.email"
      type="email"
      placeholder="Email address"
    />

    <!-- Password Input -->
    <input 
      v-model="form.password"
      :type="showPassword ? 'text' : 'password'"
      placeholder="Password"
    />

    <!-- Submit Button -->
    <button @submit.prevent="handleSubmit">
      Sign In
    </button>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '../composables/useAuth'

const { login } = useAuth()

const form = reactive({
  email: '',
  password: '',
})

const loading = ref(false)
const errors = reactive({
  email: '',
  password: '',
})

// When user clicks "Sign In"
async function handleSubmit() {
  loading.value = true
  errors.email = ''
  errors.password = ''

  try {
    // ← FLOW CONTINUES IN NEXT STEP
  } catch (err) {
    console.error('Login error:', err)
  } finally {
    loading.value = false
  }
}
</script>
```

**What happens:**
- User sees login form
- No authentication yet
- Form ready to submit

---

## 📍 STEP 2: User Submits Form

### File: `layers/auth/pages/user-login.vue` (continued)

```vue
<script setup>
async function handleSubmit() {
  loading.value = true

  try {
    // STEP 2: Call the useAuth composable
    const result = await login({
      email: form.email,
      password: form.password,
    })

    if (result?.success) {
      // Success! Navigation handled by composable
      resetForm()
    }
  } catch (err) {
    // Error display
    errors.email = err.message || 'Login failed'
  }
}
</script>
```

**What happens:**
- Form validation (basic - not empty)
- User's credentials passed to composable
- Composable calls API

---

## 📍 STEP 3: useAuth Composable

### File: `layers/auth/composables/useAuth.ts`

```typescript
export const useAuth = () => {
  const authStore = useAuthStore()
  const router = useRouter()

  /**
   * Login wrapper
   * STEP 3: Composable delegates to store
   */
  const login = async (credentials: ILoginCredentials) => {
    // Composable just passes through to store
    const result = await authStore.login(credentials)
    
    if (result.success) {
      // After successful login, navigate
      const isSeller = authStore.isSeller
      router.push(isSeller ? '/sellers/dashboard' : '/')
    }
    
    return result
  }

  return {
    login,
    // ... other methods
  }
}
```

**Architecture Rule**: Composables only call store methods, never API directly

**What happens:**
- Composable validates and delegates to Pinia store
- Store will call the API service

---

## 📍 STEP 4: Pinia Auth Store

### File: `layers/auth/stores/auth.store.ts`

```typescript
export const useAuthStore = defineStore('auth', () => {
  const userProfile = ref<ISafeUser | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /**
   * STEP 4: Store coordinates the login
   */
  async function login(credentials: ILoginCredentials) {
    const authApi = useAuthApi()
    isLoading.value = true
    error.value = null

    try {
      // STEP 4.1: Call the API
      const response = await authApi.login(credentials)
      
      // STEP 4.2: Validate response with Zod
      // (AuthApiClient already did this, but we double-check)
      
      // STEP 4.3: Store the safe user data
      userProfile.value = response.user
      
      // STEP 4.4: Show success notification
      notify({ type: 'success', text: 'Login successful!' })
      
      return { success: true }
    } catch (e: any) {
      error.value = e.message
      notify({ type: 'error', text: e.message || 'Login failed' })
      return { success: false, error: e.message }
    } finally {
      isLoading.value = false
    }
  }

  return {
    userProfile,
    isLoading,
    error,
    login,
    // ... other methods
  }
})
```

**What happens:**
- Store sets loading = true
- Calls API client
- Stores response
- Shows notifications

---

## 📍 STEP 5: API Client

### File: `layers/auth/services/auth.api.ts`

```typescript
export class AuthApiClient extends BaseApiClient {
  /**
   * STEP 5: API client validates and calls server
   */
  async login(credentials: ILoginCredentials) {
    // STEP 5.1: Validate input client-side with Zod
    const validated = loginSchema.parse(credentials)
    // Throws if validation fails

    // STEP 5.2: Make API call to server
    const response = await this.request<{ user: ISafeUser; session: any }>(
      '/api/auth/login',  // ← Server endpoint
      {
        method: 'POST',
        body: validated,   // Only validated data sent
      }
    )

    // STEP 5.3: Validate response with Zod
    // This ensures server isn't returning sensitive data
    safeUserSchema.parse(response.user)

    return response
  }
}

function useAuthApi() {
  if (!authApiInstance) {
    authApiInstance = new AuthApiClient()
  }
  return authApiInstance
}
```

**Validation happens here:**
- Input validation (email, password format)
- Output validation (server response)
- Only safe fields in response

---

## 📍 STEP 6: Server API Endpoint

### File: `server/api/auth/login.post.ts`

This is where the REAL security happens. Let me break down each step:

```typescript
export default defineEventHandler(async (event: H3Event) => {
  const ipAddress = getClientIp(event.node.req)
  const userAgent = getUserAgent(event.node.req)

  try {
    // ═══════════════════════════════════════════════════════
    // STEP 6.1: CSRF PROTECTION ✅
    // ═══════════════════════════════════════════════════════
    validateCsrfToken(event)
    // ↓ Checks:
    //   • Token in header (x-csrf-token)
    //   • Token in cookie (__csrf_token)
    //   • They match
    // ↓ If fails: Throws 403 Forbidden

    // ═══════════════════════════════════════════════════════
    // STEP 6.2: VALIDATE REQUEST BODY ✅
    // ═══════════════════════════════════════════════════════
    const body = await readBody(event)
    const validation = loginSchema.safeParse(body)

    if (!validation.success) {
      throw createError({
        statusCode: 400,
        message: validation.error.errors[0].message,
        data: validation.error.errors,
      })
    }

    const { email, password } = validation.data
    // ↓ Checks:
    //   • Email is valid email format
    //   • Password is not empty

    // ═══════════════════════════════════════════════════════
    // STEP 6.3: RATE LIMITING ✅
    // ═══════════════════════════════════════════════════════
    try {
      const { remaining } = checkRateLimit(email, rateLimitConfig.login)
      // ↓ Checks (from rateLimiter.ts):
      //   • How many failed attempts for this email?
      //   • Are they within the 15-minute window?
      //   • Is account locked?
      // ↓ Returns: remaining attempts
      setResponseHeader(event, 'X-RateLimit-Remaining', String(remaining))
    } catch (rateLimitError: any) {
      // If exceeded limit:
      await logAuditEvent({
        eventType: AuditEventType.LOGIN_FAILED_RATE_LIMITED,
        email,
        ipAddress,
        userAgent,
        success: false,
        reason: 'Rate limit exceeded',
      })
      throw rateLimitError  // 429 Too Many Requests
    }

    // ═══════════════════════════════════════════════════════
    // STEP 6.4: AUTHENTICATE WITH SUPABASE ✅
    // ═══════════════════════════════════════════════════════
    const client = await serverSupabaseClient(event)
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      // FAILED: Wrong email or password
      // Log the failed attempt (for rate limiting)
      checkRateLimit(email, rateLimitConfig.login)

      await throwAuthError(AuthErrorCode.INVALID_CREDENTIALS, {
        statusCode: 401,
        email,
        ipAddress,
        userAgent,
        internalDetails: { supabaseError: error.message },
      })
      // ↓ Returns generic error:
      //   "Invalid email or password"
      // ↓ No info about which field is wrong
    }

    // SUCCESS: Supabase verified email/password
    // data.user = Supabase user
    // data.session = JWT tokens

    // ═══════════════════════════════════════════════════════
    // STEP 6.5: CHECK EMAIL VERIFICATION ✅
    // ═══════════════════════════════════════════════════════
    if (process.env.REQUIRE_EMAIL_VERIFICATION === 'true') {
      if (!data.user?.email_confirmed_at) {
        // Email not verified
        await throwAuthError(AuthErrorCode.EMAIL_NOT_VERIFIED, {
          statusCode: 403,
          email,
          userId: data.user?.id,
          ipAddress,
          userAgent,
        })
        // ↓ User must verify email first
      }
    }

    // ═══════════════════════════════════════════════════════
    // STEP 6.6: FETCH/CREATE USER PROFILE ✅
    // ═══════════════════════════════════════════════════════
    const profile = await authRepository.findOrCreateProfile({
      id: data.user!.id,                              // From Supabase
      email: data.user!.email!,
      username: data.user!.user_metadata?.username || email.split('@')[0],
      avatar: data.user!.user_metadata?.avatar_url || null,
    })

    // ↓ In Database (Postgres):
    //   SELECT * FROM Profile WHERE id = data.user.id
    //   IF EXISTS: return profile
    //   IF NOT EXISTS: INSERT new profile with default role='user'

    // ═══════════════════════════════════════════════════════
    // STEP 6.7: SANITIZE RESPONSE WITH ZOD ✅
    // ═══════════════════════════════════════════════════════
    const safeUser = safeUserSchema.parse(profile)

    // ↓ Zod ensures only these fields returned:
    //   ✅ id
    //   ✅ email
    //   ✅ username
    //   ✅ avatar
    //   ✅ role ('user' or 'seller')
    //   ✅ created_at
    //   ✅ sellerProfile (if seller)
    //
    // ↓ These are REMOVED:
    //   ❌ password_hash
    //   ❌ updated_at
    //   ❌ app_metadata
    //   ❌ Any other sensitive fields

    // ═══════════════════════════════════════════════════════
    // STEP 6.8: CLEAR RATE LIMIT ✅
    // ═══════════════════════════════════════════════════════
    clearRateLimit(email, rateLimitConfig.login.keyPrefix)

    // ↓ Reset counter for this email
    // ↓ Next time they can try 5 more times

    // ═══════════════════════════════════════════════════════
    // STEP 6.9: LOG AUDIT EVENT ✅
    // ═══════════════════════════════════════════════════════
    await logAuditEvent({
      eventType: AuditEventType.LOGIN_SUCCESS,
      userId: data.user!.id,
      email,
      ipAddress,
      userAgent,
      success: true,
    })

    // ↓ Writes to AuditLog table:
    // INSERT INTO AuditLog (
    //   event_type, user_id, email, ip_address, user_agent, success, created_at
    // ) VALUES (
    //   'LOGIN_SUCCESS', 'user-123', 'user@example.com', '192.168.1.1', 'Mozilla...', true, NOW()
    // )

    // ═══════════════════════════════════════════════════════
    // STEP 6.10: RETURN SAFE RESPONSE ✅
    // ═══════════════════════════════════════════════════════
    return {
      user: safeUser,  // Safe data only
      session: {
        access_token: data.session?.access_token,
        refresh_token: data.session?.refresh_token,
        expires_in: data.session?.expires_in,
        expires_at: data.session?.expires_at,
      },
    }

  } catch (error: any) {
    // Error occurred - but DON'T leak details

    if (error.statusCode && error.statusCode < 500) {
      throw error  // Safe error (4xx)
    }

    // Unexpected error (5xx) - don't expose details
    console.error('Login endpoint error:', {
      error: error.message,
      stack: error.stack,
      ipAddress,
    })

    await logAuditEvent({
      eventType: AuditEventType.LOGIN_FAILED,
      ipAddress,
      userAgent,
      success: false,
      reason: 'Unexpected error',
    })

    throw createError({
      statusCode: 500,
      message: 'An error occurred. Please try again later.',
      data: {
        code: AuthErrorCode.GENERIC,
      },
    })
  }
})
```

---

## 📍 STEP 7: Client Receives Response

### Back to: `layers/auth/stores/auth.store.ts`

```typescript
async function login(credentials: ILoginCredentials) {
  const authApi = useAuthApi()
  isLoading.value = true
  error.value = null

  try {
    // Server returns response
    const response = await authApi.login(credentials)
    
    // STEP 7: Store the safe user in Pinia
    userProfile.value = response.user
    
    // Now user is authenticated!
    console.log('User logged in:', {
      id: response.user.id,
      email: response.user.email,
      role: response.user.role,
    })

    return { success: true }
  } catch (e: any) {
    error.value = e.message
    return { success: false }
  }
}
```

**State Update:**
- `userProfile` = user data
- `isLoading` = false
- `isAuthenticated` computed = true
- `isSeller` computed = true/false based on role

---

## 📍 STEP 8: Navigation

### Back to: `layers/auth/composables/useAuth.ts`

```typescript
const login = async (credentials: ILoginCredentials) => {
  const result = await authStore.login(credentials)
  
  if (result.success) {
    // STEP 8: Navigate based on user role
    const isSeller = authStore.isSeller
    
    if (isSeller) {
      router.push('/sellers/dashboard')
    } else {
      router.push('/')
    }
  }
  
  return result
}
```

**What happens:**
- If login successful → navigate to dashboard
- If regular user → go to home page
- If seller → go to seller dashboard

---

## 🔐 Security Summary - What Gets Protected

| Step | Protection | How |
|------|-----------|-----|
| 1 | CSRF | Token must match cookie |
| 2 | Injection | Zod validation |
| 3 | Brute Force | Rate limiter (5 attempts = 30 min lockout) |
| 4 | Auth | Supabase verifies password |
| 5 | Email | Must be verified (if enforced) |
| 6 | Data Leakage | Zod sanitizes response |
| 7 | Audit | All events logged |
| 8 | Enumeration | Generic error messages |

---

## 🔄 Failed Login Example

Let's say someone tries to login with wrong password:

### Server receives:
```json
{
  "email": "user@example.com",
  "password": "wrongpassword",
  "csrf_token": "abc123..."
}
```

### Step-by-step:

**Step 1**: CSRF validated ✅

**Step 2**: Input validated ✅

**Step 3**: Rate limiting check
- Counter for this email: 1 attempt
- Allowed: 5 total
- Remaining: 4

**Step 4**: Supabase check
- Supabase says: "Invalid credentials"
- Increment counter to: 2 attempts
- Not locked yet

**Step 5-6**: Skipped (failed before here)

**Step 9**: Log audit event
```sql
INSERT INTO AuditLog (
  event_type,        -- 'LOGIN_FAILED'
  email,              -- 'user@example.com'
  ip_address,         -- '192.168.1.100'
  user_agent,         -- 'Mozilla/5.0...'
  success,            -- false
  reason,             -- 'Invalid credentials'
  created_at          -- NOW()
) VALUES (...)
```

**Step 10**: Return error
```json
{
  "statusCode": 401,
  "message": "Invalid email or password"  // Generic - doesn't say which
}
```

---

## 🔄 Successful Login Data Flow

```
1. Login Form
   └─> email: "user@example.com"
   └─> password: "SecurePass123!"

2. useAuth composable
   └─> authStore.login(credentials)

3. Auth Store
   └─> authApi.login(credentials)

4. API Client
   └─> POST /api/auth/login

5. Server Endpoint
   ├─> CSRF check ✅
   ├─> Rate limit check ✅
   ├─> Supabase verify ✅
   ├─> Check email verified ✅
   ├─> Fetch DB profile ✅
   ├─> Sanitize with Zod ✅
   ├─> Log audit event ✅
   └─> Return safe response

6. Response received
   {
     user: {
       id: "123",
       email: "user@example.com",
       username: "user",
       avatar: null,
       role: "user",
       created_at: "2025-01-19T...",
       sellerProfile: null
     },
     session: {
       access_token: "eyJhbGc...",
       refresh_token: "abc123...",
       expires_in: 3600,
       expires_at: 1705689600
     }
   }

7. Pinia Store
   └─> userProfile = user data
   └─> isAuthenticated = true
   └─> isLoading = false

8. Navigation
   └─> router.push('/')

9. User sees Dashboard
   ✅ LOGGED IN
```

---

## 📊 Database Changes During Login

### Before Login
```
AuditLog table:
(empty or previous login attempts)

FailedLoginAttempt table:
(if first login, empty)
```

### After Successful Login
```
AuditLog table:
INSERT: {
  event_type: 'LOGIN_SUCCESS',
  user_id: '123',
  email: 'user@example.com',
  ip_address: '192.168.1.100',
  user_agent: 'Mozilla/5.0...',
  success: true,
  created_at: NOW()
}

FailedLoginAttempt table:
(cleared for this email - counter reset)

No change to Profile table
(user already exists, just logged in)
```

---

## 🚨 What Happens if Someone Tries Brute Force

### Attack attempt:

```bash
# Try 1
curl -X POST http://localhost:3000/api/auth/login \
  -H "X-CSRF-Token: abc123" \
  -d '{"email":"victim@example.com","password":"guess1"}'
# Response: 401 Invalid credentials
# Counter: 1/5

# Try 2
curl -X POST http://localhost:3000/api/auth/login \
  -H "X-CSRF-Token: abc123" \
  -d '{"email":"victim@example.com","password":"guess2"}'
# Response: 401 Invalid credentials
# Counter: 2/5

# ... tries 3 and 4 ...

# Try 5
# Counter: 5/5 (limit reached)
# Response: 401 Invalid credentials
# Counter: 5/5, locked_until: NOW() + 30 minutes

# Try 6 (within lockout period)
curl -X POST http://localhost:3000/api/auth/login \
  -H "X-CSRF-Token: abc123" \
  -d '{"email":"victim@example.com","password":"guess6"}'
# Response: 429 Too Many Requests
# Message: "Too many attempts. Please try again in 1782 seconds"
# Audit Log: LOGIN_FAILED_RATE_LIMITED
```

---

## ✅ Security Checklist - What's Protected

### Input Layer
- [x] CSRF token required
- [x] Email format validation
- [x] Password not empty
- [x] No SQL injection (Prisma ORM)

### Business Logic Layer
- [x] Rate limiting (5 attempts, 30 min lockout)
- [x] Supabase password verification
- [x] Email verification enforcement
- [x] Generic error messages (no enumeration)

### Database Layer
- [x] Password hashed by Supabase
- [x] All login attempts logged
- [x] Rate limit counters tracked
- [x] Audit trail complete

### Output Layer
- [x] Sensitive fields removed (Zod sanitization)
- [x] No password/hashes returned
- [x] No internal details exposed
- [x] Safe error messages only

---

## 🎯 Key Takeaways

### The Flow:
1. **Client**: Form submission with CSRF token
2. **API**: Validate, rate limit, check CSRF
3. **Auth**: Verify credentials with Supabase
4. **DB**: Create profile if needed, log event
5. **Response**: Return safe data only
6. **Store**: Update Pinia state
7. **Navigation**: Redirect to dashboard

### Security Layers (Defense in Depth):
- **Layer 1**: CSRF protection
- **Layer 2**: Rate limiting
- **Layer 3**: Input validation
- **Layer 4**: Authentication (Supabase)
- **Layer 5**: Email verification
- **Layer 6**: Data sanitization
- **Layer 7**: Audit logging
- **Layer 8**: Error masking

### What Gets Protected:
- ✅ Brute force attacks (rate limiting)
- ✅ CSRF attacks (token validation)
- ✅ Data leakage (sanitization)
- ✅ Email enumeration (generic errors)
- ✅ SQL injection (Prisma ORM)
- ✅ XSS attacks (Zod validation)

---

Ready to implement? Start with the **phase1-complete.sh** script! 🚀
