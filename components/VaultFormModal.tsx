'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { 
  X, 
  KeyRound, 
  RefreshCw, 
  Check, 
  Sparkles, 
  Building2, 
  Mail, 
  Share2, 
  Landmark, 
  GraduationCap, 
  SlidersHorizontal, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  Paperclip, 
  FileText 
} from 'lucide-react';
import { toast } from 'sonner';
import { VaultCategory } from '@/models/VaultEntry';
import PasswordGeneratorModal from '@/components/PasswordGeneratorModal';

import { PAKISTANI_BANKS } from '@/lib/constants/pakistaniBanks';

interface CustomFieldItem {
  key: string;
  value: string;
}

interface AttachedFileItem {
  name: string;
  type: string;
  dataUrl: string;
  size: number;
}

interface VaultEntryData {
  id?: string;
  title: string;
  category: VaultCategory;
  usernameOrEmail: string;
  password: string;
  url?: string;
  notes?: string;
  metadata?: Record<string, any>;
  tags?: string[];
}

interface VaultFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: VaultEntryData) => Promise<void>;
  initialData?: VaultEntryData | null;
}

interface FormValues {
  title: string;
  usernameOrEmail: string;
  password: string;
  url: string;
  notes: string;
  bankName: string;
  accountNumberIban: string;
  swiftCode: string;
  atmPin: string;
  branchCity: string;
  routingNumber: string;
  sortCode: string;
  accountCurrency: string;
  accountType: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
  bankCategory: string;
  emailProvider: string;
  recoveryEmail: string;
  socialPlatform: string;
  socialHandle: string;
  docType: string;
  cnicNumber: string;
  fullNameOnDoc: string;
  expiryDate: string;
  referenceNo: string;
  degreeName: string;
  institutionName: string;
  studentRollNo: string;
  gradYearCgpa: string;
  certBody: string;
  walletNetwork: string;
  exchangeName: string;
  customCategoryName: string;
}

const CATEGORIES: { label: string; value: VaultCategory; icon: any }[] = [
  { label: 'Banking & Finance', value: 'banking', icon: Building2 },
  { label: 'Email Accounts', value: 'email', icon: Mail },
  { label: 'Social Media', value: 'social', icon: Share2 },
  { label: 'Government & NADRA', value: 'government', icon: Landmark },
  { label: 'Education & Academic', value: 'education', icon: GraduationCap },
  { label: 'Custom & User-Defined', value: 'custom', icon: SlidersHorizontal },
];

