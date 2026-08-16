import { connectDB } from './db';
import { BlockedIP } from '@/models/BlockedIP';
import { LoginAttempt } from '@/models/LoginAttempt';
import { AuditLog } from '@/models/AuditLog';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { sendSecurityAlert } from './alerts';

const MAX_LOGIN_ATTEMPTS = parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5', 10);

// Initialize Upstash Redis ratelimiter if credentials are available
let upstashRatelimit: Ratelimit | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  try {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    upstashRatelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 requests per minute limit
      analytics: true,
      prefix: 'anza_vault_ratelimit',
    });
  } catch (err) {
    console.error('Upstash Redis initialization error:', err);
  }
}

/**
 * Checks whether an IP address is permanently blocked in MongoDB
 */
export async function isIpBlocked(ip: string): Promise<boolean> {
  if (!ip) return false;
  try {
    await connectDB();
    const blocked = await BlockedIP.findOne({ ip });
    return !!blocked;
  } catch (error) {
    console.error('Error checking blocked IP status:', error);
    return false;
  }
}

/**
 * Upstash edge rate limit check (5 requests/minute)
 */
export async function checkUpstashRateLimit(ip: string): Promise<{ success: boolean; limit?: number; remaining?: number }> {
  if (!upstashRatelimit) {
    return { success: true };
  }
  try {
    const result = await upstashRatelimit.limit(ip);
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
    };
  } catch (error) {
    console.error('Upstash ratelimit error:', error);
    return { success: true };
  }
}

/**
 * Records a login attempt and checks for 2-strike lockout condition
 */
export async function recordLoginAttempt(
  ip: string,
  email: string,
  success: boolean,
  userAgent: string
): Promise<{ isBlocked: boolean; attemptCount: number }> {
  await connectDB();

  // Save login attempt
  await LoginAttempt.create({
    ip,
    emailAttempted: email,
    success,
    timestamp: new Date(),
    userAgent,
  });

  // Audit log entry
  await AuditLog.create({
    action: success ? 'login_success' : 'login_fail',
    ip,
    userAgent,
    details: success ? `Successful login for ${email}` : `Failed login attempt for ${email}`,
    timestamp: new Date(),
  });

  if (success) {
    // Dispatch success security alert email (asynchronously)
    sendSecurityAlert({
      type: 'login_success',
      ip,
      email,
      userAgent,
      timestamp: new Date(),
    }).catch(err => console.error('Alert email dispatch failed:', err));

    return { isBlocked: false, attemptCount: 0 };
  }

  // Count recent failed attempts from this IP in the last 24 hours
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentFailedCount = await LoginAttempt.countDocuments({
    ip,
    success: false,
    timestamp: { $gte: oneDayAgo },
  });

  // Check if threshold reached
  if (recentFailedCount >= MAX_LOGIN_ATTEMPTS) {
    await BlockedIP.updateOne(
      { ip },
      {
        $set: {
          ip,
          reason: 'max_login_attempts_exceeded',
          attemptCount: recentFailedCount,
          blockedAt: new Date(),
        },
      },
      { upsert: true }
    );

    // Audit log IP block
    await AuditLog.create({
      action: 'ip_blocked',
      ip,
      userAgent,
      details: `IP ${ip} permanently locked out after ${recentFailedCount} failed login attempts`,
      timestamp: new Date(),
    });

    // Send real-time lockout alert email
    sendSecurityAlert({
      type: 'ip_blocked',
      ip,
      email,
      userAgent,
      timestamp: new Date(),
      attemptCount: recentFailedCount,
    }).catch(err => console.error('Lockout alert email failed:', err));

    return { isBlocked: true, attemptCount: recentFailedCount };
  }

  // Send failed attempt alert email
  sendSecurityAlert({
    type: 'login_fail',
    ip,
    email,
    userAgent,
    timestamp: new Date(),
    attemptCount: recentFailedCount,
  }).catch(err => console.error('Failed login alert email failed:', err));

  return { isBlocked: false, attemptCount: recentFailedCount };
}

/**
 * Manually unblocks an IP address (Admin only)
 */
export async function unblockIp(ip: string, adminIp: string): Promise<boolean> {
  await connectDB();
  const res = await BlockedIP.deleteOne({ ip });
  
  if (res.deletedCount > 0) {
    await AuditLog.create({
      action: 'ip_unblocked',
      ip: adminIp,
      details: `IP address ${ip} was manually unblocked by admin`,
      timestamp: new Date(),
    });
    return true;
  }
  
  return false;
}
