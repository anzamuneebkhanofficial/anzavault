import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { pruneExpiredLogs } from '@/lib/audit-cleanup';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const retentionHours = body.retentionHours ? parseInt(body.retentionHours, 10) : 72; // default 3 days / 72 hours

    const result = await pruneExpiredLogs(retentionHours);

    return NextResponse.json({
      success: true,
      retentionHours,
      deletedAuditLogs: result.deletedAuditLogs,
      deletedLoginAttempts: result.deletedLoginAttempts,
      message: `Cleaned up ${result.deletedAuditLogs} audit logs and ${result.deletedLoginAttempts} login attempts older than ${retentionHours} hours.`,
    });
  } catch (error: any) {
    console.error('Audit cleanup route error:', error);
    return NextResponse.json({ error: error.message || 'Cleanup failed' }, { status: 500 });
  }
}