export default function VaultFormModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: VaultFormModalProps) {
  const [category, setCategory] = useState<VaultCategory>('banking');
  const [showPassword, setShowPassword] = useState(false);
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isGenOpen, setIsGenOpen] = useState(false);

  // Custom Fields & Attachments
  const [customFields, setCustomFields] = useState<CustomFieldItem[]>([]);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFileItem[]>([]);

  // React Hook Form for 120 FPS Uncontrolled Smooth Typing Speed
  const { register, handleSubmit, reset, setValue } = useForm<FormValues>({
    mode: 'onSubmit',
    defaultValues: {
      title: '',
      usernameOrEmail: '',
      password: '',
      url: '',
      notes: '',
      bankName: '',
      accountNumberIban: '',
      swiftCode: '',
      atmPin: '',
      branchCity: '',
      routingNumber: '',
      sortCode: '',
      accountCurrency: 'PKR',
      accountType: 'Savings Account',
      cardNumber: '',
      cardExpiry: '',
      cardCvv: '',
      bankCategory: 'private',
      emailProvider: 'Gmail',
      recoveryEmail: '',
      socialPlatform: 'Instagram',
      socialHandle: '',
      docType: 'CNIC / National ID',
      cnicNumber: '',
      fullNameOnDoc: '',
      expiryDate: '',
      referenceNo: '',
      degreeName: '',
      institutionName: '',
      studentRollNo: '',
      gradYearCgpa: '',
      certBody: '',
      walletNetwork: 'Ethereum (ERC-20)',
      exchangeName: 'Binance',
      customCategoryName: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      setCategory(initialData.category || 'banking');
      setTags(initialData.tags || []);

      const meta = initialData.metadata || {};
      reset({
        title: initialData.title || '',
        usernameOrEmail: initialData.usernameOrEmail || '',
        password: initialData.password || '',
        url: initialData.url || '',
        notes: initialData.notes || '',
        bankName: meta.bankName || '',
        accountNumberIban: meta.accountNumberIban || '',
        swiftCode: meta.swiftCode || '',
        atmPin: meta.atmPin || '',
        branchCity: meta.branchCity || '',
        routingNumber: meta.routingNumber || '',
        sortCode: meta.sortCode || '',
        accountCurrency: meta.accountCurrency || 'PKR',
        accountType: meta.accountType || 'Savings Account',
        cardNumber: meta.cardNumber || '',
        cardExpiry: meta.cardExpiry || '',
        cardCvv: meta.cardCvv || '',
        bankCategory: meta.bankCategory || 'private',
        emailProvider: meta.emailProvider || 'Gmail',
        recoveryEmail: meta.recoveryEmail || '',
        socialPlatform: meta.socialPlatform || 'Instagram',
        socialHandle: meta.socialHandle || '',
        docType: meta.docType || 'CNIC / National ID',
        cnicNumber: meta.cnicNumber || '',
        fullNameOnDoc: meta.fullNameOnDoc || '',
        expiryDate: meta.expiryDate || '',
        referenceNo: meta.referenceNo || '',
        degreeName: meta.degreeName || '',
        institutionName: meta.institutionName || '',
        studentRollNo: meta.studentRollNo || '',
        gradYearCgpa: meta.gradYearCgpa || '',
        certBody: meta.certBody || '',
        walletNetwork: meta.walletNetwork || 'Ethereum (ERC-20)',
        exchangeName: meta.exchangeName || 'Binance',
        customCategoryName: meta.customCategoryName || '',
      });

      setCustomFields(meta.customFields || []);
      setAttachedFiles(meta.files || []);
    } else {
      setCategory('banking');
      setTags([]);
      reset({
        title: '',
        usernameOrEmail: '',
        password: '',
        url: '',
        notes: '',
        bankName: '',
        accountNumberIban: '',
        swiftCode: '',
        atmPin: '',
        branchCity: '',
        routingNumber: '',
        sortCode: '',
        accountCurrency: 'PKR',
        accountType: 'Savings Account',
        cardNumber: '',
        cardExpiry: '',
        cardCvv: '',
        bankCategory: 'private',
        emailProvider: 'Gmail',
        recoveryEmail: '',
        socialPlatform: 'Instagram',
        socialHandle: '',
        docType: 'CNIC / National ID',
        cnicNumber: '',
        fullNameOnDoc: '',
        expiryDate: '',
        referenceNo: '',
        degreeName: '',
        institutionName: '',
        studentRollNo: '',
        gradYearCgpa: '',
        certBody: '',
        walletNetwork: 'Ethereum (ERC-20)',
        exchangeName: 'Binance',
        customCategoryName: '',
      });
      setCustomFields([]);
      setAttachedFiles([]);
    }
    setShowPassword(false);
    setShowCardDetails(false);
  }, [initialData, isOpen, reset]);

  if (!isOpen) return null;

  const handleQuickPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=';
    let newPassword = '';
    const array = new Uint32Array(16);
    crypto.getRandomValues(array);
    for (let i = 0; i < 16; i++) {
      newPassword += chars[array[i] % chars.length];
    }
    setValue('password', newPassword);
    setShowPassword(true);
    toast.success('Quick password generated!');
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleAddCustomField = () => {
    setCustomFields([...customFields, { key: '', value: '' }]);
  };

  const handleCustomFieldChange = (index: number, key: string, value: string) => {
    const updated = [...customFields];
    updated[index] = { key, value };
    setCustomFields(updated);
  };

  const handleRemoveCustomField = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  // Handle File Attachment Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`File "${file.name}" exceeds 5MB limit.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setAttachedFiles((prev) => [
          ...prev,
          {
            name: file.name,
            type: file.type,
            dataUrl,
            size: file.size,
          },
        ]);
        toast.success(`Attached file "${file.name}"`);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveFile = (index: number) => {
    setAttachedFiles(attachedFiles.filter((_, i) => i !== index));
    toast.info('Attachment removed.');
  };

  const onSubmitForm = async (values: FormValues) => {
    if (!values.title || !values.title.trim()) {
      toast.error('Please enter Title / Record Name.');
      return;
    }

    setLoading(true);

    const baseMetaPayload = {
      customFields: customFields.filter((f) => f.key && f.key.trim().length > 0),
      files: attachedFiles,
    };

    let metaPayload: Record<string, any> = { ...baseMetaPayload };

    if (category === 'banking') {
      metaPayload = {
        ...metaPayload,
        bankName: (values.bankName || '').trim(),
        accountNumberIban: (values.accountNumberIban || '').trim(),
        swiftCode: (values.swiftCode || '').trim(),
        atmPin: (values.atmPin || '').trim(),
        branchCity: (values.branchCity || '').trim(),
        routingNumber: (values.routingNumber || '').trim(),
        sortCode: (values.sortCode || '').trim(),
        accountCurrency: (values.accountCurrency || 'PKR').trim(),
        accountType: (values.accountType || 'Savings Account').trim(),
        cardNumber: (values.cardNumber || '').trim(),
        cardExpiry: (values.cardExpiry || '').trim(),
        cardCvv: (values.cardCvv || '').trim(),
        bankCategory: (values.bankCategory || 'private').trim(),
      };
    } else if (category === 'email') {
      metaPayload = {
        ...metaPayload,
        emailProvider: (values.emailProvider || 'Gmail').trim(),
        recoveryEmail: (values.recoveryEmail || '').trim(),
      };
    } else if (category === 'social') {
      metaPayload = {
        ...metaPayload,
        socialPlatform: (values.socialPlatform || 'Instagram').trim(),
        socialHandle: (values.socialHandle || '').trim(),
      };
    } else if (category === 'government') {
      metaPayload = {
        ...metaPayload,
        docType: (values.docType || 'CNIC / National ID').trim(),
        cnicNumber: (values.cnicNumber || '').trim(),
        fullNameOnDoc: (values.fullNameOnDoc || '').trim(),
        expiryDate: (values.expiryDate || '').trim(),
        referenceNo: (values.referenceNo || '').trim(),
      };
    } else if (category === 'education') {
      metaPayload = {
        ...metaPayload,
        degreeName: (values.degreeName || '').trim(),
        institutionName: (values.institutionName || '').trim(),
        studentRollNo: (values.studentRollNo || '').trim(),
        gradYearCgpa: (values.gradYearCgpa || '').trim(),
        certBody: (values.certBody || '').trim(),
      };
    } else if (category === 'custom') {
      metaPayload = {
        ...metaPayload,
        customCategoryName: (values.customCategoryName || '').trim(),
        walletNetwork: (values.walletNetwork || '').trim(),
        exchangeName: (values.exchangeName || '').trim(),
      };
    }

    const resolvedUser = (values.usernameOrEmail || '').trim() || (values.socialHandle || '').trim() || (values.cnicNumber || '').trim() || (values.studentRollNo || '').trim() || (values.accountNumberIban || '').trim() || (values.title || '').trim();

    try {
      await onSave({
        id: initialData?.id,
        title: values.title.trim(),
        category,
        usernameOrEmail: resolvedUser,
        password: (values.password || '').trim(),
        url: (values.url || '').trim() || undefined,
        notes: (values.notes || '').trim() || undefined,
        metadata: metaPayload,
        tags,
      });
      toast.success(initialData ? 'Record updated successfully!' : 'New record created successfully!');
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save vault entry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 cursor-pointer overflow-y-auto"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-xl max-h-[85vh] sm:max-h-[90vh] my-auto overflow-y-auto rounded-3xl border border-slate-800 bg-[#0F172A] p-5 sm:p-7 shadow-2xl space-y-5 cursor-default scrollbar-thin scrollbar-thumb-slate-800"
        >
          
          {/* Modal Sticky Header */}
          <div className="flex items-center justify-between sticky top-0 bg-[#0F172A]/90 backdrop-blur-md pb-2 z-10 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0">
                <KeyRound className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-100">
                  {initialData ? 'Edit Credential Record' : 'Add New Record'}
                </h3>
                <p className="text-xs text-slate-400">Encrypted at rest with AES-256-GCM</p>
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

          <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-5">
            
            {/* Category Selector Tabs */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Target Category</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.value;
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setCategory(cat.value)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300 shadow-md'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <Icon className={`h-4 w-4 shrink-0 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`} />
                      <span className="truncate">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* DYNAMIC CATEGORY-SPECIFIC FORM FIELDS */}

            {/* --- 1. BANKING & FINANCE --- */}
            {category === 'banking' && (
              <div className="space-y-3.5 bg-slate-950/80 p-4 sm:p-5 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 pb-1 border-b border-slate-800">
                  <Building2 className="h-4 w-4" />
                  <span>Banking & Account Information</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-300">Account Title / Name *</label>
                    <input
                      type="text"
                      {...register('title')}
                      placeholder="e.g. Anza Muneeb Khan - Savings"
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-300">Bank / Provider Select (Optional)</label>
                    <select
                      {...register('bankName')}
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="">Select Scheduled Bank / EMI</option>
                      {PAKISTANI_BANKS.map((b) => (
                        <option key={b.id} value={b.name}>
                          {b.name} ({b.categoryLabel})
                        </option>
                      ))}
                      <option value="Custom Foreign Bank">Other / Foreign Bank</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[11px] font-medium text-slate-300">Account Number / IBAN (Optional)</label>
                    <input
                      type="text"
                      {...register('accountNumberIban')}
                      placeholder="e.g. PK36MEZN0001090801234567"
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-mono text-cyan-300 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-300">Currency</label>
                    <select
                      {...register('accountCurrency')}
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
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

                {/* Cross-Border Codes */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-300">SWIFT / BIC Code</label>
                    <input
                      type="text"
                      {...register('swiftCode')}
                      placeholder="e.g. MEZNPKKA"
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-mono text-slate-200 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-300">US ACH Routing No</label>
                    <input
                      type="text"
                      {...register('routingNumber')}
                      placeholder="e.g. 021000021"
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-mono text-emerald-300 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-300">UK Sort Code</label>
                    <input
                      type="text"
                      {...register('sortCode')}
                      placeholder="e.g. 40-02-18"
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-mono text-emerald-300 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-300">ATM / Card Secret PIN (Optional)</label>
                    <input
                      type="password"
                      {...register('atmPin')}
                      placeholder="e.g. 8912"
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-mono text-amber-300 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-300">Branch Name / City (Optional)</label>
                    <input
                      type="text"
                      {...register('branchCity')}
                      placeholder="e.g. I.I. Chundrigar Branch, Karachi"
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* High Sensitivity Section: Card Number & CVV */}
                <div className="pt-2 border-t border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                      🔒 Debit / Credit Card Vault (AES-256 Encrypted)
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowCardDetails(!showCardDetails)}
                      className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 cursor-pointer flex items-center gap-1"
                    >
                      {showCardDetails ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      <span>{showCardDetails ? 'Hide Card Details' : 'Show Card Details'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[11px] font-medium text-slate-300">16-Digit Card Number</label>
                      <input
                        type={showCardDetails ? 'text' : 'password'}
                        {...register('cardNumber')}
                        placeholder="e.g. 4532 8912 0019 9928"
                        className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-mono text-cyan-300 focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-slate-300">Expiry (MM/YY)</label>
                        <input
                          type="text"
                          {...register('cardExpiry')}
                          placeholder="12/28"
                          className="w-full rounded-xl border border-slate-800 bg-slate-900 px-2.5 py-2 text-xs font-mono text-slate-100 focus:border-emerald-500 focus:outline-none text-center"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-slate-300">CVV / CVC</label>
                        <input
                          type={showCardDetails ? 'text' : 'password'}
                          {...register('cardCvv')}
                          placeholder="891"
                          className="w-full rounded-xl border border-slate-800 bg-slate-900 px-2.5 py-2 text-xs font-mono text-amber-300 focus:border-emerald-500 focus:outline-none text-center"
                        />
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* --- 2. EMAIL ACCOUNTS --- */}
            {category === 'email' && (
              <div className="space-y-3.5 bg-slate-950/80 p-4 sm:p-5 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 pb-1 border-b border-slate-800">
                  <Mail className="h-4 w-4" />
                  <span>Email Account Details</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-300">Account Label / Title *</label>
                    <input
                      type="text"
                      {...register('title')}
                      placeholder="e.g. Primary Personal Gmail"
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-300">Provider</label>
                    <select
                      {...register('emailProvider')}
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                    >
                      <option value="Gmail">Google Gmail</option>
                      <option value="Outlook">Microsoft Outlook / Hotmail</option>
                      <option value="Proton">ProtonMail Secure</option>
                      <option value="Zoho">Zoho Mail</option>
                      <option value="Yandex">Yandex Mail</option>
                      <option value="Yahoo">Yahoo Mail</option>
                      <option value="iCloud">Apple iCloud Mail</option>
                      <option value="Custom Domain">Custom Domain Email (GSuite / M365)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-300">Email Address (Optional)</label>
                  <input
                    type="email"
                    {...register('usernameOrEmail')}
                    placeholder="anza@gmail.com"
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-mono text-slate-100 focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-300">Recovery Email / Phone (Optional)</label>
                  <input
                    type="text"
                    {...register('recoveryEmail')}
                    placeholder="e.g. backup@outlook.com or +923001234567"
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* --- 3. SOCIAL MEDIA --- */}
            {category === 'social' && (
              <div className="space-y-3.5 bg-slate-950/80 p-4 sm:p-5 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-400 pb-1 border-b border-slate-800">
                  <Share2 className="h-4 w-4" />
                  <span>Social Media Profile</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-300">Social Platform</label>
                    <select
                      {...register('socialPlatform')}
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="Instagram">Instagram</option>
                      <option value="Facebook">Facebook</option>
                      <option value="LinkedIn">LinkedIn</option>
                      <option value="X / Twitter">X / Twitter</option>
                      <option value="YouTube">YouTube</option>
                      <option value="WhatsApp">WhatsApp Business</option>
                      <option value="TikTok">TikTok</option>
                      <option value="Snapchat">Snapchat</option>
                      <option value="Telegram">Telegram</option>
                      <option value="Discord">Discord</option>
                      <option value="Threads">Threads</option>
                      <option value="GitHub">GitHub</option>
                      <option value="Behance / Dribbble">Behance / Dribbble</option>
                      <option value="Custom">Other Platform</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-300">Profile Name / Title *</label>
                    <input
                      type="text"
                      {...register('title')}
                      placeholder="e.g. Official Instagram Account"
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-300">Username / Handle (Optional)</label>
                    <input
                      type="text"
                      {...register('socialHandle')}
                      placeholder="e.g. @anza_official"
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-mono text-cyan-300 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-300">Linked Login Email / Phone (Optional)</label>
                    <input
                      type="text"
                      {...register('usernameOrEmail')}
                      placeholder="anza@example.com or +92300..."
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* --- 4. GOVERNMENT & NADRA --- */}
            {category === 'government' && (
              <div className="space-y-3.5 bg-slate-950/80 p-4 sm:p-5 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400 pb-1 border-b border-slate-800">
                  <Landmark className="h-4 w-4" />
                  <span>Government Identity & National Records</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-300">Document Type</label>
                    <select
                      {...register('docType')}
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                    >
                      <option value="CNIC / National ID">NADRA CNIC / National ID Card</option>
                      <option value="Driving License">Driving License</option>
                      <option value="Passport">International Passport</option>
                      <option value="FBR Tax NTN">FBR Tax NTN Record</option>
                      <option value="Domicile / PRC">Domicile Certificate / PRC</option>
                      <option value="Vehicle Reg">Vehicle Registration Document</option>
                      <option value="Arms License">Arms License</option>
                      <option value="Birth Cert / B-Form">Birth Certificate / B-Form</option>
                      <option value="Other ID">Other Official Identity</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-300">Document Title *</label>
                    <input
                      type="text"
                      {...register('title')}
                      placeholder="e.g. NADRA Smart National ID Card"
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-300">National ID / Document Number (Optional)</label>
                    <input
                      type="text"
                      {...register('cnicNumber')}
                      placeholder="e.g. 42101-1234567-9"
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-mono text-amber-300 focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-300">Full Name on Document (Optional)</label>
                    <input
                      type="text"
                      {...register('fullNameOnDoc')}
                      placeholder="e.g. Anza Muneeb Khan"
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-300">Expiry Date / Status (Optional Date Picker)</label>
                    <input
                      type="date"
                      {...register('expiryDate')}
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-300">Application / Ref File No. (Optional)</label>
                    <input
                      type="text"
                      {...register('referenceNo')}
                      placeholder="e.g. Ref No: 9918273"
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* --- 5. EDUCATION & ACADEMIC --- */}
            {category === 'education' && (
              <div className="space-y-3.5 bg-slate-950/80 p-4 sm:p-5 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-400 pb-1 border-b border-slate-800">
                  <GraduationCap className="h-4 w-4" />
                  <span>Education & Academic Credentials</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-300">Degree / Record Title *</label>
                    <input
                      type="text"
                      {...register('title')}
                      placeholder="e.g. BS Computer Science Degree"
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-100 focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-300">University / Institution (Optional)</label>
                    <input
                      type="text"
                      {...register('institutionName')}
                      placeholder="e.g. FAST NUCES / Karachi University"
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-100 focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-300">Student Roll / Reg Number</label>
                    <input
                      type="text"
                      {...register('studentRollNo')}
                      placeholder="e.g. 20K-1192"
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-mono text-purple-300 focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-300">Graduation Year / CGPA</label>
                    <input
                      type="text"
                      {...register('gradYearCgpa')}
                      placeholder="e.g. Graduated 2024 | CGPA: 3.8"
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-200 focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-300">Certification Body (Optional)</label>
                    <input
                      type="text"
                      {...register('certBody')}
                      placeholder="e.g. AWS / Google / Meta Cert"
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-purple-300 focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* --- 6. CUSTOM & USER DEFINED --- */}
            {category === 'custom' && (
              <div className="space-y-3.5 bg-slate-950/80 p-4 sm:p-5 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold text-teal-400 pb-1 border-b border-slate-800">
                  <SlidersHorizontal className="h-4 w-4" />
                  <span>Custom Record & User Category</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[11px] font-medium text-slate-300">Record Title *</label>
                    <input
                      type="text"
                      {...register('title')}
                      placeholder="e.g. Crypto Wallet Seed Phrase, Medical Insurance"
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-100 focus:border-teal-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-300">Category Tag (Optional)</label>
                    <input
                      type="text"
                      {...register('customCategoryName')}
                      placeholder="e.g. Crypto, Health, SIM"
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-teal-300 focus:border-teal-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-300">Crypto / Blockchain Network (Optional)</label>
                    <input
                      type="text"
                      {...register('walletNetwork')}
                      placeholder="e.g. Ethereum (ERC-20), Solana, Bitcoin"
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-200 focus:border-teal-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-300">Exchange / Platform Name (Optional)</label>
                    <input
                      type="text"
                      {...register('exchangeName')}
                      placeholder="e.g. Binance, OKX, RedotPay"
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-200 focus:border-teal-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* --- CUSTOM KEY-VALUE FIELDS ENGINE (Available for ALL Categories!) --- */}
            <div className="space-y-2.5 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-purple-300 flex items-center gap-1.5">
                  <SlidersHorizontal className="h-3.5 w-3.5 text-purple-400" />
                  <span>Extra Custom Fields (Optional - Available for All Categories)</span>
                </label>
                <button
                  type="button"
                  onClick={handleAddCustomField}
                  className="flex items-center gap-1 px-2.5 py-1 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Plus className="h-3 w-3" />
                  <span>Add Field</span>
                </button>
              </div>

              {customFields.length > 0 && (
                <div className="space-y-2 pt-1">
                  {customFields.map((field, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={field.key}
                        onChange={(e) => handleCustomFieldChange(idx, e.target.value, field.value)}
                        placeholder="Field Name (e.g. PUK Code)"
                        className="w-1/3 rounded-xl border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-200 focus:border-purple-500 focus:outline-none"
                      />
                      <input
                        type="text"
                        value={field.value}
                        onChange={(e) => handleCustomFieldChange(idx, field.key, e.target.value)}
                        placeholder="Value (e.g. 881297)"
                        className="flex-1 rounded-xl border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs font-mono text-purple-300 focus:border-purple-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomField(idx)}
                        className="p-1.5 text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* --- FILE / DOCUMENT ATTACHMENTS (Available for ALL Categories!) --- */}
            <div className="space-y-2.5 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
                  <Paperclip className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Attached Scans & Documents (Optional)</span>
                </label>
                <label
                  htmlFor="vault-modal-file-upload"
                  className="flex items-center gap-1 px-2.5 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Plus className="h-3 w-3" />
                  <span>Attach Document</span>
                </label>
                <input
                  type="file"
                  id="vault-modal-file-upload"
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {attachedFiles.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {attachedFiles.map((file, idx) => {
                    const isImg = file.type.startsWith('image/');
                    return (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-xl border border-slate-800 bg-slate-900/80 text-xs">
                        <div className="flex items-center gap-2 overflow-hidden">
                          {isImg ? (
                            <img src={file.dataUrl} alt={file.name} className="h-8 w-8 object-cover rounded-lg border border-slate-700 shrink-0" />
                          ) : (
                            <FileText className="h-5 w-5 text-cyan-400 shrink-0" />
                          )}
                          <div className="truncate">
                            <p className="font-semibold text-slate-200 truncate text-[11px]">{file.name}</p>
                            <p className="text-[9px] text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveFile(idx)}
                          className="p-1 text-slate-500 hover:text-red-400 transition-colors cursor-pointer shrink-0"
                          title="Remove attachment"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* --- PASSWORD & SECRET PIN FIELD (OPTIONAL WITH EYE TOGGLE!) --- */}
            <div className="space-y-3.5 pt-1">
              
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    Password / Secret Key / PIN (Optional)
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleQuickPassword}
                      className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 cursor-pointer"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Quick Pass
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsGenOpen(true)}
                      className="flex items-center gap-1 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 cursor-pointer"
                    >
                      <Sparkles className="h-3 w-3" />
                      Generator
                    </button>
                  </div>
                </div>

                <div className="relative flex items-center">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    placeholder="Enter or generate secret password / PIN (Optional)"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-3.5 pr-10 py-2.5 text-xs font-mono text-emerald-300 focus:border-emerald-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                    title={showPassword ? 'Hide password text' : 'Show password text'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4 text-emerald-400" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Website / Login URL (Optional)</label>
                <input
                  type="text"
                  {...register('url')}
                  placeholder="https://example.com"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Tags</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="Add tag (e.g. primary, active)"
                    className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-xl transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1.5">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-300 border border-emerald-500/20"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-red-400 cursor-pointer"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Encrypted Notes & Recovery Info (Optional)</label>
                <textarea
                  rows={2}
                  {...register('notes')}
                  placeholder="Security questions, PIN numbers, recovery codes..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

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
                className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-semibold text-white rounded-xl shadow-lg shadow-emerald-950/40 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  'Saving Record...'
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    <span>{initialData ? 'Update Record' : 'Save Encrypted Record'}</span>
                  </>
                )}
              </button>
            </div>

          </form>

        </div>
      </div>

      {/* Password Generator Modal */}
      {isGenOpen && (
        <PasswordGeneratorModal
          isOpen={isGenOpen}
          onClose={() => setIsGenOpen(false)}
          onSelectPassword={(genPass) => {
            setValue('password', genPass);
            setShowPassword(true);
          }}
        />
      )}
    </>
  );
}
