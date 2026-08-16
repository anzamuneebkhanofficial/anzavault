import { connectDB } from './db';
import { AuditLog } from '@/models/AuditLog';
import { LoginAttempt } from '@/models/LoginAttempt';

/**
 * Cleanup security audit logs older than retention hours
 * Default is configured via environment variable LOG_RETENTION_HOURS (default: 72 hours / 3 days)
 */
export async function pruneExpiredLogs(overrideHours?: number): Promise<{ deletedAuditLogs: number; deletedLoginAttempts: number; retentionHours: number }> {
  await connectDB();

  const envHours = process.env.LOG_RETENTION_HOURS ? parseInt(process.env.LOG_RETENTION_HOURS, 10) : 72;
  const retentionHours = overrideHours || envHours;

  const cutoffDate = new Date(Date.now() - retentionHours * 60 * 60 * 1000);

  const auditRes = await AuditLog.deleteMany({
    timestamp: { $lt: cutoffDate },
  });

  const attemptRes = await LoginAttempt.deleteMany({
    timestamp: { $lt: cutoffDate },
  });

  return {
    deletedAuditLogs: auditRes.deletedCount || 0,
    deletedLoginAttempts: attemptRes.deletedCount || 0,
    retentionHours,
  };
}
