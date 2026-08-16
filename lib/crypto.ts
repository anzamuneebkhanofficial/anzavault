import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // Standard 96-bit IV for AES-GCM
const AUTH_TAG_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const keyHex = process.env.ENCRYPTION_KEY;
  if (!keyHex) {
    // Fallback key for build/development if not provided, but warning in logs
    if (process.env.NODE_ENV === 'production') {
      throw new Error('ENCRYPTION_KEY environment variable is missing in production!');
    }
    // Deterministic dev fallback key (32 bytes hex)
    return Buffer.from('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef', 'hex');
  }

  // Handle both 64-char hex string or raw base64/string
  if (keyHex.length === 64 && /^[0-9a-fA-F]+$/.test(keyHex)) {
    return Buffer.from(keyHex, 'hex');
  }

  // Fallback to scrypt hash if key is plain text password string
  return crypto.scryptSync(keyHex, 'anza-vault-salt-v1', 32);
}

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * Output format: "ivHex:authTagHex:encryptedHex"
 */
export function encrypt(plaintext: string): string {
  if (!plaintext) return '';
  
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypts an AES-256-GCM encrypted string format ("ivHex:authTagHex:encryptedHex").
 */
export function decrypt(ciphertext: string): string {
  if (!ciphertext) return '';
  
  const parts = ciphertext.split(':');
  if (parts.length !== 3) {
    // If not in encrypted format (e.g. legacy/unencrypted data), return as is
    return ciphertext;
  }

  try {
    const [ivHex, authTagHex, encryptedHex] = parts;
    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    return '[Decryption Failed]';
  }
}
