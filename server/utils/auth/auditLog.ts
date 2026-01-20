// server/utils/auth/auditLog.ts
/**
 * Audit logging for security events
 * Tracks all auth-related activities for compliance and incident response
 */

import { prisma } from '../db'

export enum AuditEventType {
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGIN_FAILED_RATE_LIMITED = 'LOGIN_FAILED_RATE_LIMITED',
  REGISTER_SUCCESS = 'REGISTER_SUCCESS',
  REGISTER_FAILED = 'REGISTER_FAILED',
  LOGOUT = 'LOGOUT',
  PASSWORD_RESET_REQUESTED = 'PASSWORD_RESET_REQUESTED',
  PASSWORD_RESET_SUCCESS = 'PASSWORD_RESET_SUCCESS',
  PASSWORD_RESET_FAILED = 'PASSWORD_RESET_FAILED',
  EMAIL_VERIFIED = 'EMAIL_VERIFIED',
  SELLER_PROFILE_CREATED = 'SELLER_PROFILE_CREATED',
  PROFILE_UPDATED = 'PROFILE_UPDATED',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  ACCOUNT_UNLOCKED = 'ACCOUNT_UNLOCKED',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  ROLE_CHANGED = 'ROLE_CHANGED',
}

export interface AuditLogEntry {
  eventType: AuditEventType
  userId?: string
  email?: string
  ipAddress?: string
  userAgent?: string
  success: boolean
  reason?: string
  metadata?: Record<string, any>
}

/**
 * Log auth event to database
 * This could be extended to send to external logging service (DataDog, Splunk, etc.)
 */
export async function logAuditEvent(entry: AuditLogEntry) {
  try {
    // Store in database (you'll need to add AuditLog table to schema)
    await prisma.auditLog.create({
      data: {
        event_type: entry.eventType,
        user_id: entry.userId || null,
        email: entry.email || null,
        ip_address: entry.ipAddress || null,
        user_agent: entry.userAgent || null,
        success: entry.success,
        reason: entry.reason || null,
        metadata: entry.metadata || null,
        created_at: new Date(),
      },
    })

    // Send to external logging service if needed
    if (process.env.EXTERNAL_LOG_SERVICE) {
      await logToExternalService(entry)
    }

    // Alert if suspicious activity
    if (!entry.success && entry.eventType === AuditEventType.LOGIN_FAILED) {
      checkForSuspiciousActivity(entry)
    }
  } catch (error) {
    // Never let logging errors break auth flow
    console.error('Failed to log audit event:', error)
  }
}

/**
 * Check for suspicious patterns
 * Alert if: multiple failed logins in short time, impossible travel, etc.
 */
async function checkForSuspiciousActivity(entry: AuditLogEntry) {
  if (!entry.email) return

  try {
    // Get recent failed login attempts
    const recentFailures = await prisma.auditLog.findMany({
      where: {
        email: entry.email,
        event_type: AuditEventType.LOGIN_FAILED,
        created_at: {
          gte: new Date(Date.now() - 5 * 60 * 1000), // Last 5 minutes
        },
      },
      orderBy: { created_at: 'desc' },
      take: 5,
    })

    // Alert if many failures from different IPs (possible account compromise)
    const uniqueIps = new Set(recentFailures.map((f) => f.ip_address))
    if (uniqueIps.size > 3) {
      await logAuditEvent({
        eventType: AuditEventType.SUSPICIOUS_ACTIVITY,
        email: entry.email,
        reason: `Multiple failed logins from ${uniqueIps.size} different IPs`,
        metadata: { suspicious_ips: Array.from(uniqueIps) },
        success: false,
      })

      // Could send email to user here
    }
  } catch (error) {
    console.error('Failed to check suspicious activity:', error)
  }
}

/**
 * Send to external logging service
 * Example: DataDog, Splunk, Grafana Loki, etc.
 */
async function logToExternalService(entry: AuditLogEntry) {
  try {
    const logServiceUrl = process.env.LOG_SERVICE_URL
    if (!logServiceUrl) return

    await fetch(logServiceUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.LOG_SERVICE_TOKEN}`,
      },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        service: 'auth',
        ...entry,
      }),
    })
  } catch (error) {
    console.error('Failed to send to external logging service:', error)
  }
}

/**
 * Get audit logs for a user
 * Useful for security dashboards
 */
export async function getUserAuditLogs(
  userId: string,
  limit: number = 50
) {
  return prisma.auditLog.findMany({
    where: { user_id: userId },
    orderBy: { created_at: 'desc' },
    take: limit,
  })
}

/**
 * Get suspicious activity logs
 */
export async function getSuspiciousActivityLogs(
  since: Date = new Date(Date.now() - 24 * 60 * 60 * 1000)
) {
  return prisma.auditLog.findMany({
    where: {
      event_type: AuditEventType.SUSPICIOUS_ACTIVITY,
      created_at: { gte: since },
    },
    orderBy: { created_at: 'desc' },
  })
}
