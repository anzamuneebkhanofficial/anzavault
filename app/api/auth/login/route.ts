import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { loginSchema } from '@/lib/validations';
import { 
  verifyOwnerEmail, 
  verifyOwnerPassword, 
  createAccessToken, 
  createRefreshToken, 
  setAuthCookies,
  getFingerprint
} from '@/lib/auth';
import { verifyTotpToken, getTotpSecret } from '@/lib/totp';
import { isIpBlocked, recordLoginAttempt, checkUpstashRateLimit } from '@/lib/rate-limit';
import { connectDB } from '@/lib/db';
import { Session } from '@/models/Session';

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return '127.0.0.1';
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const userAgent = request.headers.get('user-agent') || 'unknown';

  // 1. Hard IP Lockout check before processing
  const blocked = await isIpBlocked(ip);
  if (blocked) {
    return NextResponse.json(
      { error: 'Access Denied: Your IP has been permanently locked out due to multiple failed login attempts.' },
      { status: 403 }
    );
  }

  // 2. Upstash sliding-window rate limit
  const rateLimitResult = await checkUpstashRateLimit(ip);
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too many login requests. Please wait a minute before trying again.' },
      { status: 429 }
    );
  }

  // 3. Body validation
  const body = await request.json().catch(() => ({}));
  const validation = loginSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Invalid input fields', details: validation.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { email, password, totpCode } = validation.data;

  // 4. Verify Owner Email and Password
  const isEmailValid = verifyOwnerEmail(email);
  const isPasswordValid = await verifyOwnerPassword(password);

  if (!isEmailValid || !isPasswordValid) {
    const attemptStatus = await recordLoginAttempt(ip, email, false, userAgent);
    if (attemptStatus.isBlocked) {
      return NextResponse.json(
        { error: 'Maximum login attempts (2) exceeded. Your IP address has been permanently locked out.' },
        { status: 403 }
      );
    }

    const remaining = Math.max(0, 2 - attemptStatus.attemptCount);
    return NextResponse.json(
      { 
        error: `Invalid identity credentials. ${remaining} attempt(s) remaining before permanent IP lockout.`,
        attemptsUsed: attemptStatus.attemptCount,
        maxAttempts: 2
      },
      { status: 401 }
    );
  }

  // 5. TOTP Verification (if configured)
  const totpSecret = getTotpSecret();
  if (totpSecret && totpSecret.length > 0) {
    if (!totpCode) {
      return NextResponse.json(
        { requiresTotp: true, message: 'Please enter your 6-digit TOTP code from your authenticator app.' },
        { status: 200 }
      );
    }

    const isTotpValid = verifyTotpToken(totpCode);
    if (!isTotpValid) {
      const attemptStatus = await recordLoginAttempt(ip, email, false, userAgent);
      if (attemptStatus.isBlocked) {
        return NextResponse.json(
          { error: 'Maximum login attempts (2) exceeded during 2FA. Your IP is permanently locked out.' },
          { status: 403 }
        );
      }
      return NextResponse.json(
        { error: 'Invalid TOTP authenticator code.' },
        { status: 401 }
      );
    }
  }

  // 6. Successful Authentication -> Single Active Session Enforcement
  await connectDB();
  await Session.deleteMany({}); // Kick out any other active session globally

  const jti = crypto.randomUUID();
  const fp = getFingerprint(ip, userAgent);

  const accessToken = await createAccessToken({ email, jti, fp });
  const refreshToken = await createRefreshToken({ email, jti, fp });

  const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  const userAgentHash = crypto.createHash('sha256').update(userAgent).digest('hex');

  await Session.create({
    jti,
    refreshTokenHash,
    ip,
    userAgentHash,
    lastActivity: new Date(),
  });

  await setAuthCookies(accessToken, refreshToken);
  await recordLoginAttempt(ip, email, true, userAgent);

  return NextResponse.json({
    success: true,
    message: 'Authenticated successfully',
  });
}
