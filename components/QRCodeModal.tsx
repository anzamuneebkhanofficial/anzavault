'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { 
  X, 
  QrCode as QrIcon, 
  Download, 
  Copy, 
  Check, 
  Share2, 
  Sparkles,
  Smartphone
} from 'lucide-react';
import { toast } from 'sonner';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  payload: string;
}

export default function QRCodeModal({
  isOpen,
  onClose,
  title,
  subtitle,
  payload,
}: QRCodeModalProps) {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [waDataUrl, setWaDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [qrType, setQrType] = useState<'standard' | 'whatsapp'>('standard');

  const waLink = `https://wa.me/?text=${encodeURIComponent(payload)}`;

  useEffect(() => {
    if (isOpen && payload) {
      // 1. Standard ISO Pure High-Contrast QR Code (Pure Black on White with Quiet Margin)
      QRCode.toDataURL(payload, {
        width: 360,
        margin: 4,
        errorCorrectionLevel: 'M',
        color: {
          dark: '#000000',  // Deep Black for maximum camera lens sensor readability
          light: '#FFFFFF', // Crisp Pure White Background
        },
      })
        .then((url) => setDataUrl(url))
        .catch((err) => console.error('QR code generation error:', err));

      // 2. WhatsApp Direct Link QR Code
      QRCode.toDataURL(waLink, {
        width: 360,
        margin: 4,
        errorCorrectionLevel: 'M',
        color: {
          dark: '#075E54',  // Official WhatsApp Dark Teal
          light: '#FFFFFF', // Crisp White Background
        },
      })
        .then((url) => setWaDataUrl(url))
        .catch((err) => console.error('WhatsApp QR error:', err));
    }
  }, [isOpen, payload, waLink]);

  if (!isOpen) return null;

  const activeQrImage = qrType === 'whatsapp' ? waDataUrl : dataUrl;

  const handleDownload = () => {
    if (!activeQrImage) return;
    const a = document.createElement('a');
    a.href = activeQrImage;
    a.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${qrType}_qr.png`;
    a.click();
    toast.success('Downloaded High-Contrast Scanner QR Code!');
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(payload);
    setCopied(true);
    toast.success('Copied text info to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 cursor-pointer overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl max-h-[90vh] my-auto overflow-y-auto rounded-3xl border border-slate-800 bg-[#0F172A] p-5 sm:p-7 md:p-8 shadow-2xl space-y-5 cursor-default scrollbar-thin scrollbar-thumb-slate-800"
      >
        
        {/* Modal Header */}
        <div className="flex items-center justify-between sticky top-0 bg-[#0F172A]/95 backdrop-blur-md pb-3 z-10 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0">
              <QrIcon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-100 text-lg sm:text-xl truncate max-w-xs sm:max-w-md">{title}</h3>
              {subtitle && <p className="text-xs sm:text-sm text-slate-400 font-mono truncate max-w-xs sm:max-w-md">{subtitle}</p>}
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

        {/* Format Selector: Universal Text vs WhatsApp Link */}
        <div className="grid grid-cols-2 gap-2.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => setQrType('standard')}
            className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              qrType === 'standard'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="h-4 w-4" />
            <span>Camera / Lens QR</span>
          </button>

          <button
            type="button"
            onClick={() => setQrType('whatsapp')}
            className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              qrType === 'whatsapp'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Share2 className="h-4 w-4" />
            <span>WhatsApp Direct QR</span>
          </button>
        </div>

        {/* QR Code High-Contrast Display Container */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative rounded-3xl border-4 border-slate-800 bg-white p-5 shadow-2xl flex flex-col items-center justify-center">
            {activeQrImage ? (
              <img src={activeQrImage} alt="Scannable QR Code" className="w-52 h-52 sm:w-64 sm:h-64 object-contain" />
            ) : (
              <div className="w-52 h-52 sm:w-64 sm:h-64 flex items-center justify-center text-xs text-slate-400 font-mono">
                Generating High-Contrast Barcode...
              </div>
            )}

            <div className="mt-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-800 bg-slate-100 px-3.5 py-1 rounded-full border border-slate-300 shadow-sm">
              {qrType === 'standard' ? 'ISO Standard Camera Payload' : 'WhatsApp Auto-Open Link'}
            </div>
          </div>

          <p className="text-center text-xs sm:text-sm text-slate-300 max-w-sm">
            {qrType === 'standard'
              ? '100% High-Contrast ISO Standard. Scans instantly on any Android, iPhone, Google Lens, or Camera app.'
              : 'Designed specifically for WhatsApp Scanner. Scanning opens WhatsApp directly with formatted account info!'}
          </p>

          {/* Direct Action Links */}
          <div className="grid grid-cols-2 gap-3 w-full pt-1">
            <button
              onClick={handleDownload}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              <Download className="h-4 w-4 text-emerald-400" />
              <span>Save HD Image</span>
            </button>

            <button
              onClick={handleCopyText}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              <span>{copied ? 'Copied!' : 'Copy Raw Info'}</span>
            </button>
          </div>
        </div>

        {/* Encoded Data Inspector */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span>Encoded Payload Details</span>
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <p className="font-mono text-emerald-400 text-xs sm:text-sm whitespace-pre-wrap select-all max-h-28 overflow-y-auto leading-relaxed">
            {qrType === 'whatsapp' ? waLink : payload}
          </p>
        </div>

      </div>
    </div>
  );
}
