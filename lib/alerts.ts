import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const alertTo = process.env.ALERT_EMAIL_TO || process.env.OWNER_EMAIL;
const alertFrom = process.env.ALERT_EMAIL_FROM || 'security@anzavault.app';

const resend = resendApiKey ? new Resend(resendApiKey) : null;

export interface AlertPayload {
  type: 'login_success' | 'login_fail' | 'ip_blocked';
  ip: string;
  email: string;
  userAgent?: string;
  timestamp: Date;
  attemptCount?: number;
}

/**
 * Sends real-time security alert emails
 */
export async function sendSecurityAlert(payload: AlertPayload): Promise<boolean> {
  const { type, ip, email, userAgent, timestamp, attemptCount } = payload;
  
  if (!resend || !alertTo) {
    console.log(`[SECURITY ALERT LOG] Type: ${type} | IP: ${ip} | Email: ${email} | Time: ${timestamp.toISOString()}`);
    return false;
  }

  let subject = '';
  let html = '';

  const formattedTime = timestamp.toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'medium',
    timeZone: 'UTC',
  });

  if (type === 'login_success') {
    subject = `🔒 [Anza Vault] Successful Login from ${ip}`;
    html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #0b0f17; color: #e2e8f0; border-radius: 8px;">
        <h2 style="color: #10b981; margin-top: 0;">Successful Vault Login</h2>
        <p>A successful login to <strong>Anza Vault</strong> was performed.</p>
        <hr style="border: 1px solid #1e293b;" />
        <ul style="line-height: 1.6;">
          <li><strong>Identity:</strong> ${email}</li>
          <li><strong>IP Address:</strong> ${ip}</li>
          <li><strong>Time:</strong> ${formattedTime} UTC</li>
          <li><strong>User Agent:</strong> ${userAgent || 'Unknown'}</li>
        </ul>
        <p style="font-size: 12px; color: #94a3b8; margin-top: 20px;">If this was not you, your account credentials may be compromised. Take immediate action.</p>
      </div>
    `;
  } else if (type === 'login_fail') {
    subject = `⚠️ [Anza Vault] FAILED Login Attempt from ${ip}`;
    html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #0b0f17; color: #e2e8f0; border-radius: 8px;">
        <h2 style="color: #f59e0b; margin-top: 0;">Failed Login Attempt Detected</h2>
        <p>An invalid authentication attempt was detected on <strong>Anza Vault</strong>.</p>
        <hr style="border: 1px solid #1e293b;" />
        <ul style="line-height: 1.6;">
          <li><strong>Attempted Email:</strong> ${email}</li>
          <li><strong>IP Address:</strong> ${ip}</li>
          <li><strong>Failed Count:</strong> ${attemptCount || 1} / ${process.env.MAX_LOGIN_ATTEMPTS || 2}</li>
          <li><strong>Time:</strong> ${formattedTime} UTC</li>
          <li><strong>User Agent:</strong> ${userAgent || 'Unknown'}</li>
        </ul>
      </div>
    `;
  } else if (type === 'ip_blocked') {
    subject = `🚨 [Anza Vault] CRITICAL: IP ${ip} PERMANENTLY BLOCKED`;
    html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #0b0f17; color: #e2e8f0; border-radius: 8px; border: 2px solid #ef4444;">
        <h2 style="color: #ef4444; margin-top: 0;">🚨 PERMANENT IP LOCKOUT TRIGGERED</h2>
        <p>An IP address reached the maximum failed login threshold (${attemptCount || 2} attempts) and has been <strong>permanently blocked</strong>.</p>
        <hr style="border: 1px solid #1e293b;" />
        <ul style="line-height: 1.6;">
          <li><strong>Blocked IP:</strong> ${ip}</li>
          <li><strong>Attempted Target:</strong> ${email}</li>
          <li><strong>Time of Lockout:</strong> ${formattedTime} UTC</li>
          <li><strong>User Agent:</strong> ${userAgent || 'Unknown'}</li>
        </ul>
        <p>All subsequent HTTP requests from this IP are blocked with HTTP 403 Forbidden at the middleware layer.</p>
      </div>
    `;
  }

  try {
    await resend.emails.send({
      from: alertFrom,
      to: alertTo,
      subject,
      html,
    });
    return true;
  } catch (err) {
    console.error('Failed to send Resend email alert:', err);
    return false;
  }
}
