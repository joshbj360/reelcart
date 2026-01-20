# 🏗️ Complete Project Structure Tree

## Your ReelCart Project - Final State After Phase 1 Implementation

```
reelcart-app/
│
├── 📄 Root Configuration Files
│   ├── nuxt.config.ts                 (Your Nuxt config)
│   ├── tsconfig.json                  (TypeScript config)
│   ├── package.json                   (Dependencies)
│   ├── .env                           (Environment variables - UPDATE THIS)
│   ├── .env.example                   (Env template)
│   ├── .gitignore
│   └── README.md
│
├── 📁 prisma/                         (Database)
│   ├── schema.prisma                  (UPDATE: Add 4 security tables)
│   ├── migrations/
│   │   ├── [timestamp]_init/
│   │   │   ├── migration.sql
│   │   │   └── ... (your existing migrations)
│   │   └── [timestamp]_add_auth_security_tables/  ⭐ NEW
│   │       └── migration.sql
│   └── seed.ts                        (Optional seeding)
│
├── 📁 server/                         (Backend - Nuxt Server)
│   │
│   ├── 📁 api/                        (API Routes)
│   │   └── 📁 auth/                   (Authentication endpoints)
│   │       ├── login.post.ts          ⭐ UPDATED (now with security)
│   │       ├── register.post.ts       ⭐ NEW (your updated version)
│   │       ├── logout.post.ts         (Your existing)
│   │       ├── verify-email.post.ts   ⭐ NEW (verify tokens)
│   │       ├── forgot-password.post.ts ⭐ NEW (request reset)
│   │       ├── reset-password.post.ts ⭐ NEW (complete reset)
│   │       ├── profile.get.ts         (Your existing)
│   │       └── refresh-token.post.ts  (Your existing)
│   │
│   ├── 📁 middleware/                 (Server middleware)
│   │   ├── security.ts                ⭐ NEW (security headers)
│   │   ├── csrf.ts                    ⭐ NEW (CSRF validation)
│   │   ├── rateLimiter.ts             ⭐ NEW (rate limit check)
│   │   └── auth.ts                    (Your existing middleware)
│   │
│   ├── 📁 utils/                      (Server utilities)
│   │   │
│   │   ├── 📁 auth/                   ⭐ NEW FOLDER
│   │   │   ├── rateLimiter.ts         ⭐ NEW (in-memory rate limiting)
│   │   │   ├── passwordValidator.ts   ⭐ NEW (OWASP validation)
│   │   │   ├── auditLog.ts            ⭐ NEW (event logging)
│   │   │   └── auth.schema.ts         (Your existing - UPDATE with enhanced schema)
│   │   │
│   │   ├── 📁 security/               ⭐ NEW FOLDER
│   │   │   ├── csrf.ts                ⭐ NEW (CSRF token management)
│   │   │   ├── errors.ts              ⭐ NEW (error handling)
│   │   │   └── tokenManager.ts        (Your existing if any)
│   │   │
│   │   ├── 📁 monitoring/             ⭐ NEW FOLDER
│   │   │   ├── authMonitoring.ts      ⭐ NEW (metrics & alerts)
│   │   │   └── logger.ts              (Your existing if any)
│   │   │
│   │   ├── 📁 db/                     (Your existing)
│   │   │   ├── db.ts                  (Prisma instance)
│   │   │   └── ... (your existing DB utils)
│   │   │
│   │   └── 📁 email/                  (Your existing)
│   │       ├── sendEmail.ts
│   │       └── templates/
│   │
│   ├── 📁 database/                   (Your existing)
│   │   └── 📁 repositories/           (Your existing)
│   │       ├── auth.repository.ts     (UPDATE: add new methods)
│   │       ├── profile.repository.ts
│   │       └── ... (your other repos)
│   │
│   ├── 📁 plugins/                    (Server plugins)
│   │   ├── monitoring.ts              ⭐ NEW (start monitoring on boot)
│   │   └── ... (your existing plugins)
│   │
│   └── 📁 types/                      (Server types)
│       ├── auth.types.ts              (UPDATE: add new types)
│       └── ... (your existing types)
│
├── 📁 layers/                         (Feature layers)
│   │
│   ├── 📁 auth/                       (Auth layer)
│   │   │
│   │   ├── 📁 pages/
│   │   │   ├── user-login.vue         (Your existing)
│   │   │   ├── user-register.vue      (Your existing)
│   │   │   ├── verify-email.vue       ⭐ NEW (email verification page)
│   │   │   ├── forgot-password.vue    ⭐ NEW (reset request page)
│   │   │   └── reset-password.vue     ⭐ NEW (reset complete page)
│   │   │
│   │   ├── 📁 components/
│   │   │   ├── LoginForm.vue          (Your existing)
│   │   │   ├── RegisterForm.vue       (Your existing)
│   │   │   ├── PasswordStrengthMeter.vue ⭐ NEW (strength indicator)
│   │   │   └── ... (your other components)
│   │   │
│   │   ├── 📁 stores/
│   │   │   └── auth.store.ts          (Your existing - UPDATE for new flows)
│   │   │
│   │   ├── 📁 composables/
│   │   │   ├── useAuth.ts             (Your existing - UPDATE)
│   │   │   ├── useLogin.ts            (Your existing)
│   │   │   ├── useRegister.ts         (Your existing)
│   │   │   └── usePasswordReset.ts    ⭐ NEW (reset flow)
│   │   │
│   │   ├── 📁 services/
│   │   │   ├── auth.api.ts            (Your existing - UPDATE)
│   │   │   └── ... (your existing services)
│   │   │
│   │   ├── 📁 tests/                  ⭐ NEW FOLDER
│   │   │   ├── auth.security.test.ts  ⭐ NEW (50+ tests)
│   │   │   └── auth.integration.test.ts ⭐ NEW (integration tests)
│   │   │
│   │   ├── 📁 types/
│   │   │   ├── auth.types.ts          (Your existing - UPDATE)
│   │   │   └── ... (your existing types)
│   │   │
│   │   ├── 📁 schemas/                (Validation schemas)
│   │   │   ├── auth.schema.ts         (UPDATE: enhanced password schema)
│   │   │   └── ... (your existing schemas)
│   │   │
│   │   └── 📁 middleware/             (Route middleware)
│   │       ├── auth.ts                (Your existing)
│   │       └── ... (your other middleware)
│   │
│   ├── 📁 sellers/                    (Your existing seller layer)
│   │   ├── 📁 pages/
│   │   ├── 📁 components/
│   │   ├── 📁 stores/
│   │   └── ... (your existing structure)
│   │
│   └── 📁 shop/                       (Your existing shop layer)
│       ├── 📁 pages/
│       ├── 📁 components/
│       └── ... (your existing structure)
│
├── 📁 app/                            (Root app files)
│   ├── app.vue                        (Your root component)
│   ├── 📁 layouts/
│   │   ├── default.vue                (Your existing)
│   │   └── ... (your other layouts)
│   │
│   └── 📁 components/
│       ├── 📁 common/
│       └── ... (your existing components)
│
├── 📁 composables/                    (Global composables)
│   ├── useAuth.ts                     (Global auth composable)
│   └── ... (your existing global composables)
│
├── 📁 stores/                         (Global Pinia stores)
│   ├── auth.store.ts                  (Global auth store)
│   └── ... (your existing global stores)
│
├── 📁 types/                          (Global types)
│   ├── auth.ts                        (Auth types - UPDATE)
│   └── ... (your existing types)
│
├── 📁 public/                         (Static assets)
│   ├── favicon.ico
│   └── ... (your existing assets)
│
└── 📁 .github/                        (GitHub workflows)
    └── 📁 workflows/
        └── test.yml                   (UPDATE: add auth tests to CI/CD)
```

