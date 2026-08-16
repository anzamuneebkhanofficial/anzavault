import { NextRequest, NextResponse } from 'next/server';
import { unblockIp } from '@/lib/rate-limit';
import { unblockIpSchema } from '@/lib/validations';
import { getAuthCookies, verifyAccessToken } from '@/lib/auth';

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return '127.0.0.1';
}

export async function POST(request: NextRequest) {
  const { accessToken } = await getAuthCookies();
  if (!accessToken || !(await verifyAccessToken(accessToken))) {
    return NextResponse.json({ error: 'Unauthorized. Admin session required.' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const validation = unblockIpSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json({ error: 'Invalid IP parameter' }, { status: 400 });
  }

  const { ip } = validation.data;
  const adminIp = getClientIp(request);

  const success = await unblockIp(ip, adminIp);

  if (success) {
    return NextResponse.json({ success: true, message: `IP address ${ip} has been successfully unblocked.` });
  } else {
    return NextResponse.json({ error: `IP ${ip} was not found in the blocked list.` }, { status: 404 });
  }
}
