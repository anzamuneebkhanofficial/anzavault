import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { AuditLog } from '@/models/AuditLog';
import { BlockedIP } from '@/models/BlockedIP';
import { LoginAttempt } from '@/models/LoginAttempt';
import { getAuthCookies, verifyAccessToken } from '@/lib/auth';
import { pruneExpiredLogs } from '@/lib/audit-cleanup';

export async function GET() {
  const { accessToken } = await getAuthCookies();
  if (!accessToken || !(await verifyAccessToken(accessToken))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();

  // Auto-prune expired logs based on LOG_RETENTION_HOURS (default 72h / 3 days)
  await pruneExpiredLogs().catch((err) => console.error('Background log prune error:', err));

  const [logs, blockedIps, recentAttempts] = await Promise.all([
    AuditLog.find({}).sort({ timestamp: -1 }).limit(100),
    BlockedIP.find({}).sort({ blockedAt: -1 }),
    LoginAttempt.find({}).sort({ timestamp: -1 }).limit(20),
  ]);

  return NextResponse.json({
    logs: logs.map((log) => ({
      id: log._id.toString(),
      action: log.action,
      entityId: log.entityId,
      ip: log.ip,
      userAgent: log.userAgent,
      details: log.details,
      timestamp: log.timestamp,
    })),
    blockedIps: blockedIps.map((b) => ({
      id: b._id.toString(),
      ip: b.ip,
      reason: b.reason,
      attemptCount: b.attemptCount,
      countryCode: b.countryCode,
      countryName: b.countryName,
      city: b.city,
      flagEmoji: b.flagEmoji,
      blockedAt: b.blockedAt,
    })),
    recentAttempts: recentAttempts.map((a) => ({
      id: a._id.toString(),
      ip: a.ip,
      emailAttempted: a.emailAttempted,
      success: a.success,
      timestamp: a.timestamp,
      userAgent: a.userAgent,
    })),
  });
}