---

## 📊 Summary of Changes by Location

### ✅ Files You Need to CREATE (New)

```
server/
  ├── api/auth/
  │   ├── verify-email.post.ts
  │   ├── forgot-password.post.ts
  │   └── reset-password.post.ts
  │
  ├── middleware/
  │   ├── security.ts
  │   ├── csrf.ts
  │   └── rateLimiter.ts
  │
  └── utils/
      ├── auth/
      │   ├── rateLimiter.ts
      │   ├── passwordValidator.ts
      │   └── auditLog.ts
      │
      ├── security/
      │   ├── csrf.ts
      │   └── errors.ts
      │
      └── monitoring/
          └── authMonitoring.ts

layers/auth/
  ├── pages/
  │   ├── verify-email.vue
  │   ├── forgot-password.vue
  │   └── reset-password.vue
  │
  ├── components/
  │   └── PasswordStrengthMeter.vue
  │
  ├── composables/
  │   └── usePasswordReset.ts
  │
  └── tests/
      ├── auth.security.test.ts
      └── auth.integration.test.ts

prisma/
  └── migrations/
      └── [timestamp]_add_auth_security_tables/
          └── migration.sql
```

### ✏️ Files You Need to UPDATE (Modify)

```
prisma/
  └── schema.prisma          (Add 4 new models)

server/
  ├── api/auth/
  │   ├── login.post.ts      (Add security features)
  │   └── register.post.ts   (Add password validation)
  │
  ├── database/repositories/
  │   └── auth.repository.ts (Add new methods)
  │
  └── utils/auth/
      └── auth.schema.ts     (Add enhanced password schema)

layers/auth/
  ├── stores/
  │   └── auth.store.ts      (Update for new flows)
  │
  ├── services/
  │   └── auth.api.ts        (Update for new endpoints)
  │
  ├── pages/
  │   ├── user-login.vue     (Minor updates for UX)
  │   └── user-register.vue  (Show password strength)
  │
  └── types/
      └── auth.types.ts      (Add new types)

.env                         (Add new env vars)

.github/workflows/
  └── test.yml              (Add auth tests to CI/CD)
```

