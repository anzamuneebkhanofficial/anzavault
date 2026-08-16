import { NextResponse } from 'next/server';
import { getAuthCookies, verifyAccessToken } from '@/lib/auth';

export async function GET() {
  const { accessToken } = await getAuthCookies();

  if (!accessToken) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const payload = await verifyAccessToken(accessToken);
  if (!payload) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    email: payload.email,
    appName: process.env.APP_NAME || 'Anza Vault',
  });
}
