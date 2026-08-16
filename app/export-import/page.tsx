'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Navbar from '@/components/Navbar';
import { 
  Download, 
  Upload, 
  FileSpreadsheet, 
  FileText, 
  FileCode, 
  Lock, 
  Check, 
  AlertCircle, 
  RefreshCw, 
  Filter, 
  Layers 
} from 'lucide-react';
import { toast } from 'sonner';

interface ExportFormValues {
  exportPassphrase: string;
}

interface ImportFormValues {
  importPassphrase: string;
}

export default function ExportImportPage() {
  // Export State
  const [exportCategory, setExportCategory] = useState<string>('all');
  const [exportFormat, setExportFormat] = useState<string>('swiz');
  const [isExporting, setIsExporting] = useState(false);

  // Import State
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importStrategy, setImportStrategy] = useState<'skip' | 'overwrite'>('skip');
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const exportForm = useForm<ExportFormValues>({
    defaultValues: { exportPassphrase: 'anza-vault-master' },
  });

  const importForm = useForm<ImportFormValues>({
    defaultValues: { importPassphrase: 'anza-vault-master' },
  });

  const handleTriggerExport = exportForm.handleSubmit((values) => {
    setIsExporting(true);
    const passphrase = values.exportPassphrase || 'anza-vault-master';
    const url = `/api/backup/export?format=${exportFormat}&category=${exportCategory}&passphrase=${encodeURIComponent(passphrase)}`;
    
    if (exportFormat === 'pdf') {
      window.open(url, '_blank');
      setIsExporting(false);
      toast.success('Generated PDF report in new tab!');
      return;
    }

    const a = document.createElement('a');
    a.href = url;
    a.click();
    setTimeout(() => {
      setIsExporting(false);
      toast.success(`Export dataset downloaded as .${exportFormat.toUpperCase()}`);
    }, 1500);
  });

  const handleTriggerImport = importForm.handleSubmit(async (values) => {
    if (!importFile) return;

    setIsImporting(true);
    setImportStatus(null);

    try {
      const text = await importFile.text();
      const fileNameLower = importFile.name.toLowerCase();
      let fileType = 'json';

      if (fileNameLower.endsWith('.swiz')) {
        fileType = 'swiz';
      } else if (fileNameLower.endsWith('.csv')) {
        fileType = 'csv';
      }

      const res = await fetch('/api/backup/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileContent: text,
          fileType,
          passphrase: values.importPassphrase,
          strategy: importStrategy,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setImportStatus({
          type: 'success',
          message: data.message || 'Data successfully imported!',
        });
        toast.success(data.message || 'Backup dataset imported successfully!');
        setImportFile(null);
      } else {
        const msg = data.error || 'Import failed. Please check passphrase or file format.';
        setImportStatus({
          type: 'error',
          message: msg,
        });
        toast.error(msg);
      }
    } catch (err: any) {
      const msg = err.message || 'An unexpected error occurred during import.';
      setImportStatus({
        type: 'error',
        message: msg,
      });
      toast.error(msg);
    } finally {
      setIsImporting(false);
    }
  });

  return (
    <div className="min-h-screen bg-[#0B0F17] flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2.5">
            <Layers className="h-6 w-6 text-emerald-400" />
            Backup, Export & Import Hub
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Full-application or category-wise 1-click backup & restore. Supports custom encrypted .swiz files, JSON, CSV, TXT, DOCX, and printable PDF formats.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* EXPORT SECTION */}
          <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0">
                  <Download className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-100">Export Application Data</h2>
                  <p className="text-xs text-slate-400">Download formatted backup or filtered credentials</p>
                </div>
              </div>

              {/* Category Filter */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Filter className="h-3.5 w-3.5 text-emerald-400" />
                  Select Target Category
                </label>
                <select
                  value={exportCategory}
                  onChange={(e) => setExportCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="all">All Categories (Full Application Export)</option>
                  <option value="banking">Banking & Payment Accounts</option>
                  <option value="email">Email Accounts</option>
                  <option value="social">Social Media</option>
                  <option value="government">Government & NADRA</option>
                  <option value="education">Education & Academic</option>
                  <option value="custom">Custom Entries</option>
                </select>
              </div>

              {/* Export Format Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Choose Export Format</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'swiz', label: '.SWIZ (Encrypted)', icon: Lock, badge: 'Recommended' },
                    { id: 'json', label: 'JSON (Raw Data)', icon: FileCode },
                    { id: 'csv', label: 'CSV (Excel Sheet)', icon: FileSpreadsheet },
                    { id: 'txt', label: 'TXT (Plain Text)', icon: FileText },
                    { id: 'docx', label: 'DOCX (Word Doc)', icon: FileText },
                    { id: 'pdf', label: 'PDF (Printable)', icon: Download },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isSelected = exportFormat === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setExportFormat(item.id)}
                        className={`flex flex-col items-start p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300 shadow-md'
                            : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <Icon className={`h-4 w-4 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`} />
                          {item.badge && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-semibold mt-2">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Passphrase prompt for .swiz */}
              {exportFormat === 'swiz' && (
                <div className="space-y-1.5 bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                    <Lock className="h-3.5 w-3.5 text-emerald-400" />
                    Backup Passphrase (For .swiz encryption)
                  </label>
                  <input
                    type="password"
                    {...exportForm.register('exportPassphrase')}
                    placeholder="Enter custom passphrase..."
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-500">
                    This passphrase will be required when restoring this `.swiz` backup file in the future.
                  </p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleTriggerExport}
              disabled={isExporting}
              className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-emerald-950/40 transition-all cursor-pointer disabled:opacity-50"
            >
              {isExporting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              <span>{isExporting ? 'Generating Export...' : `Export Dataset as .${exportFormat.toUpperCase()}`}</span>
            </button>
          </div>

          {/* IMPORT SECTION */}
          <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shrink-0">
                  <Upload className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-100">Import & Restore Data</h2>
                  <p className="text-xs text-slate-400">Restore credentials from `.swiz`, `JSON`, or `CSV` files</p>
                </div>
              </div>

              {/* File Dropzone */}
              <div className="border-2 border-dashed border-slate-800 rounded-2xl p-6 text-center bg-slate-950/60 space-y-3">
                <Upload className="mx-auto h-8 w-8 text-cyan-400" />
                <div>
                  <p className="text-xs font-semibold text-slate-200">
                    {importFile ? importFile.name : 'Select or drag backup file here'}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Supports `.swiz`, `.json`, and `.csv` backup files</p>
                </div>

                <input
                  type="file"
                  accept=".swiz,.json,.csv"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setImportFile(e.target.files[0]);
                      setImportStatus(null);
                      toast.info(`Selected file: ${e.target.files[0].name}`);
                    }
                  }}
                  className="hidden"
                  id="import-file-input"
                />

                <label
                  htmlFor="import-file-input"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 rounded-xl transition-colors cursor-pointer"
                >
                  Browse Computer
                </label>
              </div>

              {/* Passphrase for .swiz file */}
              {importFile && importFile.name.endsWith('.swiz') && (
                <div className="space-y-1.5 bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                    <Lock className="h-3.5 w-3.5 text-cyan-400" />
                    Decryption Passphrase
                  </label>
                  <input
                    type="password"
                    {...importForm.register('importPassphrase')}
                    placeholder="Enter backup passphrase..."
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              )}

              {/* Strategy Choice */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Duplicate Handling Strategy</label>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <label className={`flex items-center gap-2 p-3 rounded-2xl border cursor-pointer transition-all ${
                    importStrategy === 'skip' ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300' : 'border-slate-800 bg-slate-900/40 text-slate-400'
                  }`}>
                    <input
                      type="radio"
                      name="strategy"
                      checked={importStrategy === 'skip'}
                      onChange={() => setImportStrategy('skip')}
                      className="accent-cyan-500"
                    />
                    <span>Skip Existing</span>
                  </label>

                  <label className={`flex items-center gap-2 p-3 rounded-2xl border cursor-pointer transition-all ${
                    importStrategy === 'overwrite' ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300' : 'border-slate-800 bg-slate-900/40 text-slate-400'
                  }`}>
                    <input
                      type="radio"
                      name="strategy"
                      checked={importStrategy === 'overwrite'}
                      onChange={() => setImportStrategy('overwrite')}
                      className="accent-cyan-500"
                    />
                    <span>Overwrite Existing</span>
                  </label>
                </div>
              </div>

              {/* Import Status Alert */}
              {importStatus && (
                <div className={`p-3.5 rounded-2xl border flex items-center gap-2.5 text-xs ${
                  importStatus.type === 'success'
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                    : 'border-red-500/30 bg-red-500/10 text-red-300'
                }`}>
                  {importStatus.type === 'success' ? (
                    <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                  ) : (
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                  )}
                  <span>{importStatus.message}</span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleTriggerImport}
              disabled={!importFile || isImporting}
              className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-cyan-950/40 transition-all cursor-pointer disabled:opacity-50"
            >
              {isImporting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              <span>{isImporting ? 'Importing & Restoring Data...' : 'Start Data Import'}</span>
            </button>
          </div>

        </div>

      </main>
    </div>
  );
}
