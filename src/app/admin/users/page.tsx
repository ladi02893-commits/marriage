'use client';

import React, { useState } from 'react';
import {
  Search,
  ShieldCheck,
  UserCheck,
  Eye,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { AdminUserDossierModal } from '@/components/admin/admin-user-dossier-modal';
import { User } from '@/lib/types';

export default function UserManagementPage() {
  const {
    users,
    currentUser,
    profiles,
    updateUserStatus,
    verifyUserBadge,
    switchUser,
    addExtraConnections,
    refundConnectionCredit,
  } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [selectedUserForDossier, setSelectedUserForDossier] = useState<User | null>(null);
  const [isDossierModalOpen, setIsDossierModalOpen] = useState(false);

  // Top up modal state
  const [topUpModalUser, setTopUpModalUser] = useState<User | null>(null);
  const [creditCount, setCreditCount] = useState(30);

  // Refund modal state (Section 83)
  const [refundModalUser, setRefundModalUser] = useState<User | null>(null);
  const [refundProfileId, setRefundProfileId] = useState('');
  const [refundReason, setRefundReason] = useState('Invalid/non-responsive contact details provided');

  const filteredUsers = users.filter((u) => {
    if (statusFilter !== 'ALL' && u.accountStatus !== statusFilter) return false;
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchName = u.name.toLowerCase().includes(term);
      const matchEmail = u.email.toLowerCase().includes(term);
      const matchCode = u.profileIdCode && u.profileIdCode.toLowerCase().includes(term);
      return matchName || matchEmail || matchCode;
    }
    return true;
  });

  const handleTopUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topUpModalUser) return;
    addExtraConnections(topUpModalUser.id, creditCount);
    setTopUpModalUser(null);
  };

  const handleRefundSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundModalUser) return;
    if (!refundReason.trim()) {
      toast.error('Refund reason is required.');
      return;
    }

    refundConnectionCredit(refundModalUser.id, refundProfileId.trim() || 'VRM-000002', refundReason);
    setRefundModalUser(null);
    setRefundProfileId('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-white">User & Account Directory</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Manage registered members, connection credit balances, manual credit adjustments, refunds, and security statuses.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search member by name, email, or VRM Profile ID..."
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 pl-10 pr-4 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-2xl border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-xs text-zinc-300 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended Account</option>
            <option value="BANNED">Banned (Permanent)</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-2xl border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-xs text-zinc-300 focus:outline-none"
          >
            <option value="ALL">All Roles</option>
            <option value="USER">Members</option>
            <option value="MODERATOR">Moderators</option>
            <option value="ADMIN">Admins</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950/60 text-zinc-400">
                <th className="py-3.5 px-4 font-bold uppercase text-[10px]">Member & VRM ID</th>
                <th className="py-3.5 px-4 font-bold uppercase text-[10px]">Package Tier</th>
                <th className="py-3.5 px-4 font-bold uppercase text-[10px]">Connection Credits</th>
                <th className="py-3.5 px-4 font-bold uppercase text-[10px]">Verification</th>
                <th className="py-3.5 px-4 font-bold uppercase text-[10px]">Status</th>
                <th className="py-3.5 px-4 font-bold uppercase text-[10px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredUsers.map((u) => {
                const prof = profiles.find((p) => p.userId === u.id || p.id === u.profileId);
                const pId = prof?.profileIdCode || u.profileIdCode || 'ID pending';
                const total = u.totalConnections || 100;
                const remaining = u.remainingConnections !== undefined ? u.remainingConnections : 100;

                return (
                  <tr key={u.id} className="hover:bg-zinc-800/30 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatarUrl || '/avatar-placeholder.svg'}
                          alt={u.name}
                          className="h-9 w-9 rounded-xl object-cover ring-1 ring-zinc-700"
                        />
                        <div>
                          <div className="font-bold text-white text-xs">{u.name}</div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="font-mono text-[10px] text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                              {pId}
                            </span>
                            <span className="text-[11px] text-zinc-500 font-mono truncate">{u.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-[10px] font-bold text-amber-400 border border-zinc-700">
                        {u.subscriptionTier.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <span className="font-mono font-bold text-emerald-400">
                          {remaining} / {total} Credits Left
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px]">
                          <button
                            type="button"
                            onClick={() => setTopUpModalUser(u)}
                            className="text-amber-400 hover:underline font-semibold"
                          >
                            + Add Credits
                          </button>
                          <span>•</span>
                          <button
                            type="button"
                            onClick={() => setRefundModalUser(u)}
                            className="text-cyan-400 hover:underline font-semibold"
                          >
                            Refund Credit
                          </button>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        {u.isVerified ? (
                          <span className="inline-flex items-center gap-1 text-blue-400 font-semibold">
                            <ShieldCheck className="h-3.5 w-3.5" /> ID Verified
                          </span>
                        ) : (
                          <span className="text-zinc-500 font-medium">Unverified</span>
                        )}
                        {u.isWhatsappVerified && (
                          <div className="text-[10px] text-emerald-400 font-semibold">
                            WhatsApp Verified
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          u.accountStatus === 'ACTIVE'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : u.accountStatus === 'SUSPENDED'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}
                      >
                        {u.accountStatus}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5 flex-wrap justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUserForDossier(u);
                            setIsDossierModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-2.5 py-1.5 text-[11px] font-semibold text-amber-300 hover:bg-amber-500/20 transition"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Dossier</span>
                        </button>

                        {currentUser?.role === 'SUPER_ADMIN' && u.role === 'USER' && <button
                          onClick={async () => {
                            if (await switchUser(u.id)) window.location.href = '/dashboard';
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-brand-500/40 bg-brand-500/10 px-2 py-1.5 text-[11px] font-semibold text-brand-300 hover:bg-brand-500/20"
                        >
                          <UserCheck className="h-3 w-3" /> Login As
                        </button>}

                        {u.accountStatus === 'ACTIVE' ? (
                          <button
                            onClick={() => {
                              updateUserStatus(u.id, 'SUSPENDED');
                            }}
                            className="rounded-lg border border-amber-800 bg-amber-950/60 px-2 py-1.5 text-[11px] font-semibold text-amber-300 hover:bg-amber-900"
                          >
                            Suspend
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              updateUserStatus(u.id, 'ACTIVE');
                            }}
                            className="rounded-lg border border-emerald-800 bg-emerald-950/60 px-2 py-1.5 text-[11px] font-semibold text-emerald-300 hover:bg-emerald-900"
                          >
                            Restore
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Top Up Connection Credits */}
      {topUpModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-white text-xs">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h4 className="font-bold text-sm">Add Connection Credits: {topUpModalUser.name}</h4>
              <button onClick={() => setTopUpModalUser(null)} className="text-zinc-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleTopUpSubmit} className="space-y-4">
              <div>
                <label className="font-semibold block mb-1">Number of Credits to Add</label>
                <select
                  value={creditCount}
                  onChange={(e) => setCreditCount(Number(e.target.value))}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-zinc-200"
                >
                  <option value={10}>10 Connections Pack</option>
                  <option value={30}>30 Connections Pack</option>
                  <option value={50}>50 Connections Pack</option>
                  <option value={100}>100 Connections Pack</option>
                  <option value={300}>300 Connections (VIP Royal)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTopUpModalUser(null)}
                  className="rounded-xl border border-zinc-700 px-4 py-2 text-zinc-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold px-5 py-2 shadow-md"
                >
                  Confirm & Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Refund Connection Credit (Section 83) */}
      {refundModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-white text-xs">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4 text-amber-500" />
                <h4 className="font-bold text-sm">Refund 1 Connection Credit</h4>
              </div>
              <button onClick={() => setRefundModalUser(null)} className="text-zinc-400 hover:text-white">
                ✕
              </button>
            </div>

            <p className="text-zinc-400">
              Restores 1 connection credit to <strong>{refundModalUser.name}</strong> and records an official audit entry with compulsory reason.
            </p>

            <form onSubmit={handleRefundSubmit} className="space-y-3">
              <div>
                <label className="font-semibold block mb-1">Target Profile ID (Unlocked Candidate)</label>
                <input
                  type="text"
                  value={refundProfileId}
                  onChange={(e) => setRefundProfileId(e.target.value)}
                  placeholder="e.g. VRM-000008"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-zinc-200 uppercase font-mono"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Refund Reason * (Mandatory)</label>
                <textarea
                  rows={3}
                  required
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="e.g. Unresponsive contact details / fake phone number reported by user..."
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-zinc-200 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRefundModalUser(null)}
                  className="rounded-xl border border-zinc-700 px-4 py-2 text-zinc-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold px-5 py-2 shadow-md"
                >
                  Issue Credit Refund
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin User Dossier Modal */}
      <AdminUserDossierModal
        isOpen={isDossierModalOpen}
        onClose={() => {
          setIsDossierModalOpen(false);
          setSelectedUserForDossier(null);
        }}
        user={selectedUserForDossier}
      />
    </div>
  );
}
