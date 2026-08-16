'use client';

import { useState, useRef, useEffect } from 'react';
import { PAYMENT_PROVIDERS, PaymentProviderInfo } from '@/lib/constants/paymentProviders';
import { Search, ChevronDown, Check, Smartphone, Building2, Globe, Coins } from 'lucide-react';

interface ProviderSelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function ProviderSelect({ value, onChange, className = '' }: ProviderSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedProvider = PAYMENT_PROVIDERS.find((p) => p.value === value) || PAYMENT_PROVIDERS.find((p) => p.value === 'other');

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredProviders = PAYMENT_PROVIDERS.filter(
    (p) =>
      p.label.toLowerCase().includes(search.toLowerCase().trim()) ||
      p.value.toLowerCase().includes(search.toLowerCase().trim()) ||
      p.groupLabel.toLowerCase().includes(search.toLowerCase().trim())
  );

  const groups = [
    { key: 'wallets', label: 'Pakistani Digital Wallets & EMIs', icon: Smartphone },
    { key: 'banks', label: 'Pakistani Scheduled Banks', icon: Building2 },
    { key: 'international', label: 'International Platforms', icon: Globe },
    { key: 'crypto', label: 'Crypto & Custom Channels', icon: Coins },
  ];

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-slate-100 hover:border-slate-700 focus:border-cyan-500 focus:outline-none transition-colors cursor-pointer"
      >
        <span className="font-medium text-slate-200 truncate">{selectedProvider?.label || 'Select Payment Provider'}</span>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-cyan-400' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 max-h-72 overflow-y-auto rounded-2xl border border-slate-800 bg-[#0B132B] p-2 shadow-2xl space-y-2 scrollbar-thin scrollbar-thumb-slate-800 animate-in fade-in zoom-in-95 duration-150">
          
          {/* Search Box */}
          <div className="sticky top-0 bg-[#0B132B] pt-1 pb-2 z-10 border-b border-slate-800">
            <div className="relative flex items-center">
              <Search className="absolute left-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search JazzCash, Meezan, Wise, Binance..."
                className="w-full rounded-xl border border-slate-800 bg-slate-900 pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                autoFocus
              />
            </div>
          </div>

          {/* Grouped Items */}
          {groups.map((group) => {
            const GroupIcon = group.icon;
            const items = filteredProviders.filter((p) => p.group === group.key);
            if (items.length === 0) return null;

            return (
              <div key={group.key} className="space-y-1">
                <div className="flex items-center gap-1.5 px-2.5 pt-2 pb-1 text-[10px] font-bold tracking-wider uppercase text-cyan-400 border-b border-slate-800/60">
                  <GroupIcon className="h-3 w-3" />
                  <span>{group.label}</span>
                </div>

                <div className="grid grid-cols-1 gap-0.5">
                  {items.map((p) => {
                    const isSelected = value === p.value;
                    return (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => {
                          onChange(p.value);
                          setIsOpen(false);
                          setSearch('');
                        }}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer text-left ${
                          isSelected
                            ? 'bg-cyan-500/15 text-cyan-300 font-semibold border border-cyan-500/30'
                            : 'text-slate-300 hover:bg-slate-900 hover:text-slate-100'
                        }`}
                      >
                        <span className="truncate">{p.label}</span>
                        {isSelected && <Check className="h-3.5 w-3.5 text-cyan-400 shrink-0 ml-2" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {filteredProviders.length === 0 && (
            <div className="p-4 text-center text-xs text-slate-400">No payment providers match "{search}"</div>
          )}
        </div>
      )}
    </div>
  );
}
