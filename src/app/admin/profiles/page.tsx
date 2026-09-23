'use client';

import React, { useState } from 'react';
import {
  UserCheck,
  ShieldCheck,
  Eye,
  MessageCircle,
  Search,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { AdminUserDossierModal } from '@/components/admin/admin-user-dossier-modal';
import { User, MatrimonialProfile } from '@/lib/types';

export default function AdminProfilesModerationPage() {
  const { profiles, users, updateProfileApproval, refreshDatabase } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'ALL' | 'VERIFIED' | 'NEEDS_REVIEW' | 'PENDING_APPROVAL'>('ALL');
  const [selectedUserForDossier, setSelectedUserForDossier] = useState<User | null>(null);
  const [selectedProfileForDossier, setSelectedProfileForDossier] = useState<MatrimonialProfile | null>(null);
  const [isDossierModalOpen, setIsDossierModalOpen] = useState(false);
  const reviewPhoto = async (photoId: string, isApproved: boolean) => {
    try {
      const response = await fetch('/api/profile-photos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: photoId, isApproved }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || 'Review failed.');
      await refreshDatabase();
      toast.success(isApproved ? 'Photo approved.' : 'Photo hidden.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Photo review failed.');
    }
  };

  const filteredProfiles = profiles.filter((p) => {
    if (filterMode === 'PENDING_APPROVAL' && p.approvalStatus !== 'PENDING_APPROVAL') return false;
    if (filterMode === 'VERIFIED' && p.verificationBadge !== 'APPROVED') return false;
    if (filterMode === 'NEEDS_REVIEW' && (p.verificationBadge === 'APPROVED' && p.approvalStatus === 'APPROVED')) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchName = p.fullName.toLowerCase().includes(term);
      const matchCity = p.city.toLowerCase().includes(term);
      const matchProf = p.educationCareer?.profession?.toLowerCase().includes(term);
      const matchCode = p.profileIdCode?.toLowerCase().includes(term);
      if (!matchName && !matchCity && !matchProf && !matchCode) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-white flex items-center gap-2">
            <UserCheck className="h-6 w-6 text-amber-500" /> Matrimonial Profile Screening
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Review photos, biographies, approval status, and applicant contact details.
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
        <div className="flex items-center gap-1.5 rounded-2xl border border-zinc-800 bg-zinc-900 p-1 flex-wrap">
          {(['ALL', 'PENDING_APPROVAL', 'VERIFIED', 'NEEDS_REVIEW'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                filterMode === mode
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {mode === 'ALL'
                ? 'All Profiles'
                : mode === 'PENDING_APPROVAL'
                ? 'Pending Approval'
                : mode === 'VERIFIED'
                ? 'Verified Badges'
                : 'Needs Screening'}
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
          const cleanPhone = p.phone?.replace(/[^0-9]/g, '');
          const whatsappUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
            `Assalam-o-Alaikum ${p.fullName}, this is the Concierge from VIP Royal Matchmaking regarding your matrimonial profile (#${p.id}).`
          )}` : null;

          return (
            <div key={p.id} className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 space-y-4 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        p.photos?.[0]?.url ||
                        '/avatar-placeholder.svg'
                      }
                      alt={p.fullName}
                      className="h-14 w-14 rounded-2xl object-cover ring-2 ring-amber-500/20"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-base font-bold text-white">{p.fullName}</h3>
                        {p.verificationBadge === 'APPROVED' && (
                          <ShieldCheck className="h-4 w-4 text-emerald-500" />
                        )}
                      </div>
                      <p className="text-xs text-zinc-400">
                        {p.age} yrs • {p.caste || 'Caste Specified'} • {p.city}, {p.country}
                      </p>
                      <p className="text-[11px] text-zinc-500 font-mono">{p.phone || 'Not provided'}</p>
                    </div>
                  </div>

                  {/* AI Trust Metrics */}
                  <div className="text-right">
                    <div className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                      <Sparkles className="h-2.5 w-2.5" /> Quality: {p.profileQualityScore ?? 'Not assessed'}{p.profileQualityScore != null ? '%' : ''}
                    </div>
                    <div className="text-[10px] text-zinc-500 mt-1">
                      Fraud Risk: <span className="text-zinc-300 font-bold">Not assessed</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-zinc-950 p-4 border border-zinc-800 space-y-2 text-xs">
                  <div className="font-semibold text-amber-400 font-serif">"{p.bioHeadline}"</div>
                  <p className="text-zinc-400 leading-relaxed italic line-clamp-2">"{p.aboutMe}"</p>
                </div>
              </div>

              {p.photos?.some((photo) => !photo.isApproved) && (
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-3 space-y-2">
                  <p className="text-xs font-semibold text-amber-300">Photos awaiting review</p>
                  <div className="flex flex-wrap gap-3">
                    {p.photos.filter((photo) => !photo.isApproved).map((photo) => (
                      <div key={photo.id} className="space-y-1">
                        <img src={photo.url} alt="Pending profile photo" className="h-20 w-20 rounded-xl object-cover" />
                        <button type="button" onClick={() => void reviewPhoto(photo.id, true)} className="rounded-lg bg-emerald-600 px-2 py-1 text-[11px] font-bold text-white">Approve</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-zinc-800 text-xs">
                {whatsappUrl ? <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-xl border border-emerald-600/30 bg-emerald-950/40 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-900/40 transition"
                >
                  <MessageCircle className="h-3.5 w-3.5" /> WhatsApp Applicant
                </a> : <span className="text-zinc-500">No phone provided</span>}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const matchedUser = users.find((u) => u.id === p.userId || u.profileId === p.id);
                      if (!matchedUser) {
                        toast.error('The user record for this profile could not be loaded.');
                        return;
                      }

                      setSelectedUserForDossier(matchedUser);
                      setSelectedProfileForDossier(p);
                      setIsDossierModalOpen(true);
                    }}
                    className="rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-1.5 font-semibold text-zinc-300 hover:bg-zinc-700 hover:text-white transition cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5 inline mr-1 text-amber-400" /> Dossier
                  </button>
                  {p.approvalStatus !== 'APPROVED' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          updateProfileApproval(p.id, 'APPROVED');
                        }}
                        className="rounded-xl bg-emerald-600 px-3.5 py-1.5 font-bold text-white shadow-md hover:bg-emerald-700 transition cursor-pointer"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          updateProfileApproval(p.id, 'REJECTED', 'Profile rejected by moderation desk.');
                        }}
                        className="rounded-xl border border-rose-800 bg-rose-950/60 px-2.5 py-1.5 font-bold text-rose-300 hover:bg-rose-900 transition cursor-pointer"
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <span className="rounded-xl bg-emerald-950/60 border border-emerald-800/60 px-3 py-1 text-[11px] font-bold text-emerald-400">
                      Approved
                    </span>
                  )}
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
