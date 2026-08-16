'use client';

import { useEffect, useState, useMemo, useDeferredValue } from 'react';
import Navbar from '@/components/Navbar';
import PasswordModal from '@/components/PasswordModal';
import VaultFormModal from '@/components/VaultFormModal';
import QRCodeModal from '@/components/QRCodeModal';
import PasswordGeneratorModal from '@/components/PasswordGeneratorModal';
import { 
  KeyRound, 
  Search, 
  Plus, 
  Copy, 
  Check, 
  Eye, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  Tag, 
  Filter, 
  Lock, 
  QrCode, 
  Sparkles 
} from 'lucide-react';
import { toast } from 'sonner';
import { VaultCategory } from '@/models/VaultEntry';

interface VaultItem {
  id: string;
  title: string;
  category: VaultCategory;
  usernameOrEmail: string;
  password: string;
  url?: string;
  notes?: string;
  metadata?: Record<string, any>;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export default function VaultPage() {
  const [entries, setEntries] = useState<VaultItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearch = useDeferredValue(searchQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<VaultItem | null>(null);
  const [isGenOpen, setIsGenOpen] = useState(false);

  const [revealModalItem, setRevealModalItem] = useState<VaultItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeQrModal, setActiveQrModal] = useState<{ title: string; subtitle: string; payload: string } | null>(null);

  const fetchVault = async () => {
    try {
      const res = await fetch('/api/vault');
      if (res.ok) {
        const data = await res.json();
        setEntries(data.entries || []);
      }
    } catch (err) {
      console.error('Error fetching vault entries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVault();
  }, []);

  // Collect all unique tags across entries
  const allTags = useMemo(() => {
    const set = new Set<string>();
    entries.forEach((e) => e.tags?.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [entries]);

  // Decrypted-in-memory deferred search & filter for 120 FPS typing speed
  const filteredEntries = useMemo(() => {
    return entries.filter((item) => {
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      // Tag filter
      if (selectedTag !== 'all' && !item.tags?.includes(selectedTag)) {
        return false;
      }
      // Free text search with deferred value
      if (deferredSearch.trim()) {
        const q = deferredSearch.toLowerCase().trim();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchUser = item.usernameOrEmail.toLowerCase().includes(q);
        const matchUrl = item.url?.toLowerCase().includes(q);
        const matchTags = item.tags?.some((t) => t.toLowerCase().includes(q));
        const matchMeta = JSON.stringify(item.metadata || {}).toLowerCase().includes(q);
        return matchTitle || matchUser || matchUrl || matchTags || matchMeta;
      }
      return true;
    });
  }, [entries, deferredSearch, selectedCategory, selectedTag]);

  const handleCopyPassword = (id: string, pass: string) => {
    navigator.clipboard.writeText(pass);
    setCopiedId(id);
    toast.success('Password copied to clipboard! Auto-clears in 30s.');
    setTimeout(() => {
      setCopiedId(null);
      setTimeout(() => {
        navigator.clipboard.writeText('');
      }, 30000);
    }, 2000);
  };

  const handleOpenQr = (item: VaultItem) => {
    const payload = `VAULT RECORD [${item.category.toUpperCase()}]\nTitle: ${item.title}\nUser/ID: ${item.usernameOrEmail}\nPassword: ${item.password}${item.url ? `\nURL: ${item.url}` : ''}`;
    setActiveQrModal({
      title: item.title,
      subtitle: item.usernameOrEmail,
      payload,
    });
    toast.info(`Generated QR Code for ${item.title}`);
  };

  const handleSaveEntry = async (formData: any) => {
    const isEdit = !!formData.id;
    const url = isEdit ? `/api/vault/${formData.id}` : '/api/vault';
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

    await fetchVault();
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete credential "${title}"?`)) return;

    try {
      const res = await fetch(`/api/vault/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success(`Record "${title}" deleted successfully.`);
        await fetchVault();
      } else {
        toast.error('Failed to delete record');
      }
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Delete failed');
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
              <KeyRound className="h-6 w-6 text-emerald-400" />
              Password & Identity Vault
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              AES-256-GCM encrypted at rest. Live search runs in memory across titles, IDs, IBANs, CNIC & tags.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
            <button
              onClick={() => setIsGenOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-cyan-300 border border-slate-700 rounded-xl transition-all cursor-pointer"
            >
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <span>Password Generator</span>
            </button>

            <button
              onClick={() => {
                setEditingItem(null);
                setIsFormOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-semibold text-white rounded-xl shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Record</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="glass-panel rounded-2xl p-4 border border-slate-800 space-y-4">
          <div className="flex flex-col md:flex-row items-center gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, username, IBAN, CNIC, degree, or tag..."
                className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {/* Category Dropdown Filter */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Filter className="h-4 w-4 text-slate-400 shrink-0" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full md:w-56 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
              >
                <option value="all">All Categories</option>
                <option value="banking">Banking & Finance</option>
                <option value="email">Email Accounts</option>
                <option value="social">Social Media</option>
                <option value="government">Government & NADRA</option>
                <option value="education">Education & Academic</option>
                <option value="custom">Custom & User-Defined</option>
              </select>
            </div>

            {/* Tag Filter */}
            {allTags.length > 0 && (
              <div className="flex items-center gap-2 w-full md:w-auto">
                <Tag className="h-4 w-4 text-slate-400 shrink-0" />
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="w-full md:w-40 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="all">All Tags</option>
                  {allTags.map((tag) => (
                    <option key={tag} value={tag}>
                      #{tag}
                    </option>
                  ))}
                </select>
              </div>
            )}

          </div>
        </div>

        {/* Credentials List Grid */}
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500">Loading encrypted vault...</div>
        ) : filteredEntries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center bg-slate-900/20">
            <Lock className="mx-auto h-8 w-8 text-slate-600 mb-2" />
            <p className="text-sm font-semibold text-slate-300">No records found</p>
            <p className="text-xs text-slate-500 mt-1">
              {searchQuery || selectedCategory !== 'all' ? 'Try clearing your search filters.' : 'Click "Add Record" to store your first password or account.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEntries.map((item) => {
              const meta = item.metadata || {};
              const categoryBadgeLabel = meta.customCategoryName || item.category;

              return (
                <div
                  key={item.id}
                  className="glass-panel glass-panel-hover rounded-2xl p-5 border border-slate-800 flex flex-col justify-between overflow-hidden"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
                      <span className="uppercase text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 truncate max-w-[150px]">
                        {categoryBadgeLabel}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenQr(item)}
                          className="p-1 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
                          title="Generate QR Code"
                        >
                          <QrCode className="h-3.5 w-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            setEditingItem(item);
                            setIsFormOpen(true);
                          }}
                          className="p-1 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                          title="Edit entry"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.title)}
                          className="p-1 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                          title="Delete entry"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-bold text-slate-100 text-base truncate">{item.title}</h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5 select-all truncate">{item.usernameOrEmail}</p>

                    {/* Category-Specific Preview Badges */}
                    {meta.bankName && (
                      <p className="text-[11px] text-emerald-300 font-medium mt-1 truncate">
                        Bank: {meta.bankName} {meta.accountNumberIban ? `(${meta.accountNumberIban})` : ''}
                      </p>
                    )}
                    {meta.cnicNumber && (
                      <p className="text-[11px] text-amber-300 font-mono mt-1 truncate">
                        CNIC/ID: {meta.cnicNumber}
                      </p>
                    )}
                    {meta.degreeName && (
                      <p className="text-[11px] text-purple-300 font-medium mt-1 truncate">
                        Degree: {meta.degreeName} {meta.institutionName ? `@ ${meta.institutionName}` : ''}
                      </p>
                    )}

                    {item.url && (
                      <a
                        href={item.url.startsWith('http') ? item.url : `https://${item.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:underline mt-1.5 max-w-full truncate"
                      >
                        <span className="truncate">{item.url.replace(/^https?:\/\//, '')}</span>
                        <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                    )}

                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {item.tags.map((t) => (
                          <span key={t} className="text-[10px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded truncate max-w-[120px]">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setRevealModalItem(item)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Reveal</span>
                    </button>

                    <button
                      onClick={() => handleCopyPassword(item.id, item.password)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy Pass</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>

      {/* Reveal Password Modal */}
      {revealModalItem && (
        <PasswordModal
          isOpen={!!revealModalItem}
          onClose={() => setRevealModalItem(null)}
          title={revealModalItem.title}
          category={revealModalItem.category}
          usernameOrEmail={revealModalItem.usernameOrEmail}
          passwordText={revealModalItem.password}
          notesText={revealModalItem.notes}
          metadataObj={revealModalItem.metadata}
        />
      )}

      {/* Form Modal */}
      <VaultFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveEntry}
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

      {/* Password Generator Standalone Modal */}
      {isGenOpen && (
        <PasswordGeneratorModal
          isOpen={isGenOpen}
          onClose={() => setIsGenOpen(false)}
        />
      )}
    </div>
  );
}
