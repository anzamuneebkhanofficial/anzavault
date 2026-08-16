import { NextResponse } from 'next/server';
import { clearAuthCookies, getAuthCookies, verifyAccessToken } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { Session } from '@/models/Session';

export async function POST() {
  const { accessToken } = await getAuthCookies();
  
  if (accessToken) {
    const payload = await verifyAccessToken(accessToken);
    if (payload?.jti) {
      await connectDB();
      await Session.deleteOne({ jti: payload.jti });
    }
  }

  await clearAuthCookies();
  return NextResponse.json({ success: true, message: 'Logged out successfully' });
}
