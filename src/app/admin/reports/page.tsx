'use client';

import React from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle2, XCircle, UserX } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

export default function AdminReportsPage() {
  const { reports, resolveReport, dismissReport, updateUserStatus } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-white">Abuse & Harassment Moderation Desk</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Review user-submitted reports regarding impersonation, harassment, and policy violations.
          </p>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-12 text-center text-xs text-zinc-400">
          No reports currently in moderation queue.
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((r) => (
            <div key={r.id} className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-rose-950 px-2.5 py-0.5 text-[10px] font-bold text-rose-300 border border-rose-800">
                    {r.category}
                  </span>
                  <h3 className="text-sm font-bold text-white">Reported: {r.reportedUserName}</h3>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    r.status === 'RESOLVED'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : r.status === 'OPEN'
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {r.status}
                </span>
              </div>

              <div className="text-xs text-zinc-300 space-y-1">
                <div>Reported by: <strong>{r.reporterName}</strong></div>
                <div>Submitted At: <strong>{new Date(r.timestamp).toLocaleString()}</strong></div>
                <div className="rounded-xl bg-zinc-950 p-3 text-zinc-300 mt-2 italic border border-zinc-800">
                  "{r.description}"
                </div>
                {r.adminActionTaken && (
                  <div className="text-emerald-400 font-medium pt-1">
                    Action Taken: {r.adminActionTaken}
                  </div>
                )}
              </div>

              {r.status === 'OPEN' && (
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                  <button
                    onClick={() => {
                      dismissReport(r.id);
                      toast.info('Report dismissed.');
                    }}
                    className="rounded-xl border border-zinc-700 bg-zinc-800 px-3.5 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-700"
                  >
                    Dismiss Report
                  </button>
                  <button
                    onClick={() => {
                      updateUserStatus(r.reportedUserId, 'SUSPENDED');
                      resolveReport(r.id, 'User account suspended for policy violation.');
                      toast.warning(`Suspended ${r.reportedUserName} and resolved report.`);
                    }}
                    className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-rose-700"
                  >
                    Suspend User & Resolve
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
