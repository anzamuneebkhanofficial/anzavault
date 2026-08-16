'use client';

import { useEffect, useState, useMemo, useDeferredValue } from 'react';
import Navbar from '@/components/Navbar';
import PaymentFormModal from '@/components/PaymentFormModal';
import QRCodeModal from '@/components/QRCodeModal';
import { 
  CreditCard, 
  Search, 
  Plus, 
  Copy, 
  Check, 
  Share2, 
  Mail, 
  Star, 
  Edit3, 
  Trash2, 
  Filter, 
  QrCode 
} from 'lucide-react';
import { toast } from 'sonner';
import { PaymentProvider } from '@/models/PaymentAccount';

interface PaymentItem {
  id: string;
  provider: PaymentProvider;
  accountTitle: string;
  accountNumber: string;
  bankName?: string;
  notes?: string;
  currency?: string;
  walletTier?: string;
  linkedCnic?: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function PaymentPage() {
  const [accounts, setAccounts] = useState<PaymentItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearch = useDeferredValue(searchQuery);
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PaymentItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeQrModal, setActiveQrModal] = useState<{ title: string; subtitle: string; payload: string } | null>(null);

  const fetchAccounts = async () => {
    try {
      const res = await fetch('/api/payment');
      if (res.ok) {
        const data = await res.json();
        setAccounts(data.accounts || []);
      }
    } catch (err) {
      console.error('Error fetching payment accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const filteredAccounts = useMemo(() => {
    return accounts.filter((item) => {
      if (selectedProvider !== 'all' && item.provider !== selectedProvider) {
        return false;
      }
      if (deferredSearch.trim()) {
        const q = deferredSearch.toLowerCase().trim();
        const matchTitle = item.accountTitle.toLowerCase().includes(q);
        const matchNum = item.accountNumber.toLowerCase().includes(q);
        const matchBank = item.bankName?.toLowerCase().includes(q);
        const matchProv = item.provider.toLowerCase().includes(q);
        const matchCnic = item.linkedCnic?.toLowerCase().includes(q);
        return matchTitle || matchNum || matchBank || matchProv || matchCnic;
      }
      return true;
    });
  }, [accounts, deferredSearch, selectedProvider]);

  const handleCopyFormatted = (item: PaymentItem) => {
    const currStr = item.currency && item.currency !== 'PKR' ? ` [${item.currency}]` : '';
    const formatted = `${item.provider.toUpperCase()}${currStr}: ${item.accountNumber} — ${item.accountTitle}`;
    navigator.clipboard.writeText(formatted);
    setCopiedId(item.id);
    toast.success(`Copied payment details for ${item.accountTitle}!`);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleWhatsappShare = (item: PaymentItem) => {
    const currStr = item.currency && item.currency !== 'PKR' ? ` (${item.currency})` : '';
    const formatted = `${item.provider.toUpperCase()}${currStr}: ${item.accountNumber} — ${item.accountTitle}${item.bankName ? ` [${item.bankName}]` : ''}`;
    const url = `https://wa.me/?text=${encodeURIComponent(formatted)}`;
    window.open(url, '_blank');
    toast.info('Opening WhatsApp share...');
  };

  const handleEmailShare = (item: PaymentItem) => {
    const currStr = item.currency ? ` (${item.currency})` : '';
    const formatted = `Payment Details:\nProvider: ${item.provider.toUpperCase()}${currStr}\nAccount Title: ${item.accountTitle}\nAccount / IBAN: ${item.accountNumber}${item.bankName ? `\nBank: ${item.bankName}` : ''}${item.linkedCnic ? `\nLinked CNIC: ${item.linkedCnic}` : ''}`;
    const url = `mailto:?subject=${encodeURIComponent(`Payment Details - ${item.accountTitle}`)}&body=${encodeURIComponent(formatted)}`;
    window.open(url, '_blank');
    toast.info('Opening Email client...');
  };

  const handleOpenQr = (item: PaymentItem) => {
    const payload = `PAYMENT / BANK DETAILS\nProvider: ${item.provider.toUpperCase()}\nAccount Title: ${item.accountTitle}\nAccount / IBAN: ${item.accountNumber}${item.bankName ? `\nBank: ${item.bankName}` : ''}${item.currency ? `\nCurrency: ${item.currency}` : ''}`;
    setActiveQrModal({
      title: item.accountTitle,
      subtitle: `${item.provider.toUpperCase()} — ${item.accountNumber}`,
      payload,
    });
    toast.info(`Generated QR Code for ${item.accountTitle}`);
  };

  const handleTogglePin = async (id: string, currentPinned: boolean) => {
    try {
      const res = await fetch(`/api/payment/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned: !currentPinned }),
      });
      if (res.ok) {
        toast.success(currentPinned ? 'Account unpinned.' : 'Account pinned to top favorites!');
        await fetchAccounts();
      }
    } catch (err) {
      console.error('Error toggling pin:', err);
    }
  };

  const handleSaveAccount = async (formData: any) => {
    const isEdit = !!formData.id;
    const url = isEdit ? `/api/payment/${formData.id}` : '/api/payment';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Save failed');
    }

    toast.success(isEdit ? 'Payment info updated successfully!' : 'New payment account added!');
    await fetchAccounts();
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete payment account "${title}"?`)) return;

    try {
      const res = await fetch(`/api/payment/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success(`Deleted payment account "${title}".`);
        await fetchAccounts();
      } else {
        toast.error('Failed to delete payment account.');
      }
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Delete failed.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2.5">
              <CreditCard className="h-6 w-6 text-cyan-400" />
              Payment Info Quick-Share
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              One-click formatted copy, instant WhatsApp & email account sharing, plus automatic barcode/QR code generation.
            </p>
          </div>

          <button
            onClick={() => {
              setEditingItem(null);
              setIsFormOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-xs font-semibold text-white rounded-xl shadow-lg shadow-cyan-950/40 transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Add Payment Info</span>
          </button>
        </div>

        {/* Search & Provider Filter Bar */}
        <div className="glass-panel rounded-2xl p-4 border border-slate-800 space-y-4">
          <div className="flex flex-col md:flex-row items-center gap-3">
            
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search payment info by account title, IBAN, provider, or bank..."
                className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <Filter className="h-4 w-4 text-slate-400 shrink-0" />
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="w-full md:w-48 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
              >
                <option value="all">All Providers</option>
                <option value="jazzcash">JazzCash</option>
                <option value="easypaisa">EasyPaisa</option>
                <option value="bank">Bank Transfer</option>
                <option value="meezan">Meezan Bank</option>
                <option value="ubl">UBL</option>
                <option value="sadapay">SadaPay</option>
                <option value="nayapay">NayaPay</option>
                <option value="card">Card Details</option>
                <option value="other">Other</option>
              </select>
            </div>

          </div>
        </div>

        {/* Accounts List Grid */}
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500">Loading payment accounts...</div>
        ) : filteredAccounts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center bg-slate-900/20">
            <CreditCard className="mx-auto h-8 w-8 text-slate-600 mb-2" />
            <p className="text-sm font-semibold text-slate-300">No payment accounts found</p>
            <p className="text-xs text-slate-500 mt-1">
              Click "Add Payment Info" to add your JazzCash, EasyPaisa, or Bank IBAN for instant sharing.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAccounts.map((item) => (
              <div
                key={item.id}
                className={`glass-panel glass-panel-hover rounded-2xl p-5 border flex flex-col justify-between transition-all overflow-hidden ${
                  item.isPinned ? 'border-cyan-500/40 bg-gradient-to-b from-slate-900 to-cyan-950/20' : 'border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="uppercase text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 truncate max-w-[140px]">
                      {item.provider}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenQr(item)}
                        className="p-1 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
                        title="Generate QR Code"
                      >
                        <QrCode className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => handleTogglePin(item.id, item.isPinned)}
                        className={`p-1 transition-colors cursor-pointer ${
                          item.isPinned ? 'text-amber-400 hover:text-amber-300' : 'text-slate-500 hover:text-amber-400'
                        }`}
                        title={item.isPinned ? 'Unpin favorite' : 'Pin to top favorites'}
                      >
                        <Star className={`h-4 w-4 ${item.isPinned ? 'fill-amber-400' : ''}`} />
                      </button>

                      <button
                        onClick={() => {
                          setEditingItem(item);
                          setIsFormOpen(true);
                        }}
                        className="p-1 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                        title="Edit account"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => handleDelete(item.id, item.accountTitle)}
                        className="p-1 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                        title="Delete account"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-slate-100 text-base truncate">{item.accountTitle}</h3>
                  <p className="font-mono text-sm text-cyan-300 font-semibold mt-1 select-all tracking-wide truncate">
                    {item.accountNumber}
                  </p>
                  {item.bankName && <p className="text-xs text-slate-400 mt-0.5 truncate">{item.bankName}</p>}
                  {item.notes && <p className="text-[11px] text-slate-500 italic mt-2 line-clamp-2">{item.notes}</p>}
                </div>

                {/* Quick Share Buttons Bar */}
                <div className="mt-5 pt-3 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  <button
                    onClick={() => handleCopyFormatted(item)}
                    className="flex items-center justify-center gap-1 px-2 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    title="Copy info"
                  >
                    {copiedId === item.id ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    <span className="text-[10px]">{copiedId === item.id ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={() => handleWhatsappShare(item)}
                    className="flex items-center justify-center gap-1 px-2 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    title="Share via WhatsApp"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    <span className="text-[10px]">WhatsApp</span>
                  </button>

                  <button
                    onClick={() => handleEmailShare(item)}
                    className="flex items-center justify-center gap-1 px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    title="Share via Email"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    <span className="text-[10px]">Email</span>
                  </button>

                  <button
                    onClick={() => handleOpenQr(item)}
                    className="flex items-center justify-center gap-1 px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    title="Show Barcode / QR Code"
                  >
                    <QrCode className="h-3.5 w-3.5 text-cyan-400" />
                    <span className="text-[10px]">QR Code</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      {/* Payment Form Modal */}
      <PaymentFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveAccount}
        initialData={editingItem}
      />

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
