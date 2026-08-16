import QRCode from 'qrcode';
import crypto from 'crypto';

export function getTotpSecret(): string {
  return process.env.TOTP_SECRET || '';
}

/**
 * Base32 decoder for RFC 6238 TOTP secrets
 */
function base32Decode(base32: string): Buffer {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  const clean = base32.toUpperCase().replace(/=+$/, '').replace(/[\s-]/g, '');
  for (let i = 0; i < clean.length; i++) {
    const val = alphabet.indexOf(clean[i]);
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, '0');
  }
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.substring(i, i + 8), 2));
  }
  return Buffer.from(bytes);
}

/**
 * Generate 6-digit TOTP code for a secret at a given timestamp
 */
export function generateTotpCode(secret: string, timestamp: number = Date.now()): string {
  try {
    const key = base32Decode(secret);
    if (key.length === 0) return '';
    const counter = Math.floor(Math.floor(timestamp / 1000) / 30);

    const buffer = Buffer.alloc(8);
    buffer.writeBigInt64BE(BigInt(counter));

    const hmac = crypto.createHmac('sha1', key).update(buffer).digest();
    const offset = hmac[hmac.length - 1] & 0xf;
    const code = ((hmac.readUInt32BE(offset) & 0x7fffffff) % 1000000).toString().padStart(6, '0');
    return code;
  } catch (err) {
    console.error('TOTP generation error:', err);
    return '';
  }
}

/**
 * Verifies a 6-digit TOTP code (RFC 6238) or an 8-character backup recovery code
 */
export function verifyTotpToken(token: string): boolean {
  const secret = getTotpSecret();
  if (!secret || secret.trim().length === 0) {
    // If TOTP secret is not configured in env, allow login
    return true;
  }

  const cleanToken = token.trim().toUpperCase();

  // 1. Check if input matches configured recovery codes in env (TOTP_RECOVERY_CODES="code1,code2,...")
  const recoveryEnv = process.env.TOTP_RECOVERY_CODES;
  if (recoveryEnv && /^[A-F0-9]{8}$/.test(cleanToken)) {
    const validCodes = recoveryEnv.split(',').map((c) => c.trim().toUpperCase());
    if (validCodes.includes(cleanToken)) {
      return true;
    }
  }

  // 2. Check if input is a valid 6-digit RFC 6238 TOTP code (-30s, 0s, +30s time windows)
  if (/^\d{6}$/.test(cleanToken)) {
    const now = Date.now();
    for (let offset = -30000; offset <= 30000; offset += 30000) {
      const validCode = generateTotpCode(secret, now + offset);
      if (validCode === cleanToken) {
        return true;
      }
    }
  }

  return false;
}

export function hashBackupCode(code: string): string {
  return crypto.createHash('sha256').update(code.trim().toUpperCase()).digest('hex');
}

export function verifyBackupCode(code: string, hashedCodes: string[]): { isValid: boolean; remainingCodes: string[] } {
  const hashedInput = hashBackupCode(code);
  const index = hashedCodes.indexOf(hashedInput);
  
  if (index !== -1) {
    const remainingCodes = [...hashedCodes];
    remainingCodes.splice(index, 1);
    return { isValid: true, remainingCodes };
  }
  
  return { isValid: false, remainingCodes: hashedCodes };
}

export async function generateTotpSetup(appName: string, email: string) {
  // Generate random 20-byte base32 secret
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let secret = '';
  const randomBytes = crypto.randomBytes(20);
  for (let i = 0; i < 20; i++) {
    secret += chars[randomBytes[i] % chars.length];
  }

  const otpauth = `otpauth://totp/${encodeURIComponent(appName)}:${encodeURIComponent(email)}?secret=${secret}&issuer=${encodeURIComponent(appName)}`;
  const qrCodeUrl = await QRCode.toDataURL(otpauth);
  
  const rawBackupCodes: string[] = [];
  const hashedBackupCodes: string[] = [];
  
  for (let i = 0; i < 10; i++) {
    const rawCode = crypto.randomBytes(4).toString('hex').toUpperCase();
    rawBackupCodes.push(rawCode);
    hashedBackupCodes.push(hashBackupCode(rawCode));
  }
  
  return {
    secret,
    otpauth,
    qrCodeUrl,
    rawBackupCodes,
    hashedBackupCodes,
  };
}
