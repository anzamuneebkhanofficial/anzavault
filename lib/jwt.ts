import { SignJWT, jwtVerify } from 'jose';

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
  fp: string; // Fingerprint
}

/**
 * Creates Access Token (~15 mins) - Edge safe
 */
export async function createAccessToken(payload: TokenPayload): Promise<string> {
  const expiresIn = process.env.JWT_ACCESS_EXPIRES_IN || '6h';
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(JWT_ACCESS_SECRET);
}

/**
 * Creates Refresh Token (~7 days) - Edge safe
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
 * Verifies Access Token - Edge safe
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
 * Verifies Refresh Token - Edge safe
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
