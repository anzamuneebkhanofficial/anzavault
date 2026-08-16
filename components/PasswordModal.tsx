'use client';

import { useState, useEffect } from 'react';
import { X, Copy, Check, Eye, EyeOff, ShieldAlert, QrCode, Paperclip, FileText, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import QRCodeModal from '@/components/QRCodeModal';

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  category?: string;
  usernameOrEmail: string;
  passwordText: string;
  notesText?: string;
  metadataObj?: Record<string, any>;
}

export default function PasswordModal({
  isOpen,
  onClose,
  title,
  category = 'custom',
  usernameOrEmail,
  passwordText,
  notesText,
  metadataObj = {},
}: PasswordModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<{ name: string; dataUrl: string; type: string } | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (countdown !== null && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((prev) => (prev !== null ? prev - 1 : null));
      }, 1000);
    } else if (countdown === 0) {
      navigator.clipboard.writeText('');
      setCopied(false);
      setCountdown(null);
      toast.info('Clipboard auto-cleared for security.');
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  if (!isOpen) return null;

  const handleCopyPassword = () => {
    if (!passwordText) {
      toast.info('No password stored for this record.');
      return;
    }
    navigator.clipboard.writeText(passwordText);
    setCopied(true);
    setCountdown(30);
    toast.success('Password copied to clipboard!');
  };

  const formattedPayload = `VAULT RECORD [${category.toUpperCase()}]\nTitle: ${title}\nUser/ID: ${usernameOrEmail}${passwordText ? `\nPassword: ${passwordText}` : ''}${notesText ? `\nNotes: ${notesText}` : ''}`;

  const filesList = metadataObj?.files || [];

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 cursor-pointer overflow-y-auto"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg max-h-[85vh] sm:max-h-[90vh] my-auto overflow-y-auto rounded-3xl border border-slate-800 bg-[#0F172A] p-5 sm:p-7 shadow-2xl space-y-5 cursor-default scrollbar-thin scrollbar-thumb-slate-800"
        >
          
          {/* Modal Sticky Header */}
          <div className="flex items-center justify-between sticky top-0 bg-[#0F172A]/90 backdrop-blur-md pb-2 z-10 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0">
                <Eye className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-slate-100 truncate max-w-[200px] sm:max-w-[260px]">{title}</h3>
                  <span className="uppercase text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {metadataObj?.customCategoryName || category}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono select-all truncate max-w-[200px] sm:max-w-[260px]">{usernameOrEmail}</p>
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

          {/* Decrypted Category-Specific Metadata Display */}
          {metadataObj && Object.keys(metadataObj).length > 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-xs space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                Decrypted Category Records
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-slate-300">
                {metadataObj.bankName && <div><span className="text-slate-500">Bank:</span> {metadataObj.bankName}</div>}
                {metadataObj.accountNumberIban && <div><span className="text-slate-500">IBAN/Account:</span> {metadataObj.accountNumberIban}</div>}
                {metadataObj.swiftCode && <div><span className="text-slate-500">SWIFT:</span> {metadataObj.swiftCode}</div>}
                {metadataObj.atmPin && <div><span className="text-slate-500">ATM PIN:</span> <strong className="text-amber-400">{metadataObj.atmPin}</strong></div>}
                {metadataObj.branchCity && <div><span className="text-slate-500">Branch:</span> {metadataObj.branchCity}</div>}

                {metadataObj.emailProvider && <div><span className="text-slate-500">Provider:</span> {metadataObj.emailProvider}</div>}
                {metadataObj.recoveryEmail && <div><span className="text-slate-500">Recovery:</span> {metadataObj.recoveryEmail}</div>}

                {metadataObj.socialPlatform && <div><span className="text-slate-500">Platform:</span> {metadataObj.socialPlatform}</div>}
                {metadataObj.socialHandle && <div><span className="text-slate-500">Handle:</span> {metadataObj.socialHandle}</div>}

                {metadataObj.docType && <div><span className="text-slate-500">Doc Type:</span> {metadataObj.docType}</div>}
                {metadataObj.cnicNumber && <div><span className="text-slate-500">ID / CNIC:</span> <strong className="text-amber-400">{metadataObj.cnicNumber}</strong></div>}
                {metadataObj.fullNameOnDoc && <div><span className="text-slate-500">Name:</span> {metadataObj.fullNameOnDoc}</div>}
                {metadataObj.expiryDate && <div><span className="text-slate-500">Expiry:</span> {metadataObj.expiryDate}</div>}

                {metadataObj.degreeName && <div><span className="text-slate-500">Degree:</span> {metadataObj.degreeName}</div>}
                {metadataObj.institutionName && <div><span className="text-slate-500">University:</span> {metadataObj.institutionName}</div>}
                {metadataObj.studentRollNo && <div><span className="text-slate-500">Roll/ID:</span> {metadataObj.studentRollNo}</div>}
                {metadataObj.gradYearCgpa && <div><span className="text-slate-500">Graduation/CGPA:</span> {metadataObj.gradYearCgpa}</div>}

                {metadataObj.customFields && Array.isArray(metadataObj.customFields) && metadataObj.customFields.map((cf: any, i: number) => (
                  <div key={i}><span className="text-slate-500">{cf.key}:</span> <strong className="text-purple-300">{cf.value}</strong></div>
                ))}
              </div>
            </div>
          )}

          {/* Attached Files & Scans Section */}
          {filesList.length > 0 && (
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Paperclip className="h-3.5 w-3.5" />
                Attached Document Scans ({filesList.length})
              </label>
              <div className="grid grid-cols-2 gap-2">
                {filesList.map((file: any, idx: number) => {
                  const isImg = file.type?.startsWith('image/');
                  return (
                    <div
                      key={idx}
                      onClick={() => setPreviewFile(file)}
                      className="flex items-center gap-2 p-2 rounded-xl border border-slate-800 bg-slate-950 hover:border-cyan-500/50 transition-colors cursor-pointer text-xs"
                    >
                      {isImg ? (
                        <img src={file.dataUrl} alt={file.name} className="h-9 w-9 object-cover rounded-lg border border-slate-800 shrink-0" />
                      ) : (
                        <FileText className="h-6 w-6 text-cyan-400 shrink-0" />
                      )}
                      <div className="truncate">
                        <p className="font-semibold text-slate-200 truncate text-[11px]">{file.name}</p>
                        <p className="text-[9px] text-cyan-400 flex items-center gap-1">
                          Preview <ExternalLink className="h-2.5 w-2.5" />
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Password Display Box */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Decrypted Master Password / PIN
              </label>
              <div className="relative flex items-center rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 font-mono text-sm">
                <input
                  type={showPassword ? 'text' : 'password'}
                  readOnly
                  value={passwordText || '(No password stored)'}
                  className="w-full bg-transparent text-emerald-300 font-bold focus:outline-none pr-20 select-all"
                />
                
                {passwordText && (
                  <div className="absolute right-2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyPassword}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg transition-colors cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {notesText && (
              <div className="space-y-1 text-xs">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Encrypted Notes</label>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-mono whitespace-pre-wrap">
                  {notesText}
                </div>
              </div>
            )}

            {/* Countdown Bar */}
            {countdown !== null && (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-emerald-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Clipboard auto-clears in <strong>{countdown}s</strong></span>
                </div>
                <div className="h-1.5 w-16 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 transition-all duration-1000"
                    style={{ width: `${(countdown / 30) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-800">
            <button
              onClick={() => setIsQrOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              <QrCode className="h-4 w-4" />
              <span>Show Barcode / QR</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>

        </div>
      </div>

      {/* File Image Full Screen Modal Preview */}
      {previewFile && (
        <div
          onClick={() => setPreviewFile(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-200 cursor-pointer overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-3xl max-h-[90vh] my-auto overflow-y-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-4 cursor-default"
          >
            <button
              onClick={() => setPreviewFile(null)}
              className="absolute top-4 right-4 rounded-full p-2 bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h4 className="text-sm font-bold text-slate-100">{previewFile.name}</h4>

            {previewFile.type?.startsWith('image/') ? (
              <img src={previewFile.dataUrl} alt={previewFile.name} className="max-h-[70vh] mx-auto rounded-2xl border border-slate-800 object-contain shadow-2xl" />
            ) : (
              <div className="p-12 space-y-4">
                <FileText className="h-16 w-16 text-cyan-400 mx-auto" />
                <a
                  href={previewFile.dataUrl}
                  download={previewFile.name}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl"
                >
                  Download File
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* QR Modal */}
      {isQrOpen && (
        <QRCodeModal
          isOpen={isQrOpen}
          onClose={() => setIsQrOpen(false)}
          title={title}
          subtitle={usernameOrEmail}
          payload={formattedPayload}
        />
      )}
    </>
  );
}
