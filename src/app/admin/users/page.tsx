'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  ShieldCheck,
  ShieldAlert,
  UserX,
  UserCheck,
  MoreVertical,
  Filter,
  CheckCircle2,
  Crown,
  Eye,
  Heart,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { AdminUserDossierModal } from '@/components/admin/admin-user-dossier-modal';
import { User } from '@/lib/types';

export default function UserManagementPage() {
  const { users, profiles, updateUserStatus, verifyUserBadge, switchUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [selectedUserForDossier, setSelectedUserForDossier] = useState<User | null>(null);
  const [isDossierModalOpen, setIsDossierModalOpen] = useState(false);

  const filteredUsers = users.filter((u) => {
    if (statusFilter !== 'ALL' && u.accountStatus !== statusFilter) return false;
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      return u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-white">User & Account Directory</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Manage registered members, subscription statuses, verification badges, and account restrictions.
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
            placeholder="Search member by name or email..."
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
            <option value="SUSPENDED">Suspended</option>
            <option value="BANNED">Banned</option>
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
                <th className="py-3.5 px-4 font-bold uppercase text-[10px]">Member</th>
                <th className="py-3.5 px-4 font-bold uppercase text-[10px]">Role</th>
                <th className="py-3.5 px-4 font-bold uppercase text-[10px]">Tier</th>
                <th className="py-3.5 px-4 font-bold uppercase text-[10px]">Verification</th>
                <th className="py-3.5 px-4 font-bold uppercase text-[10px]">Status</th>
                <th className="py-3.5 px-4 font-bold uppercase text-[10px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-zinc-800/30 transition">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                        alt={u.name}
                        className="h-9 w-9 rounded-xl object-cover ring-1 ring-zinc-700"
                      />
                      <div>
                        <div className="font-bold text-white text-xs">{u.name}</div>
                        <div className="text-[11px] text-zinc-400 font-mono">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-zinc-300 font-medium">{u.role}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="space-y-1">
                      <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-[10px] font-bold text-amber-400 border border-zinc-700">
                        {u.subscriptionTier.replace('_', ' ')}
                      </span>
                      {u.subscriptionTier !== 'FREE' && u.subscriptionExpiresAt ? (
                        <div className="text-[10px] font-mono text-amber-300/80">
                          Exp: {new Date(u.subscriptionExpiresAt).toLocaleDateString()}
                        </div>
                      ) : (
                        <div className="text-[10px] text-zinc-500">Free Tier (2 Limits)</div>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    {u.isVerified ? (
                      <span className="inline-flex items-center gap-1 text-blue-400 font-semibold">
                        <ShieldCheck className="h-4 w-4" /> Verified
                      </span>
                    ) : (
                      <span className="text-zinc-500 font-medium">Unverified</span>
                    )}
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
                      {/* View Matrimonial Dossier & Connection History */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedUserForDossier(u);
                          setIsDossierModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-2.5 py-1.5 text-[11px] font-semibold text-amber-300 hover:bg-amber-500/20 hover:text-amber-200 transition cursor-pointer shadow-xs"
                        title="View Full Dossier & Connection History"
                      >
                        <Eye className="h-3.5 w-3.5 text-amber-400" />
                        <span>View Dossier</span>
                      </button>

                      {/* Login As / Switch User */}
                      <button
                        onClick={() => {
                          switchUser(u.id);
                          toast.success(`Switched session to ${u.name}`);
                          const targetUrl = u.role === 'SUPER_ADMIN' || u.role === 'ADMIN' ? '/admin' : '/dashboard';
                          window.location.href = targetUrl;
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-brand-500/40 bg-brand-500/10 px-2.5 py-1.5 text-[11px] font-semibold text-brand-300 hover:bg-brand-500/20 transition cursor-pointer"
                        title="Login As This User"
                      >
                        <UserCheck className="h-3 w-3 text-brand-400" /> Login As
                      </button>

                      <button
                        onClick={() => {
                          verifyUserBadge(u.id, !u.isVerified);
                          toast.success(`Verification badge ${!u.isVerified ? 'granted' : 'revoked'} for ${u.name}`);
                        }}
                        className="rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-[11px] font-semibold text-zinc-300 hover:bg-zinc-700 cursor-pointer"
                      >
                        {u.isVerified ? 'Revoke Shield' : 'Grant Shield'}
                      </button>

                      {u.accountStatus === 'ACTIVE' ? (
                        <button
                          onClick={() => {
                            updateUserStatus(u.id, 'SUSPENDED');
                            toast.warning(`Suspended user ${u.name}`);
                          }}
                          className="rounded-lg border border-amber-800 bg-amber-950/60 px-2 py-1.5 text-[11px] font-semibold text-amber-300 hover:bg-amber-900 cursor-pointer"
                        >
                          Suspend
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            updateUserStatus(u.id, 'ACTIVE');
                            toast.success(`Restored user ${u.name}`);
                          }}
                          className="rounded-lg border border-emerald-800 bg-emerald-950/60 px-2 py-1.5 text-[11px] font-semibold text-emerald-300 hover:bg-emerald-900 cursor-pointer"
                        >
                          Restore
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin User Dossier & Connection History Lightbox Modal */}
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
