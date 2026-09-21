'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Crown,
  Users,
  Calendar,
  Sparkles,
  Search,
  CheckCircle2,
  Clock,
  MessageSquare,
  FileText,
  Lock,
  Eye,
  Plus,
  ArrowRight,
  ShieldCheck,
  Send,
  UserCheck,
  Building,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { toast } from 'sonner';

export default function ConsultantPortalPage() {
  const router = useRouter();
  const {
    currentUser,
    users,
    profiles,
    consultants,
    consultantRecommendations,
    consultantNotes,
    addConsultantRecommendation,
    addConsultantNote,
  } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      router.push('/login?redirect=/consultant');
    } else if (currentUser.role === 'USER') {
      router.push('/dashboard/consultant');
    }
  }, [currentUser, router]);

  if (!currentUser || currentUser.role === 'USER') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center space-y-3">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gold-500 border-r-transparent" />
          <p className="text-xs text-muted-foreground">Verifying consultant clearance & family dossier access...</p>
        </div>
      </div>
    );
  }

  const activeConsultant = consultants[0] || {
    id: 'consultant-1',
    name: 'Begum Bilquis Khan',
    title: 'Senior Executive Matchmaking Director',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600',
    specialization: 'Prominent & Industrial Families Matchmaking',
  };

  // Selected Client for Actions
  const [selectedClientUserId, setSelectedClientUserId] = useState<string | null>(null);

  // Recommend Match Modal
  const [recommendModalOpen, setRecommendModalOpen] = useState(false);
  const [selectedTargetProfileId, setSelectedTargetProfileId] = useState('');
  const [recommendationNote, setRecommendationNote] = useState(
    'Based on your preferences and family requirements. Both families share harmonious educational values.'
  );

  // Private Note Modal
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');

  // Search Filter
  const [searchQuery, setSearchQuery] = useState('');

  // Clients assigned to this consultant or VIP members
  const assignedUsers = users.filter((u) => {
    const isVip = u.subscriptionTier === 'VIP' || u.subscriptionTier === 'PREMIUM_PLUS' || u.assignedConsultantId === activeConsultant.id;
    if (!searchQuery) return isVip || u.role === 'USER';
    const q = searchQuery.toLowerCase();
    return u.name.toLowerCase().includes(q) || (u.profileIdCode && u.profileIdCode.toLowerCase().includes(q));
  });

  const handleOpenRecommend = (userId: string) => {
    setSelectedClientUserId(userId);
    setSelectedTargetProfileId('');
    setRecommendModalOpen(true);
  };

  const handleOpenNote = (userId: string) => {
    setSelectedClientUserId(userId);
    setNewNoteContent('');
    setNoteModalOpen(true);
  };

  const submitRecommendation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientUserId || !selectedTargetProfileId) {
      toast.error('Please select a target profile to recommend.');
      return;
    }

    addConsultantRecommendation(selectedClientUserId, selectedTargetProfileId, recommendationNote);
    toast.success('Recommendation dispatched to client dashboard under "Recommended by Your Consultant"!');
    setRecommendModalOpen(false);
  };

  const submitNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientUserId || !newNoteContent.trim()) {
      toast.error('Please enter note contents.');
      return;
    }

    addConsultantNote(selectedClientUserId, activeConsultant.id, newNoteContent, true);
    toast.success('Private staff note saved securely.');
    setNoteModalOpen(false);
  };

  const selectedClient = users.find((u) => u.id === selectedClientUserId);
  const selectedClientProfile = profiles.find((p) => p.userId === selectedClientUserId);

  // Filter eligible candidate profiles for recommendation
  const eligibleCandidates = profiles.filter(
    (p) => p.id !== selectedClientProfile?.id && p.gender !== selectedClientProfile?.gender
  );

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Top Consultant Header Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-brand-950 via-brand-900 to-brand-950 border border-gold-500/30 p-6 sm:p-8 text-white shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <img
                src={activeConsultant.photoUrl}
                alt={activeConsultant.name}
                className="h-20 w-20 rounded-2xl object-cover border-2 border-gold-500 shadow-md"
              />
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-gold-500/20 px-3 py-0.5 text-xs font-bold text-gold-300 border border-gold-500/40">
                  <Crown className="h-3.5 w-3.5 text-gold-400" /> Senior Family Consultant Portal
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold font-serif">{activeConsultant.name}</h1>
                <p className="text-xs text-brand-100/80">{activeConsultant.title} • {activeConsultant.specialization}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2.5 text-xs font-semibold text-white transition backdrop-blur-md"
              >
                ← Return to Member View
              </Link>
            </div>
          </div>
        </div>

        {/* KPI Performance Cards (Section 72) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <span className="text-xs font-semibold text-muted-foreground block mb-2">Assigned VIP Clients</span>
            <div className="text-2xl font-black font-serif text-foreground">{assignedUsers.length}</div>
            <span className="text-[11px] text-brand-600 font-medium mt-1 block">Active family dossiers</span>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <span className="text-xs font-semibold text-muted-foreground block mb-2">Pending Follow-Ups</span>
            <div className="text-2xl font-black font-serif text-amber-600">3</div>
            <span className="text-[11px] text-muted-foreground mt-1 block">Scheduled for this week</span>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <span className="text-xs font-semibold text-muted-foreground block mb-2">Matches Handpicked</span>
            <div className="text-2xl font-black font-serif text-emerald-600">{consultantRecommendations.length || 18}</div>
            <span className="text-[11px] text-muted-foreground mt-1 block">Curated introductions</span>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <span className="text-xs font-semibold text-muted-foreground block mb-2">Confidential Notes</span>
            <div className="text-2xl font-black font-serif text-foreground">{consultantNotes.length || 24}</div>
            <span className="text-[11px] text-muted-foreground mt-1 block">Staff-only records</span>
          </div>
        </div>

        {/* Assigned Clients Management Section (Section 25) */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
            <div>
              <h3 className="text-lg font-bold font-serif text-foreground">Assigned VIP Client Roster</h3>
              <p className="text-xs text-muted-foreground">
                Review client preferences, suggest tailored matches with personalized family notes, and maintain confidential follow-up journals.
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by client name or VRM ID..."
                className="w-full rounded-2xl border border-border bg-muted/30 pl-10 pr-4 py-2 text-xs text-foreground focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Clients Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-border text-muted-foreground uppercase text-[10px] tracking-wider font-bold">
                  <th className="py-3 px-3">Client & ID</th>
                  <th className="py-3 px-3">Location & Caste</th>
                  <th className="py-3 px-3">Package Tier</th>
                  <th className="py-3 px-3">Connection Credits</th>
                  <th className="py-3 px-3">Follow-Up Date</th>
                  <th className="py-3 px-3 text-right">Consultant Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {assignedUsers.slice(0, 10).map((u) => {
                  const prof = profiles.find((p) => p.userId === u.id || p.id === u.profileId);
                  const pId = prof?.profileIdCode || u.profileIdCode || 'VRM-000001';

                  return (
                    <tr key={u.id} className="hover:bg-muted/30 transition">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120'}
                            alt={u.name}
                            className="h-10 w-10 rounded-xl object-cover ring-1 ring-border"
                          />
                          <div>
                            <strong className="text-foreground block font-bold">{u.name}</strong>
                            <span className="font-mono text-[10px] font-bold text-brand-700 dark:text-brand-300">
                              {pId}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="text-foreground font-medium block">
                          {prof?.city || 'Lahore'}, Pakistan
                        </span>
                        <span className="text-[11px] text-muted-foreground">{prof?.caste || 'Syed'}</span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="rounded-full bg-gold-100 text-gold-900 dark:bg-gold-950 dark:text-gold-300 px-2.5 py-0.5 text-[10px] font-bold">
                          {u.subscriptionTier.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-mono font-bold text-foreground">
                          {u.remainingConnections || 100} / {u.totalConnections || 100}
                        </span>
                        <span className="text-[10px] text-muted-foreground block">Credits</span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="text-foreground font-medium flex items-center gap-1">
                          <Clock className="h-3 w-3 text-amber-500" /> Sep 24, 2026
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenRecommend(u.id)}
                            className="rounded-xl bg-gold-500 hover:bg-gold-600 text-brand-950 font-bold px-3 py-1.5 text-[11px] shadow-xs transition flex items-center gap-1"
                          >
                            <Sparkles className="h-3 w-3" /> Recommend Match
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenNote(u.id)}
                            className="rounded-xl border border-border hover:bg-muted text-foreground font-semibold px-2.5 py-1.5 text-[11px] transition flex items-center gap-1"
                          >
                            <FileText className="h-3 w-3 text-brand-600" /> Private Note
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Private Staff Notes Journal (Section 27: Staff Only) */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-brand-600" />
              <h3 className="text-base font-bold font-serif text-foreground">
                Confidential Staff Journal (Consultant & Admin Only)
              </h3>
            </div>
            <span className="text-[11px] text-muted-foreground font-medium">
              * Client cannot view staff notes
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {consultantNotes.slice(0, 4).map((note) => {
              const targetUser = users.find((u) => u.id === note.userId);

              return (
                <div
                  key={note.id}
                  className="rounded-2xl bg-muted/20 border border-border/80 p-4 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground flex items-center gap-1.5">
                      <UserCheck className="h-3.5 w-3.5 text-gold-500" /> Client: {targetUser?.name || 'VIP Member'}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed italic">
                    "{note.note}"
                  </p>
                  <div className="text-[10px] text-brand-700 dark:text-brand-300 font-bold">
                    Recorded by Begum Bilquis Khan (Matchmaker)
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Modal 1: Recommend Match (Section 26) */}
      {recommendModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-card border border-border rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-gold-500" />
                <h4 className="font-bold text-sm text-foreground">
                  Recommend Match for {selectedClient?.name}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setRecommendModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={submitRecommendation} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-foreground block mb-1">
                  Select Compatible Candidate Profile *
                </label>
                <select
                  required
                  value={selectedTargetProfileId}
                  onChange={(e) => setSelectedTargetProfileId(e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-foreground focus:border-brand-500 focus:outline-none"
                >
                  <option value="">-- Choose Candidate from Verified Directory --</option>
                  {eligibleCandidates.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName} ({c.profileIdCode || 'VRM-000001'}) • {c.age} Yrs • {c.city} • {c.caste}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">
                  Personalized Consultant Advice Note (Shown on User Dashboard)
                </label>
                <textarea
                  rows={3}
                  required
                  value={recommendationNote}
                  onChange={(e) => setRecommendationNote(e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-foreground focus:border-brand-500 focus:outline-none resize-none"
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  * Appears directly under "Recommended by Your Consultant" on client's dashboard.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRecommendModalOpen(false)}
                  className="rounded-xl border border-border px-4 py-2 font-medium text-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gold-500 hover:bg-gold-600 text-brand-950 font-bold px-5 py-2 shadow-sm"
                >
                  Publish Recommendation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Add Private Staff Note (Section 27) */}
      {noteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-card border border-border rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-brand-600" />
                <h4 className="font-bold text-sm text-foreground">
                  Confidential Note: {selectedClient?.name}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setNoteModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={submitNote} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-foreground block mb-1">
                  Private Consultant Note
                </label>
                <textarea
                  rows={4}
                  required
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  placeholder="Family conversation outcome, specific caste sensitivities, guardian requirements, or verified background observations..."
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-foreground focus:border-brand-500 focus:outline-none resize-none"
                />
                <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1">
                  Confidential: Only accessible to verified matchmaking consultants and system administrators.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNoteModalOpen(false)}
                  className="rounded-xl border border-border px-4 py-2 font-medium text-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold px-5 py-2 shadow-sm"
                >
                  Save Note to Dossier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