### ℹ️ Files You DON'T Need to Change

```
app.vue
app/layouts/
app/components/
layers/sellers/
layers/shop/
nuxt.config.ts (mostly - might add middleware)
Other unrelated files...
```

---

## 🗄️ Database Schema Changes

### BEFORE (Your existing tables)
```sql
users                    (via Supabase Auth)
profiles
seller_profiles
stores
products
orders
order_items
... (your other tables)
```

### AFTER (Add these 4 tables)
```sql
-- New Security Tables
audit_logs               ⭐ NEW - Track all auth events
failed_login_attempts    ⭐ NEW - Rate limiting counter
email_verification_tokens ⭐ NEW - Email verification tokens
password_reset_tokens    ⭐ NEW - Password reset tokens

-- Plus your existing tables
users
profiles
seller_profiles
stores
products
orders
order_items
... (your other tables)
```

---

## 📦 File Copy Destinations

When you run `bash phase1-complete.sh`, files go to:

```
From phase1-complete.sh:           To your project:

server_utils_rateLimiter.ts         → server/utils/auth/rateLimiter.ts
server_utils_passwordValidator.ts   → server/utils/auth/passwordValidator.ts
server_utils_csrf.ts                → server/utils/security/csrf.ts
server_utils_errors.ts              → server/utils/security/errors.ts
server_utils_auditLog.ts            → server/utils/auth/auditLog.ts
server_utils_monitoring_auth...ts   → server/utils/monitoring/authMonitoring.ts

server_api_auth_login_improved.ts   → server/api/auth/login.post.ts
server_api_auth_register_complete.ts → server/api/auth/register.post.ts
server_api_auth_forgot_password.ts  → server/api/auth/forgot-password.post.ts
server_api_auth_reset_password.ts   → server/api/auth/reset-password.post.ts

auth_security_edge_cases_test.ts    → layers/auth/tests/auth.security.test.ts
auth_integration_tests_complete.ts  → layers/auth/tests/auth.integration.test.ts
```

