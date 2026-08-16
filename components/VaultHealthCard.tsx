'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { ShieldAlert, CheckCircle2, AlertTriangle, ArrowRight, Activity } from 'lucide-react';

interface VaultHealthCardProps {
  entries: Array<{
    id: string;
    title: string;
    password: string;
    notes?: string;
  }>;
}

export default function VaultHealthCard({ entries }: VaultHealthCardProps) {
  const stats = useMemo(() => {
    if (!entries || entries.length === 0) {
      return { score: 100, weakCount: 0, duplicateCount: 0, total: 0 };
    }

    let weak = 0;
    const passCounts: Record<string, number> = {};

    entries.forEach((item) => {
      const p = item.password || '';
      if (p.length < 10) weak++;
      passCounts[p] = (passCounts[p] || 0) + 1;
    });

    let dupes = 0;
    Object.values(passCounts).forEach((cnt) => {
      if (cnt > 1) dupes += cnt;
    });

    // Score deduction
    const total = entries.length;
    const weakDeduction = (weak / total) * 40;
    const dupeDeduction = (dupes / total) * 40;
    const score = Math.max(10, Math.round(100 - weakDeduction - dupeDeduction));

    return { score, weakCount: weak, duplicateCount: dupes, total };
  }, [entries]);

  if (stats.total === 0) return null;

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-sm">Vault Security Health Score</h3>
            <p className="text-xs text-slate-400">Cryptographic hygiene & audit rating</p>
          </div>
        </div>

        <div className="flex items-baseline gap-1">
          <span className={`text-2xl font-black ${
            stats.score >= 80 ? 'text-emerald-400' : stats.score >= 50 ? 'text-amber-400' : 'text-red-400'
          }`}>
            {stats.score}%
          </span>
          <span className="text-xs font-semibold text-slate-400">/ 100</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${
            stats.score >= 80 ? 'bg-emerald-500' : stats.score >= 50 ? 'bg-amber-500' : 'bg-red-500'
          }`}
          style={{ width: `${stats.score}%` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 pt-1">
        <div className="flex items-center gap-2 rounded-xl bg-slate-950 p-2.5 border border-slate-800 text-xs">
          {stats.weakCount > 0 ? (
            <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          )}
          <div>
            <span className="font-bold text-slate-200">{stats.weakCount}</span>
            <span className="text-slate-400 ml-1">weak passwords</span>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-slate-950 p-2.5 border border-slate-800 text-xs">
          {stats.duplicateCount > 0 ? (
            <ShieldAlert className="h-4 w-4 text-red-400 shrink-0" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          )}
          <div>
            <span className="font-bold text-slate-200">{stats.duplicateCount}</span>
            <span className="text-slate-400 ml-1">reused passwords</span>
          </div>
        </div>
      </div>

      {stats.score < 100 && (
        <Link
          href="/vault"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors pt-1"
        >
          <span>Fix vulnerable credentials in Password Vault</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}
