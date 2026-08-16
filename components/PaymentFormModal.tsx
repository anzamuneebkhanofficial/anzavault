'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, CreditCard, Check } from 'lucide-react';
import { toast } from 'sonner';
import { PaymentProvider } from '@/models/PaymentAccount';
import ProviderSelect from '@/components/ProviderSelect';

interface PaymentAccountData {
  id?: string;
  provider: PaymentProvider;
  accountTitle: string;
  accountNumber: string;
  bankName?: string;
  notes?: string;
  currency?: string;
  walletTier?: string;
  linkedCnic?: string;
  isPinned: boolean;
}

interface PaymentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: PaymentAccountData) => Promise<void>;
  initialData?: PaymentAccountData | null;
}

interface PaymentFormValues {
  accountTitle: string;
  accountNumber: string;
  bankName: string;
  notes: string;
  currency: string;
  walletTier: string;
  linkedCnic: string;
  isPinned: boolean;
}

export default function PaymentFormModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: PaymentFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState<PaymentProvider>('jazzcash');

  const { register, handleSubmit, reset } = useForm<PaymentFormValues>({
    mode: 'onSubmit',
    defaultValues: {
      accountTitle: '',
      accountNumber: '',
      bankName: '',
      notes: '',
      currency: 'PKR',
      walletTier: 'Full KYC Tier 2',
      linkedCnic: '',
      isPinned: false,
    },
  });

  useEffect(() => {
    if (initialData) {
      setProvider(initialData.provider || 'jazzcash');
      reset({
        accountTitle: initialData.accountTitle || '',
        accountNumber: initialData.accountNumber || '',
        bankName: initialData.bankName || '',
        notes: initialData.notes || '',
        currency: initialData.currency || 'PKR',
        walletTier: initialData.walletTier || 'Full KYC Tier 2',
        linkedCnic: initialData.linkedCnic || '',
        isPinned: initialData.isPinned || false,
      });
    } else {
      setProvider('jazzcash');
      reset({
        accountTitle: '',
        accountNumber: '',
        bankName: '',
        notes: '',
        currency: 'PKR',
        walletTier: 'Full KYC Tier 2',
        linkedCnic: '',
        isPinned: false,
      });
    }
  }, [initialData, isOpen, reset]);

  if (!isOpen) return null;

  const onSubmitForm = async (values: PaymentFormValues) => {
    if (!values.accountTitle.trim() || !values.accountNumber.trim()) {
      toast.error('Account Title and Account Number / IBAN are required.');
      return;
    }

    setLoading(true);

    try {
      await onSave({
        id: initialData?.id,
        provider,
        accountTitle: values.accountTitle.trim(),
        accountNumber: values.accountNumber.trim(),
        bankName: values.bankName.trim() || undefined,
        notes: values.notes.trim() || undefined,
        currency: (values.currency || 'PKR').trim(),
        walletTier: (values.walletTier || '').trim() || undefined,
        linkedCnic: (values.linkedCnic || '').trim() || undefined,
        isPinned: values.isPinned,
      });
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save payment account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in cursor-pointer overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg max-h-[85vh] sm:max-h-[90vh] my-auto overflow-y-auto rounded-3xl border border-slate-800 bg-[#0F172A] p-5 sm:p-8 shadow-2xl space-y-5 cursor-default scrollbar-thin scrollbar-thumb-slate-800"
      >
        
        {/* Sticky Header */}
        <div className="flex items-center justify-between sticky top-0 bg-[#0F172A]/90 backdrop-blur-md pb-2 z-10 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shrink-0">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-100">
                {initialData ? 'Edit Payment Account' : 'Add Payment Account'}
              </h3>
              <p className="text-xs text-slate-400">Instant One-Click Copy & WhatsApp Quick-Share</p>
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

        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
          
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Payment Provider *</label>
            <ProviderSelect value={provider} onChange={(val) => setProvider(val as PaymentProvider)} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Account Title *</label>
              <input
                type="text"
                {...register('accountTitle')}
                placeholder="e.g. Anza Muneeb Khan"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Currency</label>
              <select
                {...register('currency')}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
              >
                <option value="PKR">PKR (Pakistani Rupee)</option>
                <option value="USD">USD (US Dollar)</option>
                <option value="GBP">GBP (British Pound)</option>
                <option value="EUR">EUR (Euro)</option>
                <option value="AED">AED (UAE Dirham)</option>
                <option value="SAR">SAR (Saudi Riyal)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Account Number / IBAN / Wallet ID *</label>
            <input
              type="text"
              {...register('accountNumber')}
              placeholder="e.g. 03001234567 or PK36MEZN00..."
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs font-mono text-cyan-300 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Bank Name (Optional)</label>
              <input
                type="text"
                {...register('bankName')}
                placeholder="e.g. Meezan Bank Limited"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Linked CNIC (Optional)</label>
              <input
                type="text"
                {...register('linkedCnic')}
                placeholder="e.g. 42101-1234567-9"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs font-mono text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Wallet Tier / Account Level (Optional)</label>
            <input
              type="text"
              {...register('walletTier')}
              placeholder="e.g. Basic Tier 1 / Biometric KYC Level 2"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Notes (Optional)</label>
            <textarea
              rows={2}
              {...register('notes')}
              placeholder="e.g. Primary salary account / JazzCash merchant..."
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isPinned"
              {...register('isPinned')}
              className="h-4 w-4 rounded border-slate-800 bg-slate-950 text-cyan-500 focus:ring-cyan-500 cursor-pointer"
            />
            <label htmlFor="isPinned" className="text-xs font-medium text-slate-300 cursor-pointer">
              ⭐ Pin to Top Favorites (Quick-Share Bar)
            </label>
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-xs font-semibold text-white rounded-xl shadow-lg shadow-cyan-900/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                'Saving Account...'
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  <span>{initialData ? 'Update Account' : 'Save Account'}</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

