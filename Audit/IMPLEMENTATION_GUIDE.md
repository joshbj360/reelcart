# Production Auth Implementation Guide

## 🚀 Quick Start - Phase 1 (This Sprint)

### Step 1: Add Database Tables (Prisma Migration)

```prisma
// prisma/schema.prisma

model AuditLog {
  id                String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  event_type        String   // LOGIN_SUCCESS, LOGIN_FAILED, etc.
  user_id           String?  @db.Uuid
  email             String?
  ip_address        String?
  user_agent        String?
  success           Boolean
  reason            String?
  metadata          Json?
  created_at        DateTime @default(now()) @db.Timestamptz(6)

  @@index([user_id])
  @@index([email])
  @@index([created_at])
  @@index([event_type])
}

model FailedLoginAttempt {
  id                String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  email             String
  ip_address        String?
  user_agent        String?
  attempt_count     Int      @default(1)
  locked_until      DateTime?
  last_attempt_at   DateTime @default(now()) @db.Timestamptz(6)

  @@unique([email])
  @@index([ip_address])
}

model EmailVerificationToken {
  id                String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  user_id           String   @db.Uuid
  token             String   @unique
  expires_at        DateTime
  used_at           DateTime?
  created_at        DateTime @default(now()) @db.Timestamptz(6)
}

model PasswordResetToken {
  id                String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  user_id           String   @db.Uuid
  token             String   @unique
  expires_at        DateTime
  used_at           DateTime?
  created_at        DateTime @default(now()) @db.Timestamptz(6)
}
```

Then run:
```bash
npx prisma migrate dev --name add_auth_security_tables
```

### Step 2: Update Password Schema

In `server/utils/auth/auth.schema.ts`:

```typescript
import { enhancedPasswordSchema } from './passwordValidator'

export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: enhancedPasswordSchema,
  username: z.string().min(3).max(50).optional(),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password required'),
})
```

### Step 3: Create Middleware

Create `server/middleware/security.ts`:

```typescript
import { csrfProtectionMiddleware } from '../utils/security/csrf'
import { defineEventHandler } from 'h3'

export default defineEventHandler((event) => {
  // Apply CSRF protection to state-changing requests
  csrfProtectionMiddleware(event)

  // Add security headers
  setResponseHeader(event, 'X-Content-Type-Options', 'nosniff')
  setResponseHeader(event, 'X-Frame-Options', 'DENY')
  setResponseHeader(event, 'X-XSS-Protection', '1; mode=block')
  
  // Add CORS headers if needed
  if (process.env.NODE_ENV === 'production') {
    setResponseHeader(event, 'Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }
})
```

### Step 4: Update Login Endpoint

Replace `server/api/auth/login.post.ts` with the improved version provided (see `server_api_auth_login_improved.post.ts`).

### Step 5: Update Register Endpoint

Create improved `server/api/auth/register.post.ts`:

```typescript
import { serverSupabaseClient } from '#supabase/server'
import { registerSchema } from '../../utils/auth/auth.schema'
import { authRepository } from '../../database/repositories/auth.repository'
import { validateCsrfToken } from '../../utils/security/csrf'
import { checkRateLimit, rateLimitConfig } from '../../utils/auth/rateLimiter'
import { logAuditEvent, AuditEventType } from '../../utils/auth/auditLog'
import { throwAuthError, AuthErrorCode, getClientIp, getUserAgent } from '../../utils/security/errors'
import { validatePasswordStrength } from '../../utils/auth/passwordValidator'

export default defineEventHandler(async (event) => {
  const ipAddress = getClientIp(event.node.req)
  const userAgent = getUserAgent(event.node.req)

  try {
    // CSRF Protection
    validateCsrfToken(event)

    // Rate limiting
    checkRateLimit(ipAddress, rateLimitConfig.register)

    // Validate body
    const body = await readBody(event)
    const validation = registerSchema.safeParse(body)

    if (!validation.success) {
      throw createError({
        statusCode: 400,
        message: validation.error.errors[0].message,
      })
    }

    const { email, password, username } = validation.data

    // Password strength validation
    const passwordCheck = validatePasswordStrength(password, email)
    if (!passwordCheck.valid) {
      throw createError({
        statusCode: 400,
        message: passwordCheck.errors.join(', '),
      })
    }

    // Check if email already exists
    const existing = await authRepository.findByEmail(email)
    if (existing) {
      await logAuditEvent({
        eventType: AuditEventType.REGISTER_FAILED,
        email,
        ipAddress,
        userAgent,
        success: false,
        reason: 'Email already exists',
      })

      // Don't reveal if email exists
      throw createError({
        statusCode: 400,
        message: 'Invalid request',
      })
    }

    // Register with Supabase
    const client = await serverSupabaseClient(event)
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: { username: username || email.split('@')[0] },
        emailRedirectTo: `${getRequestURL(event).origin}/auth/verify-email`,
      },
    })

    if (error) {
      throw createError({
        statusCode: 400,
        message: 'Registration failed. Please try again.',
      })
    }

    // Create profile
    await authRepository.createProfile({
      id: data.user!.id,
      email,
      username: username || email.split('@')[0],
    })

    // Log successful registration
    await logAuditEvent({
      eventType: AuditEventType.REGISTER_SUCCESS,
      userId: data.user!.id,
      email,
      ipAddress,
      userAgent,
      success: true,
    })

    return {
      success: true,
      message: 'Registration successful. Please verify your email.',
      user: { id: data.user!.id, email },
    }
  } catch (error: any) {
    if (error.statusCode && error.statusCode < 500) {
      throw error
    }

    console.error('Register error:', error)

    throw createError({
      statusCode: 500,
      message: 'An error occurred. Please try again later.',
    })
  }
})
```

