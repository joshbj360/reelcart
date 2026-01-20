# 📁 Quick Visual Project Tree

## Simplified Structure - What You Need to Know

```
reelcart-app/                          Your ReelCart app
│
├─ .env                                ✏️ UPDATE: Add security env vars
├─ .env.example
├─ nuxt.config.ts                      Your config
├─ package.json
├─ tsconfig.json
├─ README.md
│
├─ 📁 prisma/
│  ├─ schema.prisma                    ✏️ UPDATE: Add 4 new security models
│  ├─ migrations/
│  │  ├─ [existing migrations]
│  │  └─ ⭐ [NEW] add_auth_security_tables/
│  └─ seed.ts
│
├─ 📁 server/                          ⭐ SECURITY LAYER
│  ├─ 📁 api/auth/
│  │  ├─ login.post.ts                 ✏️ UPDATE (add security)
│  │  ├─ register.post.ts              ✏️ UPDATE (add password validation)
│  │  ├─ logout.post.ts                Your existing
│  │  ├─ ⭐ verify-email.post.ts       NEW
│  │  ├─ ⭐ forgot-password.post.ts    NEW
│  │  ├─ ⭐ reset-password.post.ts     NEW
│  │  ├─ profile.get.ts                Your existing
│  │  └─ refresh-token.post.ts         Your existing
│  │
│  ├─ 📁 middleware/
│  │  ├─ ⭐ security.ts                NEW (security headers)
│  │  ├─ ⭐ csrf.ts                    NEW (CSRF validation)
│  │  ├─ ⭐ rateLimiter.ts             NEW (rate limiting)
│  │  └─ auth.ts                       Your existing
│  │
│  ├─ 📁 utils/
│  │  ├─ 📁 auth/                      ⭐ NEW FOLDER
│  │  │  ├─ ⭐ rateLimiter.ts          (5 attempts → 30 min lockout)
│  │  │  ├─ ⭐ passwordValidator.ts    (12+ chars, complexity, etc)
│  │  │  ├─ ⭐ auditLog.ts             (event tracking)
│  │  │  └─ auth.schema.ts             ✏️ UPDATE: enhanced schema
│  │  │
│  │  ├─ 📁 security/                  ⭐ NEW FOLDER
│  │  │  ├─ ⭐ csrf.ts                 (token generation/validation)
│  │  │  └─ ⭐ errors.ts               (masked error messages)
│  │  │
│  │  ├─ 📁 monitoring/                ⭐ NEW FOLDER
│  │  │  └─ ⭐ authMonitoring.ts       (metrics, alerts, Slack/DataDog)
│  │  │
│  │  ├─ 📁 db/
│  │  │  └─ (Your existing DB utils)
│  │  │
│  │  └─ 📁 email/
│  │     └─ (Your existing email utils)
│  │
│  ├─ 📁 database/repositories/
│  │  ├─ ✏️ auth.repository.ts         UPDATE: new methods
│  │  ├─ profile.repository.ts
│  │  └─ (Your other repos)
│  │
│  ├─ 📁 plugins/
│  │  ├─ ⭐ monitoring.ts              NEW (start monitoring)
│  │  └─ (Your existing plugins)
│  │
│  └─ 📁 types/
│     ├─ ✏️ auth.types.ts              UPDATE: new types
│     └─ (Your existing types)
│
├─ 📁 layers/auth/
│  ├─ 📁 pages/
│  │  ├─ user-login.vue                Your existing
│  │  ├─ user-register.vue             Your existing
│  │  ├─ ⭐ verify-email.vue           NEW (verify tokens)
│  │  ├─ ⭐ forgot-password.vue        NEW (request reset)
│  │  └─ ⭐ reset-password.vue         NEW (complete reset)
│  │
│  ├─ 📁 components/
│  │  ├─ LoginForm.vue                 Your existing
│  │  ├─ RegisterForm.vue              Your existing
│  │  ├─ ⭐ PasswordStrengthMeter.vue  NEW (strength indicator)
│  │  └─ (Your other components)
│  │
│  ├─ 📁 stores/
│  │  └─ ✏️ auth.store.ts              UPDATE (new flows)
│  │
│  ├─ 📁 composables/
│  │  ├─ ✏️ useAuth.ts                 UPDATE (new functions)
│  │  ├─ useLogin.ts                   Your existing
│  │  ├─ useRegister.ts                Your existing
│  │  └─ ⭐ usePasswordReset.ts        NEW (reset flow)
│  │
│  ├─ 📁 services/
│  │  ├─ ✏️ auth.api.ts                UPDATE (new endpoints)
│  │  └─ (Your existing services)
│  │
│  ├─ 📁 tests/                        ⭐ NEW FOLDER
│  │  ├─ ⭐ auth.security.test.ts      (50+ unit tests)
│  │  └─ ⭐ auth.integration.test.ts   (30+ integration tests)
│  │
│  ├─ 📁 types/
│  │  ├─ ✏️ auth.types.ts              UPDATE: new types
│  │  └─ (Your existing types)
│  │
│  ├─ 📁 schemas/
│  │  ├─ ✏️ auth.schema.ts             UPDATE: enhanced password
│  │  └─ (Your existing schemas)
│  │
│  └─ 📁 middleware/
│     ├─ auth.ts                       Your existing
│     └─ (Your other middleware)
│
├─ 📁 layers/sellers/                  Your existing
│  └─ (No changes needed)
│
├─ 📁 layers/shop/                     Your existing
│  └─ (No changes needed)
│
├─ 📁 app/
│  ├─ app.vue                          Your root component
│  ├─ 📁 layouts/
│  │  └─ (Your existing layouts)
│  └─ 📁 components/
│     └─ (Your existing components)
│
├─ 📁 composables/                     Your existing globals
│
├─ 📁 stores/                          Your existing globals
│
├─ 📁 types/                           Your existing globals
│
├─ 📁 public/                          Your assets
│
└─ 📁 .github/workflows/
   └─ ✏️ test.yml                      UPDATE: add auth tests
```

