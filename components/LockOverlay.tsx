'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Lock, KeyRound, ShieldCheck, X } from 'lucide-react';
import { toast } from 'sonner';

interface LockOverlayProps {
  isLocked: boolean;
  onUnlock: () => void;
}

interface FormValues {
  passcode: string;
}

export default function LockOverlay({ isLocked, onUnlock }: LockOverlayProps) {
  const [error, setError] = useState(false);
  const { register, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: { passcode: '' },
  });

  if (!isLocked) return null;

  const handleUnlockAttempt = (values: FormValues) => {
    if (values.passcode.trim().length >= 4) {
      setError(false);
      reset();
      toast.success('Session unlocked!');
      onUnlock();
    } else {
      setError(true);
      toast.error('Passcode must be at least 4 characters.');
    }
  };

  return (
    <div
      onClick={onUnlock}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-4 animate-in fade-in duration-300 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm rounded-3xl border border-slate-800 bg-[#0F172A] p-8 shadow-2xl text-center space-y-6 cursor-default"
      >
        {/* Close X Button */}
        <button
          onClick={onUnlock}
          className="absolute top-4 right-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors cursor-pointer"
          title="Close lock screen"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
          <Lock className="h-8 w-8 animate-bounce" />
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-slate-100">Anza Vault Session Lock</h2>
          <p className="text-xs text-slate-400">
            Enter your owner passcode (e.g. <strong className="text-emerald-400">anza123</strong>) or click ✖ to close.
          </p>
        </div>

        <form onSubmit={handleSubmit(handleUnlockAttempt)} className="space-y-4">
          <div className="relative">
            <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="password"
              {...register('passcode')}
              placeholder="Enter Passcode (anza123)..."
              className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-10 pr-4 py-3 text-center text-sm font-bold text-slate-100 tracking-widest placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
              autoFocus
            />
          </div>

          {error && <p className="text-xs text-red-400">Please enter at least 4 characters to unlock.</p>}

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Unlock Vault Session</span>
          </button>
        </form>

        <div className="pt-2 border-t border-slate-800/80">
          <button
            onClick={onUnlock}
            className="text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
          >
            Click anywhere outside or ✖ to Dismiss Lock
          </button>
        </div>

      </div>
    </div>
  );
}
