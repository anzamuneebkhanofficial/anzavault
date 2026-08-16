import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { BlockedIP } from '@/models/BlockedIP';
import { AuditLog } from '@/models/AuditLog';
import { getAuthCookies, verifyAccessToken } from '@/lib/auth';
import { getIpGeoInfo } from '@/lib/ip-geo';

export async function POST(request: NextRequest) {
  const { accessToken } = await getAuthCookies();
  if (!accessToken || !(await verifyAccessToken(accessToken))) {
    return NextResponse.json({ error: 'Unauthorized. Admin session required.' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { ip, reason = 'manual_admin_block' } = body;

    if (!ip || typeof ip !== 'string') {
      return NextResponse.json({ error: 'Valid IP address is required' }, { status: 400 });
    }

    await connectDB();
    const geoInfo = await getIpGeoInfo(ip);

    await BlockedIP.updateOne(
      { ip },
      {
        $set: {
          ip,
          reason,
          attemptCount: 1,
          countryCode: geoInfo.countryCode,
          countryName: geoInfo.countryName,
          city: geoInfo.city,
          flagEmoji: geoInfo.flagEmoji,
          blockedAt: new Date(),
        },
      },
      { upsert: true }
    );

    await AuditLog.create({
      action: 'ip_blocked',
      ip,
      details: `IP ${ip} was manually blocked by owner. Reason: ${reason}`,
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: `IP address ${ip} has been permanently blocked.`,
    });
  } catch (error: any) {
    console.error('Manual IP block error:', error);
    return NextResponse.json({ error: error.message || 'Block failed' }, { status: 500 });
  }
}
