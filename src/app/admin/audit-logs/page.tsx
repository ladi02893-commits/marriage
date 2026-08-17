'use client';

import React, { useState } from 'react';
import { History, ShieldAlert, Search, Filter, Lock } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function AdminAuditLogsPage() {
  const { auditLogs } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = auditLogs.filter((l) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      l.adminName.toLowerCase().includes(term) ||
      l.action.toLowerCase().includes(term) ||
      l.details.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-white">Immutable Administrative Audit Trail</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Cryptographically timestamped record of administrative actions, verifications, and user suspensions.
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-800 px-3.5 py-1 text-[11px] font-mono font-semibold text-amber-400 border border-zinc-700">
          <Lock className="h-3.5 w-3.5" /> Append-Only Vault
        </span>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter audit events by admin, action, or keyword..."
          className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 pl-10 pr-4 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
        />
      </div>

      {/* Logs Table */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950 text-zinc-400">
                <th className="py-3.5 px-4 font-bold uppercase text-[10px]">Timestamp</th>
                <th className="py-3.5 px-4 font-bold uppercase text-[10px]">Admin Officer</th>
                <th className="py-3.5 px-4 font-bold uppercase text-[10px]">Action Type</th>
                <th className="py-3.5 px-4 font-bold uppercase text-[10px]">Target</th>
                <th className="py-3.5 px-4 font-bold uppercase text-[10px]">Audit Event Details</th>
                <th className="py-3.5 px-4 font-bold uppercase text-[10px] text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-zinc-800/30">
                  <td className="py-3.5 px-4 text-zinc-400 font-mono text-[11px]">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-white">{log.adminName}</td>
                  <td className="py-3.5 px-4">
                    <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-mono font-bold text-amber-400 border border-amber-500/30">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-zinc-300 font-mono text-[11px]">{log.targetType}</td>
                  <td className="py-3.5 px-4 text-zinc-300 max-w-sm">{log.details}</td>
                  <td className="py-3.5 px-4 text-right font-mono text-zinc-500 text-[11px]">{log.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
