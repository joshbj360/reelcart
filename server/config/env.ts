// FILE PATH: server/config/env.ts

/**
 * Environment Variable Validation
 * Validates all required env vars on startup
 * Fails fast if anything is missing
 */

interface RequiredEnvVar {
  name: string
  required: boolean
  default?: string
  description: string
}

const requiredVars: RequiredEnvVar[] = [
  // Database
  {
    name: 'DATABASE_URL',
    required: true,
    description: 'PostgreSQL connection string'
  },

  // JWT Secrets
  {
    name: 'JWT_SECRET',
    required: true,
    description: 'Secret key for signing JWT access tokens (min 32 chars)'
  },
  {
    name: 'JWT_REFRESH_SECRET',
    required: true,
    description: 'Secret key for signing JWT refresh tokens (min 32 chars)'
  },

  // Environment
  {
    name: 'NODE_ENV',
    required: false,
    default: 'development',
    description: 'Node environment (development, staging, production)'
  },

  // App URL
  {
    name: 'APP_URL',
    required: false,
    default: 'http://localhost:3000',
    description: 'Application base URL for email links'
  },

  // Rate Limiting - Register
  {
    name: 'RATE_LIMIT_REGISTER_MAX',
    required: false,
    default: '3',
    description: 'Max registration attempts'
  },
  {
    name: 'RATE_LIMIT_REGISTER_WINDOW',
    required: false,
    default: '3600000',
    description: 'Registration rate limit window (ms)'
  },

  // Rate Limiting - Login
  {
    name: 'RATE_LIMIT_LOGIN_MAX',
    required: false,
    default: '5',
    description: 'Max login attempts'
  },
  {
    name: 'RATE_LIMIT_LOGIN_WINDOW',
    required: false,
    default: '900000',
    description: 'Login rate limit window (ms)'
  },

  // Rate Limiting - Forgot Password
  {
    name: 'RATE_LIMIT_FORGOT_PASSWORD_MAX',
    required: false,
    default: '3',
    description: 'Max forgot password attempts'
  },
  {
    name: 'RATE_LIMIT_FORGOT_PASSWORD_WINDOW',
    required: false,
    default: '3600000',
    description: 'Forgot password rate limit window (ms)'
  },

  // Rate Limiting - Verify Email Send
  {
    name: 'RATE_LIMIT_VERIFY_EMAIL_SEND_MAX',
    required: false,
    default: '5',
    description: 'Max verify email send attempts'
  },
  {
    name: 'RATE_LIMIT_VERIFY_EMAIL_SEND_WINDOW',
    required: false,
    default: '900000',
    description: 'Verify email send rate limit window (ms)'
  },

  // Rate Limiting - Verify Email Token
  {
    name: 'RATE_LIMIT_VERIFY_EMAIL_TOKEN_MAX',
    required: false,
    default: '5',
    description: 'Max verify email token attempts'
  },
  {
    name: 'RATE_LIMIT_VERIFY_EMAIL_TOKEN_WINDOW',
    required: false,
    default: '900000',
    description: 'Verify email token rate limit window (ms)'
  },

  // Rate Limiting - Refresh Token
  {
    name: 'RATE_LIMIT_REFRESH_TOKEN_MAX',
    required: false,
    default: '10',
    description: 'Max refresh token attempts'
  },
  {
    name: 'RATE_LIMIT_REFRESH_TOKEN_WINDOW',
    required: false,
    default: '300000',
    description: 'Refresh token rate limit window (ms)'
  }
]

/**
 * Validate environment variables
 * Call this in your app startup
 */
export function validateEnvironment(): void {
  const missing: string[] = []
  const warnings: string[] = []

  console.log('🔍 Validating environment variables...')

  for (const envVar of requiredVars) {
    const value = process.env[envVar.name]

    if (!value && envVar.required) {
      missing.push(`  ❌ ${envVar.name}: ${envVar.description}`)
    } else if (!value && envVar.default) {
      console.log(`  ⚠️  ${envVar.name}: Using default value`)
      process.env[envVar.name] = envVar.default
    } else if (value) {
      console.log(`  ✅ ${envVar.name}`)
    }
  }

  if (missing.length > 0) {
    console.error('\n❌ Missing required environment variables:')
    missing.forEach(m => console.error(m))
    console.error('\n📝 See .env.example for the required format.')
    process.exit(1)
  }

  // Validate JWT secrets are strong enough
  const jwtSecret = process.env.JWT_SECRET
  const refreshSecret = process.env.JWT_REFRESH_SECRET

  if (jwtSecret && jwtSecret.length < 32) {
    warnings.push('JWT_SECRET is less than 32 characters. Consider using a stronger secret.')
  }
  if (refreshSecret && refreshSecret.length < 32) {
    warnings.push('JWT_REFRESH_SECRET is less than 32 characters. Consider using a stronger secret.')
  }

  if (process.env.NODE_ENV === 'production') {
    if (jwtSecret === 'your-super-secret-jwt-key-min-32-chars-change-in-production') {
      console.error('❌ SECURITY ERROR: Using default JWT_SECRET in production!')
      process.exit(1)
    }
    if (refreshSecret === 'your-super-secret-refresh-key-min-32-chars-change-in-production') {
      console.error('❌ SECURITY ERROR: Using default JWT_REFRESH_SECRET in production!')
      process.exit(1)
    }
  }

  if (warnings.length > 0) {
    console.warn('\n⚠️  Warnings:')
    warnings.forEach(w => console.warn(`  ${w}`))
  }

  console.log('\n✅ Environment validation passed!\n')
}

/**
 * Get required environment variable or throw
 */
export function getRequiredEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

/**
 * Get optional environment variable with default
 */
export function getOptionalEnv(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue
}