---

## 🔄 Data Flow in Your Project

### Login Flow (Example)
```
layers/auth/pages/user-login.vue
    ↓ (user submits form)
layers/auth/composables/useAuth.ts
    ↓ (calls store)
layers/auth/stores/auth.store.ts
    ↓ (calls API)
layers/auth/services/auth.api.ts
    ↓ (validates & posts to)
server/api/auth/login.post.ts
    ├─ server/utils/security/csrf.ts      (validate token)
    ├─ server/utils/auth/rateLimiter.ts   (check rate limit)
    ├─ server/utils/security/errors.ts    (handle errors)
    ├─ server/utils/auth/auditLog.ts      (log event)
    └─ server/database/repositories/      (fetch user)
    ↓ (returns response)
layers/auth/services/auth.api.ts         (validates response)
    ↓
layers/auth/stores/auth.store.ts         (stores user data)
    ↓
app/app.vue                              (user sees dashboard)
```

---

## 🔐 Security Files You're Adding

### By Purpose:

**Rate Limiting & Brute Force Protection**
- server/utils/auth/rateLimiter.ts ← 5 attempts = 30 min lockout
- server/middleware/rateLimiter.ts ← Applies to endpoints

**Password Security**
- server/utils/auth/passwordValidator.ts ← 12+ chars, complexity
- layers/auth/components/PasswordStrengthMeter.vue ← Visual indicator

**CSRF Protection**
- server/utils/security/csrf.ts ← Token generation & validation
- server/middleware/csrf.ts ← Applied to all forms

**Error Handling**
- server/utils/security/errors.ts ← Masked error messages
- Prevents email enumeration attacks

**Audit Logging**
- server/utils/auth/auditLog.ts ← All events tracked
- Logs to AuditLog table

**Monitoring**
- server/utils/monitoring/authMonitoring.ts ← Metrics & alerts
- server/plugins/monitoring.ts ← Starts on boot

---

## 📋 Environment Variables You'll Add

```env
# Email Verification
REQUIRE_EMAIL_VERIFICATION=true

# Rate Limiting
RATE_LIMIT_LOGIN_ATTEMPTS=5
RATE_LIMIT_LOGIN_WINDOW_MS=900000
RATE_LIMIT_LOGIN_LOCKOUT_MS=1800000

# Password Policy
ENHANCED_PASSWORD_SCHEMA=true

# Email Service
EMAIL_SERVICE_PROVIDER=sendgrid
SENDGRID_API_KEY=your_key_here
SENDER_EMAIL=noreply@reelcart.app

# Monitoring & Alerts
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR_WEBHOOK
DATADOG_API_KEY=your_datadog_key (optional)
PAGERDUTY_INTEGRATION_KEY=your_key (optional)
```

---

## 🧪 Test Files Organization

```
layers/auth/tests/
├── auth.security.test.ts          (50+ unit tests)
│   ├── Rate limiting tests
│   ├── Password validation tests
│   ├── CSRF protection tests
│   ├── Error handling tests
│   ├── Authorization tests
│   └── XSS prevention tests
│
└── auth.integration.test.ts       (30+ integration tests)
    ├── Login flow
    ├── Register flow
    ├── Email verification flow
    ├── Password reset flow
    └── Full workflows
```

---

## 🚀 Implementation Checklist

### Step 1: Copy Files
```bash
bash phase1-complete.sh
# Creates all new files and directories
```

### Step 2: Update prisma/schema.prisma
```prisma
// Add these 4 models
model AuditLog { ... }
model FailedLoginAttempt { ... }
model EmailVerificationToken { ... }
model PasswordResetToken { ... }
```

### Step 3: Run Migration
```bash
npx prisma migrate dev --name add_auth_security_tables
```

### Step 4: Update .env
```bash
# Add all the new environment variables
```

