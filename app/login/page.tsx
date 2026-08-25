'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Lock, KeyRound, AlertTriangle, ArrowRight, ShieldCheck, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface LoginFormValues {
  email: string;
  password: string;
  totpCode: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [requiresTotp, setRequiresTotp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isBlocked, setIsBlocked] = useState(false);
  const [attemptsInfo, setAttemptsInfo] = useState<{ used: number; max: number } | null>(null);

  const { register, handleSubmit } = useForm<LoginFormValues>({
    mode: 'onSubmit',
    defaultValues: {
      email: 'anza@example.com',
      password: '',
      totpCode: '',
    },
  });

  const onSubmitForm = async (values: LoginFormValues) => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
          totpCode: requiresTotp ? values.totpCode : undefined,
        }),
      });

      const data = await res.json();

      if (res.status === 403) {
        setIsBlocked(true);
        setError(data.error || 'Access Denied: Permanent IP Lockout');
        toast.error('Permanent IP Lockout triggered');
        return;
      }

      if (!res.ok) {
        setError(data.error || 'Authentication failed');
        toast.error(data.error || 'Authentication failed');
        if (data.attemptsUsed !== undefined) {
          setAttemptsInfo({ used: data.attemptsUsed, max: data.maxAttempts || 2 });
        }
        return;
      }

      if (data.requiresTotp) {
        setRequiresTotp(true);
        toast.info('Credentials verified! Please enter your 6-digit 2FA code.');
        return;
      }

      if (data.success) {
        toast.success('Authentication successful! Welcome to Anza Vault.');
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err: any) {
      const msg = err.message || 'An unexpected error occurred during login';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 bg-[#0B0F17] relative overflow-hidden">
      
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 text-emerald-400 mb-4 shadow-xl shadow-emerald-950/50">
            <Lock className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Anza Vault</h1>
          <p className="text-xs text-slate-400 mt-1">Single-User Encrypted Security Portal</p>
        </div>

        {/* IP Blocked Banner */}
        {isBlocked ? (
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-6 text-center shadow-2xl backdrop-blur-md">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20 text-red-400 mb-3">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-red-400 mb-1">Access Permanently Locked</h3>
            <p className="text-xs text-slate-300 mb-4">
              Your IP address exceeded the maximum allowed failed attempts ({attemptsInfo?.max || 2}-Strike Rule).
            </p>
            <div className="rounded-xl bg-slate-950/80 p-3 text-[11px] font-mono text-slate-400 border border-red-500/20">
              HTTP 403 Forbidden — Blocked at Middleware Layer
            </div>
          </div>
        ) : (
          <div className="glass-panel rounded-2xl p-6 sm:p-8 shadow-2xl">
            
            {/* Security Notice Pill */}
            <div className="mb-6 flex items-center justify-between rounded-xl bg-slate-900/80 border border-slate-800 px-3.5 py-2.5 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Strict 2-Strike IP Lockout</span>
              </div>
              <span className="text-[10px] font-mono bg-slate-800 px-2 py-0.5 rounded text-emerald-400">
                Argon2id + 2FA
              </span>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-400 flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <p>{error}</p>
                  {attemptsInfo && (
                    <p className="mt-1 font-semibold text-red-300">
                      Failed attempts: {attemptsInfo.used} / {attemptsInfo.max}
                    </p>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
              
              {!requiresTotp ? (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Owner Identity Email
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        {...register('email')}
                        placeholder="anza@example.com"
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Master Vault Password
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        {...register('password')}
                        placeholder="••••••••••••••••"
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-4 pr-11 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer p-1"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4 text-emerald-400" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300 flex items-center gap-2">
                    <KeyRound className="h-4 w-4 shrink-0" />
                    <span>Credentials verified. Enter 6-digit TOTP from your authenticator app.</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      2FA TOTP Code / Backup Code
                    </label>
                    <input
                      type="text"
                      required
                      autoFocus
                      maxLength={10}
                      {...register('totpCode')}
                      placeholder="000 000"
                      className="w-full rounded-xl border border-emerald-500/40 bg-slate-950 px-4 py-3 text-center text-lg font-mono tracking-widest text-emerald-400 placeholder-slate-600 focus:border-emerald-400 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 py-3 px-4 text-sm font-semibold text-white shadow-lg shadow-emerald-950/50 transition-all duration-150 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <span>{requiresTotp ? 'Verify 2FA & Access Vault' : 'Authenticate Master Identity'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

            </form>

            <div className="mt-6 text-center">
              <p className="text-[11px] text-slate-400">
                Unauthorized access is strictly prohibited. Every login attempt is audited and logged with IP fingerprinting.
              </p>
            </div>

          </div>
        )}

      </div>
    </main>
  );
}