---

## 🎯 Key Symbol Meanings

```
⭐ NEW       = File created by security implementation
✏️  UPDATE   = File modified from your existing code
         = File remains unchanged
```

---

## 📦 What Gets Created (16 New Files)

```
server/
  └─ api/auth/                    (3 new endpoints)
     ├─ verify-email.post.ts      ⭐
     ├─ forgot-password.post.ts   ⭐
     └─ reset-password.post.ts    ⭐

  └─ middleware/                  (3 new middleware)
     ├─ security.ts               ⭐
     ├─ csrf.ts                   ⭐
     └─ rateLimiter.ts            ⭐

  └─ utils/auth/                  (3 new utilities)
     ├─ rateLimiter.ts            ⭐
     ├─ passwordValidator.ts      ⭐
     └─ auditLog.ts               ⭐

  └─ utils/security/              (2 new utilities)
     ├─ csrf.ts                   ⭐
     └─ errors.ts                 ⭐

  └─ utils/monitoring/            (1 new utility)
     └─ authMonitoring.ts         ⭐

  └─ plugins/
     └─ monitoring.ts             ⭐

layers/auth/
  └─ pages/                       (3 new pages)
     ├─ verify-email.vue          ⭐
     ├─ forgot-password.vue       ⭐
     └─ reset-password.vue        ⭐

  └─ components/
     └─ PasswordStrengthMeter.vue ⭐

  └─ composables/
     └─ usePasswordReset.ts       ⭐

  └─ tests/                       (2 new test suites)
     ├─ auth.security.test.ts     ⭐
     └─ auth.integration.test.ts  ⭐

prisma/
  └─ migrations/
     └─ [timestamp]_add_auth_security_tables/ ⭐
```

---

## ✏️ What Gets Updated (11 Files)

```
.env                                    Add environment variables
prisma/schema.prisma                    Add 4 security tables
server/api/auth/login.post.ts           Add security features
server/api/auth/register.post.ts        Add password validation
server/utils/auth/auth.schema.ts        Enhanced password schema
server/database/repositories/auth.repository.ts  New methods
layers/auth/stores/auth.store.ts        Update for new flows
layers/auth/composables/useAuth.ts      New functions
layers/auth/services/auth.api.ts        New endpoints
layers/auth/pages/user-register.vue     Show password strength
layers/auth/types/auth.types.ts         New types
```

---

## 🗄️ Database Schema Changes

### New Tables (4)

