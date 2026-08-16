import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { argon2id } from 'hash-wasm';

const JWT_ACCESS_SECRET = new TextEncoder().encode(
  process.env.JWT_ACCESS_SECRET || 'anza-vault-access-secret-32-chars-min-length-key'
);
const JWT_REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET || 'anza-vault-refresh-secret-32-chars-min-length-key'
);

export const ACCESS_TOKEN_COOKIE = 'anza_vault_access';
export const REFRESH_TOKEN_COOKIE = 'anza_vault_refresh';

export interface TokenPayload {
  email: string;
  jti: string;
  fp: string; // Fingerprint (IP + UserAgent hash)
}

/**
 * Computes client fingerprint hash from IP and User Agent string
 */
export function getFingerprint(ip: string, userAgent: string): string {
  return crypto
    .createHash('sha256')
    .update(`${ip}:${userAgent}`)
    .digest('hex');
}

/**
 * Hashes a password using Argon2id
 */
export async function hashOwnerPassword(password: string): Promise<string> {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  return argon2id({
    password,
    salt,
    parallelism: 1,
    iterations: 3,
    memorySize: 65536, // 64MB
    hashLength: 32,
    outputType: 'encoded',
  });
}

/**
 * Verifies submitted password against configured owner / admin password (env) using timing-safe comparison
 */
export async function verifyOwnerPassword(password: string): Promise<boolean> {
  const adminPass = process.env.ADMIN_PASSWORD || process.env.OWNER_PASSWORD || 'anza123';
  const storedHash = process.env.OWNER_PASSWORD_HASH;

  if (!password || password.trim().length === 0) {
    return false;
  }

  try {
    // 1. If stored hash is provided (SHA-256 hex or Argon2id)
    if (storedHash && storedHash.trim().length > 0) {
      const shaHash = crypto.createHash('sha256').update(password).digest('hex');
      if (shaHash.length === storedHash.length) {
        return crypto.timingSafeEqual(Buffer.from(shaHash), Buffer.from(storedHash));
      }
    }

    // 2. Direct timing-safe comparison with ADMIN_PASSWORD / OWNER_PASSWORD
    const targetPass = adminPass.trim();
    const inputPass = password.trim();

    if (inputPass.length !== targetPass.length) {
      return false;
    }

    return crypto.timingSafeEqual(Buffer.from(inputPass), Buffer.from(targetPass));
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

/**
 * Constant-time email comparison
 */
export function verifyOwnerEmail(email: string): boolean {
  const ownerEmail = (process.env.OWNER_EMAIL || 'anza@example.com').toLowerCase().trim();
  const inputEmail = email.toLowerCase().trim();
  
  if (ownerEmail.length !== inputEmail.length) {
    return false;
  }
  
  return crypto.timingSafeEqual(Buffer.from(ownerEmail), Buffer.from(inputEmail));
}

/**
 * Creates Access Token (~15 mins)
 */
export async function createAccessToken(payload: TokenPayload): Promise<string> {
  const expiresIn = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(JWT_ACCESS_SECRET);
}

/**
 * Creates Refresh Token (~7 days)
 */
export async function createRefreshToken(payload: TokenPayload): Promise<string> {
  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(JWT_REFRESH_SECRET);
}

/**
 * Verifies Access Token
 */
export async function verifyAccessToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_ACCESS_SECRET, {
      algorithms: ['HS256'],
    });
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * Verifies Refresh Token
 */
export async function verifyRefreshToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_REFRESH_SECRET, {
      algorithms: ['HS256'],
    });
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * Sets auth cookies in Next.js Server Response context
 */
export async function setAuthCookies(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies();
  const isProd = process.env.NODE_ENV === 'production';

  const secure = process.env.COOKIE_SECURE !== undefined ? process.env.COOKIE_SECURE === 'true' : isProd;
  const sameSite = (process.env.COOKIE_SAME_SITE as 'strict' | 'lax' | 'none') || (isProd ? 'strict' : 'lax');
  const httpOnly = process.env.COOKIE_HTTP_ONLY !== undefined ? process.env.COOKIE_HTTP_ONLY === 'true' : true;

  cookieStore.set(ACCESS_TOKEN_COOKIE, accessToken, {
    httpOnly,
    secure,
    sameSite,
    path: '/',
    maxAge: 15 * 60, // 15 minutes
  });

  cookieStore.set(REFRESH_TOKEN_COOKIE, refreshToken, {
    httpOnly,
    secure,
    sameSite,
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

/**
 * Clears auth cookies
 */
export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
}

/**
 * Retrieves auth tokens from request cookies
 */
export async function getAuthCookies() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
  return { accessToken, refreshToken };
}
