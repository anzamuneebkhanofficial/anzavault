'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { 
  X, 
  KeyRound, 
  RefreshCw, 
  Copy, 
  Check, 
  ShieldCheck 
} from 'lucide-react';
import { toast } from 'sonner';

interface PasswordGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPassword?: (password: string) => void;
}

interface GeneratorFormValues {
  length: number;
  useUpper: boolean;
  useLower: boolean;
  useNumbers: boolean;
  useSymbols: boolean;
  isPassphrase: boolean;
  wordCount: number;
}

const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

const WORDS = [
  'vault', 'shield', 'cipher', 'matrix', 'quantum', 'argon', 'titan', 'phoenix',
  'nexus', 'apex', 'solaris', 'polaris', 'aurora', 'hyper', 'starlight', 'cyber',
  'fortress', 'sentinel', 'anchor', 'harbor', 'zenith', 'pulse', 'beacon', 'emerald'
];

export default function PasswordGeneratorModal({
  isOpen,
  onClose,
  onSelectPassword,
}: PasswordGeneratorModalProps) {
  const [copied, setCopied] = useState(false);
  const [seed, setSeed] = useState(0);

  const { register, watch, setValue } = useForm<GeneratorFormValues>({
    defaultValues: {
      length: 18,
      useUpper: true,
      useLower: true,
      useNumbers: true,
      useSymbols: true,
      isPassphrase: false,
      wordCount: 4,
    },
  });

  const length = watch('length');
  const useUpper = watch('useUpper');
  const useLower = watch('useLower');
  const useNumbers = watch('useNumbers');
  const useSymbols = watch('useSymbols');
  const isPassphrase = watch('isPassphrase');
  const wordCount = watch('wordCount');

  const generatedPassword = useMemo(() => {
    if (isPassphrase) {
      const selectedWords: string[] = [];
      for (let i = 0; i < wordCount; i++) {
        const randIndex = Math.floor(Math.random() * WORDS.length);
        selectedWords.push(WORDS[randIndex]);
      }
      return selectedWords.join('-');
    }

    let charset = '';
    if (useUpper) charset += UPPERCASE;
    if (useLower) charset += LOWERCASE;
    if (useNumbers) charset += NUMBERS;
    if (useSymbols) charset += SYMBOLS;

    if (!charset) charset = LOWERCASE + NUMBERS;

    let res = '';
    const array = new Uint32Array(length);
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(array);
      for (let i = 0; i < length; i++) {
        res += charset[array[i] % charset.length];
      }
    } else {
      for (let i = 0; i < length; i++) {
        res += charset[Math.floor(Math.random() * charset.length)];
      }
    }
    return res;
  }, [length, useUpper, useLower, useNumbers, useSymbols, isPassphrase, wordCount, seed]);

  // Calculate Entropy strength
  const strengthInfo = useMemo(() => {
    let poolSize = 0;
    if (isPassphrase) {
      poolSize = WORDS.length;
      const entropy = wordCount * Math.log2(poolSize);
      return { score: entropy, label: 'Military-Grade Passphrase', color: 'emerald' };
    }

    if (useUpper) poolSize += 26;
    if (useLower) poolSize += 26;
    if (useNumbers) poolSize += 10;
    if (useSymbols) poolSize += 26;

    const entropy = length * Math.log2(poolSize || 10);
    if (entropy < 45) return { score: entropy, label: 'Weak', color: 'red' };
    if (entropy < 65) return { score: entropy, label: 'Fair', color: 'amber' };
    if (entropy < 85) return { score: entropy, label: 'Strong', color: 'cyan' };
    return { score: entropy, label: 'Military Grade', color: 'emerald' };
  }, [length, useUpper, useLower, useNumbers, useSymbols, isPassphrase, wordCount]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPassword);
    setCopied(true);
    toast.success('Generated password copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUsePassword = () => {
    if (onSelectPassword) {
      onSelectPassword(generatedPassword);
    }
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 cursor-pointer overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg max-h-[85vh] sm:max-h-[90vh] my-auto overflow-y-auto rounded-3xl border border-slate-800 bg-[#0F172A] p-5 sm:p-6 shadow-2xl space-y-5 cursor-default scrollbar-thin scrollbar-thumb-slate-800"
      >
        
        {/* Sticky Header */}
        <div className="flex items-center justify-between sticky top-0 bg-[#0F172A]/90 backdrop-blur-md pb-2 z-10 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-lg">Password Generator</h3>
              <p className="text-xs text-slate-400">High-entropy cryptographic random password engine</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors cursor-pointer shrink-0"
            title="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Display Banner */}
        <div className="relative rounded-2xl border border-emerald-500/30 bg-slate-950 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Generated Result
            </span>

            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
              strengthInfo.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
              strengthInfo.color === 'cyan' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
              strengthInfo.color === 'amber' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
              'bg-red-500/10 text-red-400 border-red-500/20'
            }`}>
              {strengthInfo.label} ({Math.round(strengthInfo.score)} bits)
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-lg font-bold text-emerald-300 break-all select-all">
              {generatedPassword}
            </span>

            <button
              onClick={() => setSeed((s) => s + 1)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors shrink-0 cursor-pointer"
              title="Regenerate"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800">
          <button
            type="button"
            onClick={() => setValue('isPassphrase', false)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              !isPassphrase ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Random Characters
          </button>
          <button
            type="button"
            onClick={() => setValue('isPassphrase', true)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              isPassphrase ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Word Passphrase
          </button>
        </div>

        {/* Controls Form */}
        <form className="space-y-4">
          {!isPassphrase ? (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
                  <span>Password Length</span>
                  <span className="font-mono text-emerald-400 font-bold">{length} characters</span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="64"
                  {...register('length', { valueAsNumber: true })}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-medium text-slate-300">
                <label className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 p-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('useUpper')}
                    className="rounded accent-emerald-500"
                  />
                  <span>Uppercase (A-Z)</span>
                </label>

                <label className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 p-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('useLower')}
                    className="rounded accent-emerald-500"
                  />
                  <span>Lowercase (a-z)</span>
                </label>

                <label className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 p-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('useNumbers')}
                    className="rounded accent-emerald-500"
                  />
                  <span>Numbers (0-9)</span>
                </label>

                <label className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 p-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('useSymbols')}
                    className="rounded accent-emerald-500"
                  />
                  <span>Symbols (!@#$)</span>
                </label>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
                <span>Word Count</span>
                <span className="font-mono text-emerald-400 font-bold">{wordCount} words</span>
              </div>
              <input
                type="range"
                min="3"
                max="8"
                {...register('wordCount', { valueAsNumber: true })}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>
          )}
        </form>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4 text-slate-300 shadow-sm" />}
            <span>{copied ? 'Copied!' : 'Copy Password'}</span>
          </button>

          <button
            type="button"
            onClick={handleUsePassword}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Use Password</span>
          </button>
        </div>

      </div>
    </div>
  );
}