```
audit_logs
├─ id (UUID, Primary Key)
├─ event_type (String: LOGIN_SUCCESS, LOGIN_FAILED, REGISTER, etc)
├─ user_id (UUID, Foreign Key to users)
├─ email (String)
├─ ip_address (String)
├─ user_agent (String)
├─ success (Boolean)
├─ reason (String, nullable)
├─ metadata (JSON, nullable)
└─ created_at (Timestamp)
   Indexes: user_id, email, created_at, event_type

failed_login_attempts
├─ id (UUID, Primary Key)
├─ email (String, Unique)
├─ ip_address (String)
├─ user_agent (String)
├─ attempt_count (Integer)
├─ locked_until (Timestamp, nullable)
└─ last_attempt_at (Timestamp)
   Indexes: ip_address

email_verification_tokens
├─ id (UUID, Primary Key)
├─ user_id (UUID, Foreign Key)
├─ token (String, Unique)
├─ expires_at (Timestamp)
├─ used_at (Timestamp, nullable)
└─ created_at (Timestamp)

password_reset_tokens
├─ id (UUID, Primary Key)
├─ user_id (UUID, Foreign Key)
├─ token (String, Unique)
├─ expires_at (Timestamp)
├─ used_at (Timestamp, nullable)
└─ created_at (Timestamp)
```

### Existing Tables (No Changes)
```
users              (Supabase managed)
profiles           (Your existing)
seller_profiles    (Your existing)
stores             (Your existing)
products           (Your existing)
orders             (Your existing)
order_items        (Your existing)
... (all your other tables unchanged)
```

---

## 🔄 Data Flow Example

### Login Journey

```
Step 1: User → Login Page
        layers/auth/pages/user-login.vue

Step 2: Submit Form
        ↓
        layers/auth/composables/useAuth.ts (handleLogin)

Step 3: Call Store
        ↓
        layers/auth/stores/auth.store.ts (login action)

Step 4: Call API
        ↓
        layers/auth/services/auth.api.ts (login method)

Step 5: Send POST Request
        ↓
        server/api/auth/login.post.ts
        
        ├─ server/utils/security/csrf.ts        (validate token)
        ├─ server/utils/auth/rateLimiter.ts     (check limit)
        ├─ Zod validation                        (validate input)
        ├─ Supabase auth                        (verify password)
        ├─ Prisma query                         (get/create profile)
        ├─ server/utils/security/errors.ts      (handle errors)
        ├─ server/utils/auth/auditLog.ts        (log event)
        └─ Zod sanitization                     (remove sensitive fields)

Step 6: Return Response
        ↓
        layers/auth/services/auth.api.ts        (validate response)

Step 7: Update State
        ↓
        layers/auth/stores/auth.store.ts        (save user)

Step 8: Navigate
        ↓
        layers/auth/composables/useAuth.ts      (router.push)

Step 9: Dashboard
        ↓
        User sees dashboard ✅
```

---

## 📊 Statistics

```
New Files Created:        16
Files Updated:            11
Total Lines of Code:      ~6,500
Test Cases Added:         80+
Database Tables Added:    4
API Endpoints Added:      4
Middleware Added:         3
Utilities Added:          6
Documentation Pages:      10+
```

---

## ✅ Implementation Order

```
1. Copy all files        → bash phase1-complete.sh

2. Update schema         → Add 4 models to prisma/schema.prisma

3. Run migration         → npx prisma migrate dev

4. Configure .env        → Add environment variables

5. Update existing files → Imports and new functions

6. Run tests             → npm run test:auth

7. Manual test           → npm run dev

8. Deploy                → npm run build && npm run deploy:staging
```

---

## 🎯 Directory Reference Quick Lookup

| Need | Location |
|------|----------|
| Rate limiting logic | server/utils/auth/rateLimiter.ts |
| Password rules | server/utils/auth/passwordValidator.ts |
| CSRF tokens | server/utils/security/csrf.ts |
| Error messages | server/utils/security/errors.ts |
| Audit trail | server/utils/auth/auditLog.ts |
| Monitoring | server/utils/monitoring/authMonitoring.ts |
| Login endpoint | server/api/auth/login.post.ts |
| Register endpoint | server/api/auth/register.post.ts |
| Forgot password | server/api/auth/forgot-password.post.ts |
| Reset password | server/api/auth/reset-password.post.ts |
| Auth store | layers/auth/stores/auth.store.ts |
| Auth API | layers/auth/services/auth.api.ts |
| Login tests | layers/auth/tests/ |
| Database | prisma/schema.prisma |
| .env vars | .env (in root) |

---

## 🚀 Ready to Start?

1. Download all files from `/outputs/`
2. Read `LOGIN_FLOW_COMPLETE_WALKTHROUGH.md` to understand the flow
3. Read `PROJECT_STRUCTURE_TREE.md` (this file) to see the organization
4. Run `bash phase1-complete.sh` to copy files
5. Follow `PHASE1_COMPLETION_QUICK_START.md` for step-by-step setup

You're all set! 🎉
