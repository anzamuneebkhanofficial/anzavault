'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import VaultHealthCard from '@/components/VaultHealthCard';
import QRCodeModal from '@/components/QRCodeModal';
import { 
  ShieldCheck, 
  KeyRound, 
  CreditCard, 
  Activity, 
  Plus, 
  Lock, 
  ChevronRight, 
  Star, 
  Copy, 
  Check, 
  Share2, 
  QrCode, 
  Layers 
} from 'lucide-react';
import { toast } from 'sonner';

interface Stats {
  totalVault: number;
  totalPayments: number;
  pinnedPayments: number;
  blockedIpsCount: number;
  categoriesCount: Record<string, number>;
}

interface VaultItem {
  id: string;
  title: string;
  password: string;
  notes?: string;
}

interface PaymentAccountItem {
  id: string;
  provider: string;
  accountTitle: string;
  accountNumber: string;
  bankName?: string;
  isPinned: boolean;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalVault: 0,
    totalPayments: 0,
    pinnedPayments: 0,
    blockedIpsCount: 0,
    categoriesCount: {},
  });
  const [vaultEntries, setVaultEntries] = useState<VaultItem[]>([]);
  const [pinnedAccounts, setPinnedAccounts] = useState<PaymentAccountItem[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeQrModal, setActiveQrModal] = useState<{ title: string; subtitle: string; payload: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [vaultRes, paymentRes, auditRes] = await Promise.all([
          fetch('/api/vault'),
          fetch('/api/payment'),
          fetch('/api/audit'),
        ]);

        const vaultData = await vaultRes.json();
        const paymentData = await paymentRes.json();
        const auditData = await auditRes.json();

        const vaultList = vaultData.entries || [];
        const paymentAccounts = paymentData.accounts || [];
        const blockedIps = auditData.blockedIps || [];

        // Count categories
        const counts: Record<string, number> = {};
        vaultList.forEach((e: any) => {
          counts[e.category] = (counts[e.category] || 0) + 1;
        });

        const pinned = paymentAccounts.filter((a: any) => a.isPinned);

        setStats({
          totalVault: vaultList.length,
          totalPayments: paymentAccounts.length,
          pinnedPayments: pinned.length,
          blockedIpsCount: blockedIps.length,
          categoriesCount: counts,
        });

        setVaultEntries(vaultList);
        setPinnedAccounts(pinned);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleCopyPayment = (acc: PaymentAccountItem) => {
    const formatted = `${acc.provider.toUpperCase()}: ${acc.accountNumber} — ${acc.accountTitle}`;
    navigator.clipboard.writeText(formatted);
    setCopiedId(acc.id);
    toast.success(`Copied details for ${acc.accountTitle}!`);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleWhatsappShare = (acc: PaymentAccountItem) => {
    const formatted = `${acc.provider.toUpperCase()}: ${acc.accountNumber} — ${acc.accountTitle}${acc.bankName ? ` (${acc.bankName})` : ''}`;
    const url = `https://wa.me/?text=${encodeURIComponent(formatted)}`;
    window.open(url, '_blank');
    toast.info('Opening WhatsApp share...');
  };

  const handleOpenQr = (acc: PaymentAccountItem) => {
    const payload = `PAYMENT / BANK DETAILS\nProvider: ${acc.provider.toUpperCase()}\nAccount Title: ${acc.accountTitle}\nAccount / IBAN: ${acc.accountNumber}${acc.bankName ? `\nBank: ${acc.bankName}` : ''}`;
    setActiveQrModal({
      title: acc.accountTitle,
      subtitle: `${acc.provider.toUpperCase()} — ${acc.accountNumber}`,
      payload,
    });
    toast.info(`Generated QR Code for ${acc.accountTitle}`);
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Welcome & Security Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-emerald-950/40 p-6 sm:p-8 shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="h-4 w-4" />
                <span>Single-Owner Security Identity Active</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
                Vault Security Overview
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
                All credentials and payment identifiers are encrypted at rest with AES-256-GCM. Search runs strictly against decrypted-in-memory values.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/vault"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-semibold text-white shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Add Record</span>
              </Link>
              <Link
                href="/export-import"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-all cursor-pointer"
              >
                <Layers className="h-4 w-4 text-cyan-400" />
                <span>Backup & Export</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Security Health Card */}
        <VaultHealthCard entries={vaultEntries} />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="glass-panel glass-panel-hover rounded-2xl p-5 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Total Password Vault</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <KeyRound className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-extrabold text-slate-100">{stats.totalVault}</span>
              <span className="text-xs text-slate-400 ml-2">entries stored</span>
            </div>
          </div>

          <div className="glass-panel glass-panel-hover rounded-2xl p-5 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Payment Accounts</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                <CreditCard className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-extrabold text-slate-100">{stats.totalPayments}</span>
              <span className="text-xs text-slate-400 ml-2">quick-share options</span>
            </div>
          </div>

          <div className="glass-panel glass-panel-hover rounded-2xl p-5 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Pinned Favorites</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                <Star className="h-5 w-5 fill-amber-400/20" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-extrabold text-slate-100">{stats.pinnedPayments}</span>
              <span className="text-xs text-slate-400 ml-2">top quick-shares</span>
            </div>
          </div>

          <div className="glass-panel glass-panel-hover rounded-2xl p-5 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Security Status</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <Activity className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-sm font-bold text-emerald-400">Airtight Protection</span>
              {stats.blockedIpsCount > 0 && (
                <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded font-mono">
                  {stats.blockedIpsCount} Blocked IP(s)
                </span>
              )}
            </div>
          </div>

        </div>

        {/* Pinned Payment Accounts Quick-Share Bar */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-400 fill-amber-400/20" />
              <h3 className="text-lg font-bold text-slate-100">Pinned Payment Quick-Shares</h3>
            </div>
            <Link href="/payment" className="text-xs font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
              View All Payments <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {pinnedAccounts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-800 p-8 text-center bg-slate-900/20">
              <p className="text-xs text-slate-400">No pinned payment accounts yet. Pin your JazzCash, EasyPaisa, or Bank IBAN for one-click sharing!</p>
              <Link href="/payment" className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold text-emerald-400 hover:text-emerald-300">
                <Plus className="h-4 w-4" /> Go to Payment Quick-Share
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pinnedAccounts.map((acc) => (
                <div key={acc.id} className="glass-panel glass-panel-hover rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="uppercase text-[10px] font-bold tracking-wider px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        {acc.provider}
                      </span>
                      <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                    </div>
                    <h4 className="font-bold text-slate-100 text-sm">{acc.accountTitle}</h4>
                    <p className="font-mono text-xs text-slate-300 mt-1 select-all">{acc.accountNumber}</p>
                    {acc.bankName && <p className="text-[11px] text-slate-400 mt-0.5">{acc.bankName}</p>}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-1.5">
                    <button
                      onClick={() => handleCopyPayment(acc)}
                      className="flex-1 flex items-center justify-center gap-1 px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    >
                      {copiedId === acc.id ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleWhatsappShare(acc)}
                      className="flex items-center justify-center gap-1 px-2.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                      title="Share via WhatsApp"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      <span>WhatsApp</span>
                    </button>

                    <button
                      onClick={() => handleOpenQr(acc)}
                      className="flex items-center justify-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                      title="Show Barcode / QR Code"
                    >
                      <QrCode className="h-3.5 w-3.5 text-cyan-400" />
                      <span>QR Code</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category Breakdown Matrix (Matches 6 Active Categories) */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Lock className="h-5 w-5 text-emerald-400" />
            Vault Category Distribution
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'Banking & Finance', key: 'banking' },
              { label: 'Email Accounts', key: 'email' },
              { label: 'Social Media', key: 'social' },
              { label: 'Government & NADRA', key: 'government' },
              { label: 'Education & Academic', key: 'education' },
              { label: 'Custom & User-Defined', key: 'custom' },
            ].map((cat) => (
              <div key={cat.key} className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 flex flex-col justify-between gap-2">
                <span className="text-xs font-semibold text-slate-300 truncate">{cat.label}</span>
                <span className="text-xl font-bold font-mono text-emerald-400">
                  {stats.categoriesCount[cat.key] || 0} <span className="text-[10px] font-normal text-slate-500">items</span>
                </span>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* QR Code Modal */}
      {activeQrModal && (
        <QRCodeModal
          isOpen={!!activeQrModal}
          onClose={() => setActiveQrModal(null)}
          title={activeQrModal.title}
          subtitle={activeQrModal.subtitle}
          payload={activeQrModal.payload}
        />
      )}
    </div>
  );
}
