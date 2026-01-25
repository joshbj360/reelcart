// server/api/auth/register.post.ts
/**
 * User Registration Endpoint
 * 
 * Flow:
 * 1. Validate input with Zod
 * 2. Check if email already exists
 * 3. Create user in Supabase
 * 4. Create email verification token
 * 5. Send verification email via Resend
 * 6. Log audit event
 */

import { defineEventHandler, readBody, createError } from 'h3'
import { prisma } from '../../utils/db'
import { logAuditEvent, AuditEventType } from '../../utils/auth/auditLog'
import { sendVerificationEmail } from '../../utils/email/emailService'
import { registerSchema } from '../../utils/auth/auth.schema'
import crypto from 'crypto'
import { serverSupabaseClient } from '#supabase/server'
import { authRepository } from '~~/server/database/repositories/auth.repository'
import type { H3Event } from 'h3'
import { userRepository } from '~~/server/database/repositories/user.repository'

export default defineEventHandler(async (event: H3Event) => {
  const body = await readBody(event)
  const { email, password } = body

  try {
    // 1. Validate input with Zod
    const result = registerSchema.safeParse({ email, password })
    if (!result.success) {
      await logAuditEvent({
        eventType: AuditEventType.REGISTER_FAILED,
        email,
        success: false,
        reason: 'Validation failed',
      })

      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid email or password format',
      })
    }

    // 2. Check if user already exists
    const existingUser = await userRepository.findByEmail(email)
    if (existingUser) {
      await logAuditEvent({
        eventType: AuditEventType.REGISTER_FAILED,
        email,
        success: false,
        reason: 'Email already exists',
      })

      throw createError({
        statusCode: 409,
        statusMessage: 'Email already registered',
      })
    }

    // 3. Create user in Supabase
    const supabase = await serverSupabaseClient(event)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      await logAuditEvent({
        eventType: AuditEventType.REGISTER_FAILED,
        email,
        success: false,
        reason: `Supabase error: ${authError.message}`,
      })

      throw createError({
        statusCode: 400,
        statusMessage: authError.message || 'Failed to create account',
      })
    }

    if (!authData.user?.id) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create user account',
      })
    }

    // 4. Generate email verification token
    const token = crypto.randomBytes(32).toString('hex')
    
    await prisma.emailVerificationToken.create({
      data: {
        user_id: authData.user.id,
        token,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    })

    // 5. Send verification email
    try {
      await sendVerificationEmail(email, token)
      console.log(`✅ Verification email sent to ${email}`)
    } catch (emailError: any) {
      console.error('Failed to send verification email:', emailError)
      
      await logAuditEvent({
        eventType: AuditEventType.REGISTER_SUCCESS_EMAIL_VERIFICATION_FAILED,
        userId: authData.user.id,
        email,
        success: true,
        reason: 'User created but verification email failed to send',
      })
      
      return {
        success: true,
        message: 'Account created! Email verification failed but you can resend it.',
        user: {
          id: authData.user.id,
          email: authData.user.email,
        },
      }
    }

    // 6. Log successful registration
    await logAuditEvent({
      eventType: AuditEventType.REGISTER_SUCCESS_EMAIL_VERIFICATION_SENT,
      userId: authData.user.id,
      email,
      success: true,
    })

    return {
      success: true,
      message: 'Registration successful! Check your email to verify your account.',
      user: {
        id: authData.user.id,
        email: authData.user.email,
      },
    }
  } catch (error: any) {
    console.error('Registration error:', error)

    await logAuditEvent({
      eventType: AuditEventType.REGISTER_FAILED_EMAIL_VERIFICATION_FAILED,
      email: body.email,
      success: false,
      reason: error.message,
    })

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Registration failed',
    })
  }
})