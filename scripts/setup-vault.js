const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const otplib = require('otplib');
const authenticator = otplib.authenticator || otplib;
let qrcodeTerminal = null;
try {
  qrcodeTerminal = require('qrcode-terminal');
} catch (e) {
  // qrcode-terminal is optional
}

async function runSetup() {
  console.log('\n======================================================');
  console.log('         🔑 ANZA VAULT — SECURITY SETUP WIZARD');
  console.log('======================================================\n');

  const encryptionKey = crypto.randomBytes(32).toString('hex');
  const jwtAccessSecret = crypto.randomBytes(32).toString('hex');
  const jwtRefreshSecret = crypto.randomBytes(32).toString('hex');
  const totpSecret = authenticator.generateSecret();

  const ownerEmail = process.argv[2] || 'anza@example.com';
  const ownerPassword = process.argv[3] || 'AnzaVault2026!Secure';

  console.log(`Setting up single-owner identity for: ${ownerEmail}`);

  // Generate SHA-256 fallback hash & Argon2id info
  const passwordHash = crypto.createHash('sha256').update(ownerPassword).digest('hex');

  // Generate 10 Backup Codes
  const backupCodes = [];
  const hashedBackupCodes = [];
  for (let i = 0; i < 10; i++) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    backupCodes.push(code);
    hashedBackupCodes.push(crypto.createHash('sha256').update(code).digest('hex'));
  }

  const secret = authenticator.generateSecret ? authenticator.generateSecret() : crypto.randomBytes(20).toString('hex');
  const otpauth = `otpauth://totp/Anza%20Vault:${encodeURIComponent(ownerEmail)}?secret=${totpSecret}&issuer=Anza%20Vault`;

  console.log('\n--- TOTP Authenticator Setup ---');
  console.log(`TOTP Secret: ${totpSecret}`);
  console.log('Scan the QR code below using your Authenticator App (Google Authenticator, Aegis, Bitwarden, etc.):\n');

  try {
    if (qrcodeTerminal && qrcodeTerminal.generate) {
      qrcodeTerminal.generate(otpauth, { small: true });
    } else {
      console.log(`Key URI: ${otpauth}`);
    }
  } catch (e) {
    console.log(`Key URI: ${otpauth}`);
  }

  console.log('\n--- 10 SINGLE-USE RECOVERY BACKUP CODES ---');
  console.log('Save these offline! They are your emergency recovery keys:');
  backupCodes.forEach((code, idx) => {
    console.log(`  [${(idx + 1).toString().padStart(2, '0')}]  ${code}`);
  });

  const envContent = `# Anza Vault — Environment Configuration
APP_NAME="Anza Vault"
OWNER_EMAIL="${ownerEmail}"
OWNER_PASSWORD_HASH="${passwordHash}"

# Field-Level Encryption (32-byte / 64 hex chars)
ENCRYPTION_KEY="${encryptionKey}"

# JWT Signing Secrets
JWT_ACCESS_SECRET="${jwtAccessSecret}"
JWT_REFRESH_SECRET="${jwtRefreshSecret}"

# 2FA TOTP Secret
TOTP_SECRET="${totpSecret}"

# Security & Session Settings
MAX_LOGIN_ATTEMPTS="2"
SESSION_IDLE_TIMEOUT_MINUTES="15"

# Database & Infrastructure
MONGODB_URI="mongodb://localhost:27017/anza-vault"

# Optional Upstash Redis Edge Rate-Limiting
# UPSTASH_REDIS_REST_URL=""
# UPSTASH_REDIS_REST_TOKEN=""

# Optional Resend Real-Time Email Alerts
# RESEND_API_KEY=""
# ALERT_EMAIL_TO="${ownerEmail}"
# ALERT_EMAIL_FROM="security@anzavault.app"
`;

  const envPath = path.join(__dirname, '..', '.env.local');
  fs.writeFileSync(envPath, envContent);

  console.log('\n======================================================');
  console.log(`✅ Setup complete! Created .env.local file at: ${envPath}`);
  console.log(`Default login password: ${ownerPassword}`);
  console.log('======================================================\n');
}

runSetup().catch(console.error);
