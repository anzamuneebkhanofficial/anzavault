'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Navbar from '@/components/Navbar';
import { 
  Activity, 
  ShieldAlert, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Plus, 
  Ban 
} from 'lucide-react';
import { toast } from 'sonner';
import { getCountryFlag } from '@/lib/ip-geo';

interface AuditItem {
  id: string;
  action: string;
  entityId?: string;
  ip: string;
  userAgent?: string;
  details?: string;
  timestamp: string;
}

interface BlockedIpItem {
  id: string;
  ip: string;
  reason: string;
  attemptCount: number;
  countryCode?: string;
  countryName?: string;
  city?: string;
  flagEmoji?: string;
  blockedAt: string;
}

interface ManualBlockFormValues {
  manualIp: string;
  manualReason: string;
}

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditItem[]>([]);
  const [blockedIps, setBlockedIps] = useState<BlockedIpItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [unblockingIp, setUnblockingIp] = useState<string | null>(null);
  const [retentionHours, setRetentionHours] = useState<number>(72); // 3 days
  const [isPruning, setIsPruning] = useState(false);
  const [pruneStatus, setPruneStatus] = useState<string | null>(null);
  const [isBlocking, setIsBlocking] = useState(false);

  const { register, handleSubmit, reset } = useForm<ManualBlockFormValues>({
    defaultValues: {
      manualIp: '',
      manualReason: '',
    },
  });

  const fetchAuditData = async () => {
    try {
      const res = await fetch('/api/audit');
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        setBlockedIps(data.blockedIps || []);
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditData();
  }, []);

  const handleUnblock = async (ipToUnblock: string) => {
    if (!confirm(`Are you sure you want to unblock & remove IP ${ipToUnblock}?`)) return;

    setUnblockingIp(ipToUnblock);
    try {
      const res = await fetch('/api/admin/unblock-ip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip: ipToUnblock }),
      });

      if (res.ok) {
        toast.success(`IP address ${ipToUnblock} unblocked & removed successfully.`);
        await fetchAuditData();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to unblock IP');
      }
    } catch (err) {
      console.error('Error unblocking IP:', err);
      toast.error('Error unblocking IP');
    } finally {
      setUnblockingIp(null);
    }
  };

  const onSubmitManualBlock = async (values: ManualBlockFormValues) => {
    if (!values.manualIp || !values.manualIp.trim()) {
      toast.error('Please enter a valid IP address.');
      return;
    }

    setIsBlocking(true);
    try {
      const res = await fetch('/api/admin/block-ip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ip: values.manualIp.trim(),
          reason: values.manualReason.trim() || 'Manual Owner Block',
        }),
      });

      if (res.ok) {
        toast.success(`IP ${values.manualIp.trim()} permanently blocked.`);
        reset();
        await fetchAuditData();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to block IP');
      }
    } catch (err) {
      console.error('Error blocking IP:', err);
      toast.error('Error blocking IP');
    } finally {
      setIsBlocking(false);
    }
  };

  const handleRunPrune = async () => {
    setIsPruning(true);
    setPruneStatus(null);
    try {
      const res = await fetch('/api/audit/cleanup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ retentionHours }),
      });
      const data = await res.json();
      if (res.ok) {
        const msg = data.message || 'Audit log retention cleanup completed.';
        setPruneStatus(msg);
        toast.success(msg);
        await fetchAuditData();
      }
    } catch (err) {
      console.error('Cleanup error:', err);
      toast.error('Log cleanup failed.');
    } finally {
      setIsPruning(false);
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'login_success':
        return <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">LOGIN SUCCESS</span>;
      case 'login_fail':
        return <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">LOGIN FAIL</span>;
      case 'ip_blocked':
        return <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-bold animate-pulse">IP BLOCKED</span>;
      case 'ip_unblocked':
        return <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold">IP UNBLOCKED</span>;
      case 'entry_created':
        return <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-bold">ENTRY CREATED</span>;
      case 'entry_updated':
        return <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-bold">ENTRY UPDATED</span>;
      case 'entry_deleted':
        return <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-bold">ENTRY DELETED</span>;
      default:
        return <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-bold">{action.toUpperCase()}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2.5">
              <Activity className="h-6 w-6 text-emerald-400" />
              Security Audit & IP Management
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              View security logs, manage permanent IP block lists, and set automatic log retention cleanup.
            </p>
          </div>

          <button
            onClick={() => {
              setLoading(true);
              fetchAuditData();
              toast.info('Refreshed security activity feed.');
            }}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 rounded-xl transition-colors cursor-pointer self-start sm:self-auto"
            title="Reload recent activity log entries"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Activity Log</span>
          </button>
        </div>

        {/* Log Retention Policy Explanation Card */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-100">
              <Clock className="h-4 w-4 text-emerald-400" />
              <span>Log Retention Policy (1–3 Days Auto-Expiration)</span>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl">
              Temporary login & activity logs are automatically deleted after <strong>3 days (72 hours)</strong> so your database stays clean. Blocked IPs are saved <strong>permanently</strong> until you delete them.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={retentionHours}
              onChange={(e) => setRetentionHours(parseInt(e.target.value, 10))}
              className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-semibold text-slate-200 focus:border-emerald-500 focus:outline-none"
            >
              <option value={24}>24 Hours (1 Day)</option>
              <option value={72}>72 Hours (3 Days)</option>
              <option value={168}>168 Hours (7 Days)</option>
            </select>

            <button
              onClick={handleRunPrune}
              disabled={isPruning}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>{isPruning ? 'Cleaning...' : 'Clean Old Logs Now'}</span>
            </button>
          </div>
        </div>

        {pruneStatus && (
          <div className="p-3.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{pruneStatus}</span>
          </div>
        )}

        {/* Manual IP Block Form */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Ban className="h-5 w-5 text-red-400" />
            <h2 className="text-sm font-bold text-slate-100">Manually Block an IP Address</h2>
          </div>

          <form onSubmit={handleSubmit(onSubmitManualBlock)} className="flex flex-col md:flex-row items-center gap-3">
            <input
              type="text"
              required
              {...register('manualIp')}
              placeholder="Enter IP Address (e.g. 192.168.1.50)..."
              className="w-full md:flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-slate-100 font-mono placeholder-slate-500 focus:border-red-500 focus:outline-none"
            />
            <input
              type="text"
              {...register('manualReason')}
              placeholder="Reason (Optional, e.g. Suspicious User)..."
              className="w-full md:w-64 rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:border-red-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isBlocking}
              className="w-full md:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 rounded-xl text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>{isBlocking ? 'Blocking IP...' : 'Block & Lock IP'}</span>
            </button>
          </form>
        </div>

        {/* Permanent Blocked IP List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-red-400" />
              <h2 className="text-lg font-bold text-slate-100">Permanent IP Lock List ({blockedIps.length})</h2>
            </div>
          </div>

          {blockedIps.length === 0 ? (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
              <p className="text-xs text-emerald-300">
                No IP addresses are currently blocked. Your vault security remains intact with zero active lockouts.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {blockedIps.map((blocked) => (
                <div key={blocked.id} className="rounded-2xl border border-red-500/30 bg-red-500/5 p-5 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{blocked.flagEmoji || getCountryFlag(blocked.countryCode || 'PK')}</span>
                        <span className="font-mono text-sm font-bold text-red-400">{blocked.ip}</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-300">
                        {blocked.attemptCount} Failed Attempts
                      </span>
                    </div>

                    <div className="mt-3 space-y-1 text-xs">
                      <p className="text-slate-400">
                        Origin Region: <strong className="text-slate-200">{blocked.countryName || 'Pakistan'} ({blocked.city || 'Karachi'})</strong>
                      </p>
                      <p className="text-slate-400">
                        Reason: <strong className="text-slate-200">{blocked.reason}</strong>
                      </p>
                      <p className="text-[11px] text-slate-500 pt-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Blocked on: {new Date(blocked.blockedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleUnblock(blocked.ip)}
                    disabled={unblockingIp === blocked.ip}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-red-400 border border-slate-700 hover:border-red-500/40 rounded-xl text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                    title="Remove this IP from blocked list"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-400" />
                    <span>{unblockingIp === blocked.ip ? 'Unblocking...' : 'Delete & Unblock IP'}</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activity Log Table */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Clock className="h-5 w-5 text-emerald-400" />
            Recent Activity Log
          </h2>

          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/60 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">IP Address</th>
                    <th className="px-4 py-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                        No audit events recorded yet.
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3.5 font-mono text-slate-400 whitespace-nowrap text-[11px]">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {getActionBadge(log.action)}
                        </td>
                        <td className="px-4 py-3.5 font-mono text-slate-300 whitespace-nowrap">
                          {log.ip}
                        </td>
                        <td className="px-4 py-3.5 text-slate-300">
                          {log.details || '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