### Step 5: Update imports in existing files
- layers/auth/stores/auth.store.ts → import useAuthApi
- layers/auth/services/auth.api.ts → update endpoints
- server/database/repositories/auth.repository.ts → new methods

### Step 6: Run Tests
```bash
npm run test:auth
```

### Step 7: Manual Testing
```bash
npm run dev
# Test login, register, password reset, rate limiting
```

### Step 8: Deploy
```bash
npm run build
npm run deploy:staging
```

---

## 📊 File Count Summary

```
Total New Files:     16
Total Updated Files: 11
Total Files in Project (est): 180+

Code Added:     ~6,500 lines
Tests Added:    80+ test cases
Documentation:  10+ guides
Database Models: 4 new tables
API Endpoints:   4 new endpoints
Utilities:       6 new utilities
Middleware:      3 new middleware
```

---

## 🎯 Directory Structure Quick Reference

```
reelcart-app/
│
├── Root files       (.env, nuxt.config.ts, package.json, etc.)
│
├── prisma/          ← Database schema + migrations
│   └── migrations/  ← Add new migration here
│
├── server/          ← Backend code (THE SECURITY LAYER)
│   ├── api/         ← API routes
│   ├── middleware/  ← Server middleware (NEW: security, csrf, rate limiting)
│   ├── utils/       ← Utilities (NEW: auth, security, monitoring folders)
│   ├── database/    ← Database access
│   └── plugins/     ← Server plugins (NEW: monitoring)
│
├── layers/          ← Feature layers
│   └── auth/        ← Auth layer
│       ├── pages/   ← Vue pages (NEW: verify-email, forgot-password, reset-password)
│       ├── components/ ← Vue components (NEW: PasswordStrengthMeter)
│       ├── composables/ ← Vue composables (NEW: usePasswordReset)
│       ├── stores/  ← Pinia stores (UPDATE: auth.store.ts)
│       ├── services/ ← API services (UPDATE: auth.api.ts)
│       ├── tests/   ← Tests (NEW: security & integration tests)
│       └── types/   ← TypeScript types (UPDATE: auth.types.ts)
│
├── app/             ← Root app files
│
├── composables/     ← Global composables
│
├── stores/          ← Global stores
│
├── types/           ← Global types
│
└── public/          ← Static assets
```

---

## ✨ Visual: Where Security Lives

```
User Login
    ↓
Frontend (Vue Component)
    ↓
Composable → Store → API Client
    ↓
API Request to server/api/auth/login.post.ts
    ├─────────────────────────────────────────────────────
    │ SECURITY HAPPENS HERE ↓
    │
    │ 1. CSRF Validation
    │    ↓ server/utils/security/csrf.ts
    │
    │ 2. Rate Limiting
    │    ↓ server/utils/auth/rateLimiter.ts
    │
    │ 3. Input Validation
    │    ↓ Zod schemas
    │
    │ 4. Supabase Auth
    │    ↓ Verify password
    │
    │ 5. Email Verification Check
    │    ↓ Prisma query
    │
    │ 6. Profile Lookup/Create
    │    ↓ server/database/repositories/auth.repository.ts
    │
    │ 7. Error Handling
    │    ↓ server/utils/security/errors.ts (mask sensitive info)
    │
    │ 8. Audit Logging
    │    ↓ server/utils/auth/auditLog.ts (log to database)
    │
    │ 9. Sanitize Response
    │    ↓ Zod schema validation
    │
    │ 10. Monitoring
    │     ↓ server/utils/monitoring/authMonitoring.ts
    │
    ├─────────────────────────────────────────────────────
    ↓
Return safe response with user data
    ↓
Store in Pinia (layers/auth/stores/auth.store.ts)
    ↓
Navigate to dashboard
```

---

## 🎉 You're All Set!

This is your complete project structure. Everything is organized and ready to go.

**Start with:** `bash phase1-complete.sh` to copy all files to the right places.

The tree above shows exactly where everything goes! 🚀
