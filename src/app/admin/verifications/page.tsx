'use client';

import React from 'react';
import {
  FileCheck,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Clock,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

export default function AdminVerificationsPage() {
  const { verifications, approveVerification, rejectVerification } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-white">Government ID Verification Desk</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Audit uploaded passports, national ID cards, and biometric selfies to issue verified member shields.
          </p>
        </div>
      </div>

      {verifications.length === 0 ? (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-12 text-center text-xs text-zinc-400">
          No verification requests in queue.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {verifications.map((v) => (
            <div key={v.id} className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white">{v.userName}</h3>
                  <p className="text-xs text-zinc-400">{v.userEmail}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    v.status === 'APPROVED'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : v.status === 'PENDING'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}
                >
                  {v.status}
                </span>
              </div>

              <div className="text-xs text-zinc-300 space-y-1">
                <div>Document Type: <strong>{v.documentType}</strong></div>
                <div>Submitted At: <strong>{new Date(v.submittedAt).toLocaleString()}</strong></div>
                {v.reviewerNotes && (
                  <div className="text-zinc-400 italic">Notes: "{v.reviewerNotes}"</div>
                )}
              </div>

              {/* Side-by-side Images */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-zinc-400 block">ID Document Front</span>
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950">
                    <img src={v.documentFrontUrl} alt="ID Document" className="h-full w-full object-cover" />
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-zinc-400 block">Live Biometric Selfie</span>
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950">
                    <img src={v.selfieUrl} alt="Selfie" className="h-full w-full object-cover" />
                  </div>
                </div>
              </div>

              {/* Actions */}
              {v.status === 'PENDING' && (
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                  <button
                    onClick={() => {
                      rejectVerification(v.id, 'Document was blurry or facial match was inconclusive.');
                      toast.info(`Rejected verification for ${v.userName}`);
                    }}
                    className="rounded-xl border border-rose-800 bg-rose-950/60 px-4 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-900"
                  >
                    Reject ID
                  </button>
                  <button
                    onClick={() => {
                      approveVerification(v.id, 'Government ID and biometric selfie matched successfully.');
                      toast.success(`Verified identity for ${v.userName}! Blue Shield issued.`);
                    }}
                    className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-700"
                  >
                    Approve & Issue Shield
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
