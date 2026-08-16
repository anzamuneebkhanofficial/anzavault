'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Shield, 
  KeyRound, 
  CreditCard, 
  Activity, 
  LogOut, 
  Lock, 
  Layers, 
  LockKeyhole, 
  ChevronDown, 
  Vault as VaultIcon, 
  ShieldAlert 
} from 'lucide-react';
import { toast } from 'sonner';
import LockOverlay from '@/components/LockOverlay';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLocked, setIsLocked] = useState(false);

  // Dropdown states
  const [vaultOpen, setVaultOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);

  const vaultRef = useRef<HTMLDivElement>(null);
  const toolsRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (vaultRef.current && !vaultRef.current.contains(event.target as Node)) {
        setVaultOpen(false);
      }
      if (toolsRef.current && !toolsRef.current.contains(event.target as Node)) {
        setToolsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      toast.success('Logged out successfully.');
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
      toast.error('Logout failed.');
    }
  };

  const isVaultActive = pathname === '/vault' || pathname === '/payment';
  const isToolsActive = pathname === '/export-import' || pathname === '/audit';

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-[#0B0F17]/95 backdrop-blur-xl shadow-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Brand Logo */}
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 text-emerald-400 group-hover:border-emerald-400 transition-colors">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-slate-100 tracking-tight">Anza Vault</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Protected
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Personal Security Workspace</p>
            </div>
          </Link>

          {/* Center Navigation Submenus */}
          <nav className="hidden md:flex items-center gap-2">
            
            {/* Dashboard Link */}
            <Link
              href="/dashboard"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                pathname === '/dashboard'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <Shield className="h-4 w-4 text-emerald-400" />
              <span>Dashboard</span>
            </Link>

            {/* Submenu 1: Vault Items (Password Vault + Payment Share) */}
            <div className="relative" ref={vaultRef}>
              <button
                onClick={() => {
                  setVaultOpen(!vaultOpen);
                  setToolsOpen(false);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isVaultActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm'
                    : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <VaultIcon className="h-4 w-4 text-emerald-400" />
                <span>Vault Records</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${vaultOpen ? 'rotate-180' : ''}`} />
              </button>

              {vaultOpen && (
                <div className="absolute left-0 mt-2 w-56 rounded-2xl border border-slate-800 bg-[#0F172A] p-2 shadow-2xl space-y-1 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                  <Link
                    href="/vault"
                    onClick={() => setVaultOpen(false)}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-800/80 text-xs font-semibold text-slate-200 transition-colors"
                  >
                    <KeyRound className="h-4 w-4 text-emerald-400 shrink-0" />
                    <div>
                      <div>Password Vault</div>
                      <div className="text-[10px] text-slate-400 font-normal">Passwords & logins</div>
                    </div>
                  </Link>

                  <Link
                    href="/payment"
                    onClick={() => setVaultOpen(false)}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-800/80 text-xs font-semibold text-slate-200 transition-colors"
                  >
                    <CreditCard className="h-4 w-4 text-cyan-400 shrink-0" />
                    <div>
                      <div>Payment Quick-Share</div>
                      <div className="text-[10px] text-slate-400 font-normal">Banks, JazzCash & IBANs</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* Submenu 2: Security & Tools (Backup Hub + Security Audit) */}
            <div className="relative" ref={toolsRef}>
              <button
                onClick={() => {
                  setToolsOpen(!toolsOpen);
                  setVaultOpen(false);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isToolsActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm'
                    : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <ShieldAlert className="h-4 w-4 text-emerald-400" />
                <span>Security & Backup</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${toolsOpen ? 'rotate-180' : ''}`} />
              </button>

              {toolsOpen && (
                <div className="absolute left-0 mt-2 w-56 rounded-2xl border border-slate-800 bg-[#0F172A] p-2 shadow-2xl space-y-1 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                  <Link
                    href="/export-import"
                    onClick={() => setToolsOpen(false)}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-800/80 text-xs font-semibold text-slate-200 transition-colors"
                  >
                    <Layers className="h-4 w-4 text-emerald-400 shrink-0" />
                    <div>
                      <div>Backup & Export Hub</div>
                      <div className="text-[10px] text-slate-400 font-normal">.swiz, JSON, CSV, PDF</div>
                    </div>
                  </Link>

                  <Link
                    href="/audit"
                    onClick={() => setToolsOpen(false)}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-800/80 text-xs font-semibold text-slate-200 transition-colors"
                  >
                    <Activity className="h-4 w-4 text-amber-400 shrink-0" />
                    <div>
                      <div>Security Audit & IP</div>
                      <div className="text-[10px] text-slate-400 font-normal">IP Think Tank & Logs</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>

          </nav>

          {/* Right Action: Lock Vault & Logout */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                setIsLocked(true);
                toast.info('Vault session locked');
              }}
              className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs font-semibold text-amber-400 hover:border-amber-500/30 hover:bg-amber-500/10 transition-all duration-150 cursor-pointer"
              title="Lock Session"
            >
              <LockKeyhole className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Lock Session</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/60 px-3.5 py-2 text-xs font-semibold text-slate-400 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 transition-all duration-150 cursor-pointer"
              title="Logout Session"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Links Bar */}
        <div className="flex md:hidden border-t border-slate-800/80 bg-slate-950/90 px-2 py-2 overflow-x-auto justify-around">
          {[
            { name: 'Dashboard', href: '/dashboard', icon: Shield },
            { name: 'Vault', href: '/vault', icon: KeyRound },
            { name: 'Payments', href: '/payment', icon: CreditCard },
            { name: 'Backup', href: '/export-import', icon: Layers },
            { name: 'Audit', href: '/audit', icon: Activity },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-medium shrink-0 ${
                  isActive ? 'text-emerald-400 font-semibold' : 'text-slate-400'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </header>

      {/* Lock Screen Overlay */}
      <LockOverlay isLocked={isLocked} onUnlock={() => setIsLocked(false)} />
    </>
  );
}
