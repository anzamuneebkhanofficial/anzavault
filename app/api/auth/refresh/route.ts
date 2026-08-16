import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { 
  getAuthCookies, 
  verifyRefreshToken, 
  createAccessToken, 
  createRefreshToken, 
  setAuthCookies, 
  clearAuthCookies,
  getFingerprint 
} from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { Session } from '@/models/Session';

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return '127.0.0.1';
}

export async function POST(request: NextRequest) {
  const { refreshToken } = await getAuthCookies();

  if (!refreshToken) {
    await clearAuthCookies();
    return NextResponse.json({ error: 'No refresh token provided' }, { status: 401 });
  }

  const payload = await verifyRefreshToken(refreshToken);
  if (!payload || !payload.jti) {
    await clearAuthCookies();
    return NextResponse.json({ error: 'Invalid or expired refresh token' }, { status: 401 });
  }

  await connectDB();
  const session = await Session.findOne({ jti: payload.jti });
  if (!session) {
    await clearAuthCookies();
    return NextResponse.json({ error: 'Session invalidated or expired' }, { status: 401 });
  }

  // Verify Refresh Token Hash match
  const currentTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  if (session.refreshTokenHash !== currentTokenHash) {
    // Possible token reuse attack! Invalidate session immediately
    await Session.deleteOne({ jti: payload.jti });
    await clearAuthCookies();
    return NextResponse.json({ error: 'Security breach detected: invalid refresh token reuse' }, { status: 401 });
  }

  // Check Session Idle Timeout (default 15 minutes)
  const idleTimeoutMinutes = parseInt(process.env.SESSION_IDLE_TIMEOUT_MINUTES || '15', 10);
  const idleDiff = (Date.now() - new Date(session.lastActivity).getTime()) / (1000 * 60);

  if (idleDiff > idleTimeoutMinutes) {
    await Session.deleteOne({ jti: payload.jti });
    await clearAuthCookies();
    return NextResponse.json({ error: 'Session expired due to inactivity' }, { status: 401 });
  }

  // Fingerprint verification
  const ip = getClientIp(request);
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const currentFp = getFingerprint(ip, userAgent);

  if (payload.fp !== currentFp) {
    await Session.deleteOne({ jti: payload.jti });
    await clearAuthCookies();
    return NextResponse.json({ error: 'Session hijacked: fingerprint mismatch' }, { status: 401 });
  }

  // Rotate Refresh Token (Issue new tokens and update session JTI)
  const newJti = crypto.randomUUID();
  const newAccessToken = await createAccessToken({ email: payload.email, jti: newJti, fp: currentFp });
  const newRefreshToken = await createRefreshToken({ email: payload.email, jti: newJti, fp: currentFp });
  const newRefreshTokenHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');

  // Update session record
  session.jti = newJti;
  session.refreshTokenHash = newRefreshTokenHash;
  session.lastActivity = new Date();
  await session.save();

  await setAuthCookies(newAccessToken, newRefreshToken);

  return NextResponse.json({ success: true, message: 'Session refreshed' });
}
