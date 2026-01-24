// server/api/auth/register.post.ts (PROPERLY REFACTORED)
/**
 * User Registration Endpoint
 * 
 * Keeps ALL original infrastructure:
 * - Prisma database
 * - Audit logging
 * - Crypto tokens
 * - Zod validation
 * 
 * Adds: Resend email service
 */

import { defineEventHandler, readBody, createError } from 'h3'
import { prisma } from '../../utils/db'
import { logAuditEvent, AuditEventType } from '../../utils/auth/auditLog'
import { sendVerificationEmail } from '../../utils/email/emailService'
import { registerSchema } from '../../utils/auth/auth.schema'
import crypto from 'crypto'
import { serverSupabaseClient } from '#supabase/server'
import { authRepository } from '~~/server/database/repositories/auth.repository'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, password } = body

  try {
    // Validate input with Zod
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

    // Check if user already exists
   const existingUser = await authRepository.findByEmail(email)
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

    // Create user in Supabase
    const supabase = serverSupabaseClient(event)
    const { data: authData, error: authError } = await (await supabase).auth.signUp({
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

    // ✨ Generate verification token
    const token = crypto.randomBytes(32).toString('hex')
    
    // ✨ Store verification token in database
    await prisma.emailVerificationToken.create({
      data: {
        user_id: authData.user.id,
        token,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    })

    // ✨ RESEND: Send beautiful verification email
    try {
      await sendVerificationEmail(email, token)
      console.log(`✅ Verification email sent to ${email}`)
    } catch (emailError: any) {
      console.error('Failed to send verification email:', emailError)
      // Log but don't fail - user can resend
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

    // Log successful registration
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

    // Log error
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