### Step 6: Create Email Verification Endpoint

Create `server/api/auth/verify-email.post.ts`:

```typescript
import { authRepository } from '../../database/repositories/auth.repository'
import { logAuditEvent, AuditEventType } from '../../utils/auth/auditLog'
import { prisma } from '../../utils/db'
import crypto from 'crypto'

export default defineEventHandler(async (event) => {
  const { token } = await readBody(event)

  if (!token) {
    throw createError({ statusCode: 400, message: 'Token required' })
  }

  try {
    const verificationToken = await prisma.emailVerificationToken.findUnique({
      where: { token },
    })

    if (!verificationToken || new Date() > verificationToken.expires_at) {
      throw createError({
        statusCode: 400,
        message: 'Token expired or invalid',
      })
    }

    if (verificationToken.used_at) {
      throw createError({
        statusCode: 400,
        message: 'Token already used',
      })
    }

    // Mark as verified in Supabase
    const client = await serverSupabaseClient(event)
    const { error } = await client.auth.admin.updateUserById(verificationToken.user_id, {
      email_confirm: true,
    })

    if (error) throw error

    // Mark token as used
    await prisma.emailVerificationToken.update({
      where: { id: verificationToken.id },
      data: { used_at: new Date() },
    })

    // Log event
    await logAuditEvent({
      eventType: AuditEventType.EMAIL_VERIFIED,
      userId: verificationToken.user_id,
      success: true,
    })

    return { success: true, message: 'Email verified successfully' }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: 'Verification failed',
    })
  }
})
```

### Step 7: Create Forgot Password Endpoint

Create `server/api/auth/forgot-password.post.ts`:

```typescript
import { prisma } from '../../utils/db'
import { logAuditEvent, AuditEventType } from '../../utils/auth/auditLog'
import crypto from 'crypto'

export default defineEventHandler(async (event) => {
  const { email } = await readBody(event)

  if (!email) {
    throw createError({ statusCode: 400, message: 'Email required' })
  }

  try {
    // Check if user exists (but don't leak this info)
    const user = await prisma.profile.findUnique({
      where: { email },
    })

    if (user) {
      // Generate reset token
      const token = crypto.randomBytes(32).toString('hex')
      await prisma.passwordResetToken.create({
        data: {
          user_id: user.id,
          token,
          expires_at: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
        },
      })

      // Send email (integrate with your email service)
      await sendPasswordResetEmail(email, token)

      await logAuditEvent({
        eventType: AuditEventType.PASSWORD_RESET_REQUESTED,
        userId: user.id,
        email,
        success: true,
      })
    } else {
      await logAuditEvent({
        eventType: AuditEventType.PASSWORD_RESET_REQUESTED,
        email,
        success: false,
        reason: 'User not found',
      })
    }

    // Always return success (don't leak if email exists)
    return {
      success: true,
      message: 'If email exists, reset link sent',
    }
  } catch (error) {
    console.error('Forgot password error:', error)
    throw createError({ statusCode: 500, message: 'An error occurred' })
  }
})

async function sendPasswordResetEmail(email: string, token: string) {
  // Implement with your email service (SendGrid, AWS SES, etc.)
  const resetUrl = `${process.env.NUXT_PUBLIC_BASE_URL}/auth/reset-password?token=${token}`
  // Send email...
}
```

### Step 8: Add Tests

Copy the test file provided (`auth_security_edge_cases_test.ts`) to `layers/auth/tests/` and run:

```bash
npm run test:auth
```

---

## 📋 Environment Variables

Add to `.env`:

```env
# Security
REQUIRE_EMAIL_VERIFICATION=true
ENABLE_2FA=false (for Phase 2)

# Rate Limiting
RATE_LIMIT_LOGIN_ATTEMPTS=5
RATE_LIMIT_LOGIN_WINDOW_MS=900000
RATE_LIMIT_LOGIN_LOCKOUT_MS=1800000

# Logging
LOG_SERVICE_URL=https://your-logging-service.com
LOG_SERVICE_TOKEN=your-token

# Email
EMAIL_SERVICE_PROVIDER=sendgrid
SENDGRID_API_KEY=your-key

# Database
DATABASE_URL=postgresql://...
```

---

## 🧪 Testing Checklist

- [ ] Rate limiting works (test with 6+ login attempts)
- [ ] CSRF protection blocks requests without token
- [ ] Account lockout after failed attempts
- [ ] Email verification enforced
- [ ] Error messages don't leak info
- [ ] Audit logs capture all events
- [ ] Password validation enforces all rules
- [ ] XSS payloads are rejected
- [ ] SQL injection attempts blocked (Prisma)
- [ ] Session fixation prevented
- [ ] Rate limit clears on successful login
- [ ] Token expiration works
- [ ] Email reset flow complete

---

## 🚀 Phase 2 (Next Sprint)

- [ ] Implement 2FA/TOTP
- [ ] Session management system
- [ ] Token refresh rotation
- [ ] Device fingerprinting
- [ ] Concurrent session limits
- [ ] Security monitoring dashboard

---

## 🚀 Phase 3 (Next Quarter)

- [ ] AI-based anomaly detection
- [ ] Biometric login support
- [ ] Passwordless authentication
- [ ] Enterprise SSO (SAML/OIDC)
- [ ] Advanced threat detection

---

## 📞 Support

For implementation questions, security concerns, or bug reports:
1. Check AUTH_ANALYSIS.md for issue descriptions
2. Review test files for edge cases
3. Consult code comments for rationale
