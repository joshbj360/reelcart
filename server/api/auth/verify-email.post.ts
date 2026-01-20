import { authRepository } from '../../database/repositories/auth.repository'
import { logAuditEvent, AuditEventType } from '../../utils/auth/auditLog'
import { prisma } from '../../utils/db'
import { serverSupabaseClient } from '#supabase/server'

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