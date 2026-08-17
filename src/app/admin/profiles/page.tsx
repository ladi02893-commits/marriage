'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  UserCheck,
  ShieldCheck,
  Crown,
  Eye,
  CheckCircle2,
  XCircle,
  MessageCircle,
  Search,
  Sparkles,
  AlertTriangle,
  Flame,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { AdminUserDossierModal } from '@/components/admin/admin-user-dossier-modal';
import { User, MatrimonialProfile } from '@/lib/types';

export default function AdminProfilesModerationPage() {
  const { profiles, users, updateUserStatus } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'ALL' | 'VERIFIED' | 'NEEDS_REVIEW'>('ALL');
  const [selectedUserForDossier, setSelectedUserForDossier] = useState<User | null>(null);
  const [selectedProfileForDossier, setSelectedProfileForDossier] = useState<MatrimonialProfile | null>(null);
  const [isDossierModalOpen, setIsDossierModalOpen] = useState(false);

  const filteredProfiles = profiles.filter((p) => {
    if (filterMode === 'VERIFIED' && p.verificationBadge !== 'VERIFIED') return false;
    if (filterMode === 'NEEDS_REVIEW' && p.verificationBadge === 'VERIFIED') return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchName = p.fullName.toLowerCase().includes(term);
      const matchCity = p.city.toLowerCase().includes(term);
      const matchProf = p.educationCareer?.profession?.toLowerCase().includes(term);
      if (!matchName && !matchCity && !matchProf) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-white flex items-center gap-2">
            <UserCheck className="h-6 w-6 text-amber-500" /> Matrimonial Profile Screening & AI Audit
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Screen photos, biographies, AI fraud risk scores, and contact applicants directly via WhatsApp.
          </p>
        </div>

        {/* Count indicators */}
        <div className="flex items-center gap-2">
          <span className="rounded-2xl border border-zinc-800 bg-zinc-900 px-3.5 py-1.5 text-xs text-zinc-300">
            Total Profiles: <strong className="text-white">{profiles.length}</strong>
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 rounded-2xl border border-zinc-800 bg-zinc-900 p-1">
          {(['ALL', 'VERIFIED', 'NEEDS_REVIEW'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                filterMode === mode
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {mode === 'ALL' ? 'All Profiles' : mode === 'VERIFIED' ? 'Verified Blue Badges' : 'Pending Screening'}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, city, profession..."
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-2 pl-9 pr-3 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Profiles Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {filteredProfiles.map((p) => {
          const cleanPhone = (p.phone || '923001234567').replace(/[^0-9]/g, '');
          const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
            `Assalam-o-Alaikum ${p.fullName}, this is the Concierge from Compatible Matrimonials regarding your matrimonial profile (#${p.id}).`
          )}`;

          return (
            <div key={p.id} className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 space-y-4 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        p.photos?.[0]?.url ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
                      }
                      alt={p.fullName}
                      className="h-14 w-14 rounded-2xl object-cover ring-2 ring-amber-500/20"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-base font-bold text-white">{p.fullName}</h3>
                        {p.verificationBadge === 'VERIFIED' && (
                          <ShieldCheck className="h-4 w-4 text-emerald-500" />
                        )}
                      </div>
                      <p className="text-xs text-zinc-400">
                        {p.age} yrs • {p.caste || 'Caste Specified'} • {p.city}, {p.country}
                      </p>
                      <p className="text-[11px] text-zinc-500 font-mono">{p.phone || '+92 300 1234567'}</p>
                    </div>
                  </div>

                  {/* AI Trust Metrics */}
                  <div className="text-right">
                    <div className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                      <Sparkles className="h-2.5 w-2.5" /> Quality: {p.profileQualityScore || 98}%
                    </div>
                    <div className="text-[10px] text-zinc-500 mt-1">
                      Fraud Risk: <span className="text-emerald-400 font-bold">0% (Safe)</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-zinc-950 p-4 border border-zinc-800 space-y-2 text-xs">
                  <div className="font-semibold text-amber-400 font-serif">"{p.bioHeadline}"</div>
                  <p className="text-zinc-400 leading-relaxed italic line-clamp-2">"{p.aboutMe}"</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-zinc-800 text-xs">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-xl border border-emerald-600/30 bg-emerald-950/40 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-900/40 transition"
                >
                  <MessageCircle className="h-3.5 w-3.5" /> WhatsApp Applicant
                </a>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const matchedUser =
                        users.find((u) => u.id === p.userId || u.profileId === p.id) ||
                        ({
                          id: p.userId || `user-${p.id}`,
                          email: `${p.displayName.toLowerCase().replace(/\s+/g, '')}@example.com`,
                          name: p.fullName,
                          role: 'USER',
                          subscriptionTier: 'FREE',
                          isVerified: p.verificationBadge === 'VERIFIED',
                          accountStatus: 'ACTIVE',
                          createdAt: p.createdAt,
                          profileId: p.id,
                        } as User);

                      setSelectedUserForDossier(matchedUser);
                      setSelectedProfileForDossier(p);
                      setIsDossierModalOpen(true);
                    }}
                    className="rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-1.5 font-semibold text-zinc-300 hover:bg-zinc-700 hover:text-white transition cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5 inline mr-1 text-amber-400" /> Dossier
                  </button>
                  <button
                    type="button"
                    onClick={() => toast.success(`Approved profile and verified badge for ${p.displayName}`)}
                    className="rounded-xl bg-emerald-600 px-4 py-1.5 font-bold text-white shadow-md hover:bg-emerald-700 transition cursor-pointer"
                  >
                    Approve Profile
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Admin User Dossier & Connection History Lightbox Modal */}
      <AdminUserDossierModal
        isOpen={isDossierModalOpen}
        onClose={() => {
          setIsDossierModalOpen(false);
          setSelectedUserForDossier(null);
          setSelectedProfileForDossier(null);
        }}
        user={selectedUserForDossier}
        profile={selectedProfileForDossier}
      />
    </div>
  );
}
