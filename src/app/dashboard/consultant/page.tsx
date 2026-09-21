'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Crown,
  Calendar,
  Phone,
  MessageSquare,
  Mail,
  Clock,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Send,
  Building,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { ProfileCard } from '@/components/profile/profile-card';
import { toast } from 'sonner';

export default function UserConsultantPage() {
  const {
    currentUser,
    currentProfile,
    profiles,
    consultants,
    consultantRecommendations,
  } = useAuth();

  const [appointmentOpen, setAppointmentOpen] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('11:00 AM');
  const [agenda, setAgenda] = useState('');

  const [messageText, setMessageText] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      sender: 'consultant',
      text: 'Assalam-o-Alaikum! I am Begum Bilquis Khan, your designated Senior Family Matchmaking Consultant. I have reviewed your family preferences and selected high-compatibility candidates for your review.',
      time: 'Yesterday, 4:30 PM',
    },
  ]);

  // Assigned Consultant (Section 24)
  const consultant =
    consultants.find((c) => c.id === currentUser?.assignedConsultantId) ||
    consultants[0] || {
      id: 'consultant-1',
      name: 'Begum Bilquis Khan',
      title: 'Senior Executive Matchmaking Director',
      photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600',
      phone: '+92 300 8492011',
      email: 'bilquis.consultant@viproyalmatch.pk',
      experienceYears: 18,
      specialization: 'Prominent & Industrial Families Matchmaking',
      bio: 'Over 18 years of high-society family matchmaking across Lahore, Islamabad, Karachi, and British-Pakistani expatriates. Specializes in discreet background verification and dignified family introductions.',
    };

  // Recommendations for this user (Section 26)
  const myRecommendations = consultantRecommendations.filter(
    (r) => r.userId === currentUser?.id || r.userId === currentProfile?.userId
  );

  const recommendedProfiles = profiles.filter((p) =>
    myRecommendations.some((r) => r.targetProfileId === p.id)
  );

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    setChatHistory((prev) => [
      ...prev,
      {
        sender: 'user',
        text: messageText,
        time: 'Just now',
      },
    ]);
    const userMsg = messageText;
    setMessageText('');

    setTimeout(() => {
      setChatHistory((prev) => [
        ...prev,
        {
          sender: 'consultant',
          text: `Thank you for the update. I have noted this in your family dossier and will review matching candidates accordingly.`,
          time: 'Just now',
        },
      ]);
    }, 1200);
  };

  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointmentDate) {
      toast.error('Please choose a preferred consultation date.');
      return;
    }
    toast.success(
      `Appointment requested with ${consultant.name} for ${appointmentDate} at ${appointmentTime}. We will confirm on WhatsApp!`
    );
    setAppointmentOpen(false);
    setAppointmentDate('');
    setAgenda('');
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-brand-950 via-brand-900 to-brand-950 border border-gold-500/30 p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-gold-500/20 px-3.5 py-0.5 text-xs font-bold text-gold-300 border border-gold-500/40">
              <Crown className="h-3.5 w-3.5 text-gold-400" /> Dedicated Senior Family Consultant
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif">
              Bespoke Matrimonial Concierge
            </h1>
            <p className="text-xs sm:text-sm text-brand-100/90 leading-relaxed">
              Every VIP member is paired with an experienced Senior Family Consultant who provides confidential screening, family verification, and curated match introductions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setAppointmentOpen(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-gold-500 hover:bg-gold-600 px-5 py-3 text-xs font-bold text-brand-950 shadow-lg transition"
            >
              <Calendar className="h-4 w-4" /> Book Appointment
            </button>
            <a
              href={`https://wa.me/${(consultant.whatsappNumber || consultant.phone)?.replace(/[^0-9]/g, '') || '923008492011'}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 hover:bg-white/20 px-4 py-3 text-xs font-semibold text-white transition backdrop-blur-md"
            >
              <Phone className="h-4 w-4 text-emerald-400" /> WhatsApp Consultant
            </a>
          </div>
        </div>
      </div>

      {/* Consultant Dossier Card */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="relative shrink-0">
              <img
                src={consultant.photoUrl}
                alt={consultant.name}
                className="h-28 w-28 rounded-3xl object-cover border-2 border-gold-500 shadow-lg"
              />
              <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-gold-500 text-brand-950 flex items-center justify-center shadow-md">
                <Crown className="h-4 w-4" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold font-serif text-foreground">{consultant.name}</h2>
                <span className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2.5 py-0.5 text-[10px] font-bold">
                  Assigned Consultant
                </span>
              </div>
              <p className="text-xs font-semibold text-gold-600 dark:text-gold-400">{consultant.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
                {consultant.bio ||
                  'Experienced family matchmaker dedicated to high-standing family introductions with discretion and Islamic values.'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 text-xs">
                <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60">
                  <span className="text-[10px] text-muted-foreground block uppercase font-bold">Experience</span>
                  <strong className="text-foreground">{consultant.experienceYears || 18}+ Years in Matchmaking</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60">
                  <span className="text-[10px] text-muted-foreground block uppercase font-bold">Direct Office Line</span>
                  <strong className="font-mono text-foreground">{consultant.phone || '+92 300 8492011'}</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60">
                  <span className="text-[10px] text-muted-foreground block uppercase font-bold">Confidential Email</span>
                  <strong className="text-foreground truncate block font-mono text-[11px]">{consultant.email}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended by Your Consultant Section (Section 26) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-gold-600 dark:text-gold-400 mb-0.5">
              <Crown className="h-3.5 w-3.5" /> Consultant Handpicked Matches
            </div>
            <h3 className="text-xl font-bold font-serif text-foreground">
              Recommended by Your Consultant
            </h3>
            <p className="text-xs text-muted-foreground">
              “Based on your preferences and family requirements.”
            </p>
          </div>
          <span className="font-mono text-xs font-bold bg-gold-100 text-gold-800 dark:bg-gold-950 dark:text-gold-300 px-3 py-1 rounded-full">
            {recommendedProfiles.length > 0 ? recommendedProfiles.length : 3} Recommendations
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {(recommendedProfiles.length > 0
            ? recommendedProfiles
            : profiles.filter((p) => p.id !== currentProfile?.id && p.gender !== currentProfile?.gender).slice(0, 3)
          ).map((p) => (
            <div key={p.id} className="relative">
              <div className="mb-2 rounded-2xl bg-gold-50 dark:bg-gold-950/30 border border-gold-300/40 p-3 text-xs text-muted-foreground">
                <strong className="text-gold-700 dark:text-gold-300 block mb-0.5 font-bold">
                  Consultant Note:
                </strong>
                “Based on your preferences and family requirements. Both families share harmonious educational values.”
              </div>
              <ProfileCard profile={p} />
            </div>
          ))}
        </div>
      </div>

      {/* Direct Consultant Consultation Chat Window */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gold-100 dark:bg-gold-950 text-gold-600 flex items-center justify-center font-bold">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">
                Confidential Dialogue with {consultant.name}
              </h4>
              <p className="text-[11px] text-muted-foreground">
                Inquiries are answered within business hours (Monday – Saturday, 10am – 7pm)
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Consultant Online
          </span>
        </div>

        <div className="h-64 overflow-y-auto space-y-3 p-4 rounded-2xl bg-muted/20 border border-border/60">
          {chatHistory.map((msg, i) => (
            <div
              key={i}
              className={`flex flex-col ${
                msg.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-lg rounded-2xl p-3.5 text-xs ${
                  msg.sender === 'user'
                    ? 'bg-brand-600 text-white rounded-br-none shadow-sm'
                    : 'bg-card border border-border text-foreground rounded-bl-none shadow-xs'
                }`}
              >
                {msg.text}
              </div>
              <span className="text-[10px] text-muted-foreground mt-1 px-1">
                {msg.time}
              </span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder={`Send confidential query to ${consultant.name}...`}
            className="flex-1 rounded-2xl border border-border bg-muted/30 p-3 text-xs text-foreground focus:border-brand-500 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-2xl bg-brand-600 hover:bg-brand-700 text-white px-5 py-3 text-xs font-bold shadow-md transition flex items-center gap-1.5"
          >
            <Send className="h-4 w-4" /> Send
          </button>
        </form>
      </div>

      {/* Appointment Modal */}
      {appointmentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-card border border-border rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gold-500" />
                <h4 className="font-bold text-sm text-foreground">
                  Schedule Family Consultation
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setAppointmentOpen(false)}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBookAppointment} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-foreground block mb-1">
                  Preferred Date *
                </label>
                <input
                  type="date"
                  required
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-foreground focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">
                  Preferred Time Slot
                </label>
                <select
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-foreground focus:border-brand-500 focus:outline-none"
                >
                  <option value="11:00 AM">11:00 AM - 12:00 PM</option>
                  <option value="02:30 PM">02:30 PM - 03:30 PM</option>
                  <option value="04:30 PM">04:30 PM - 05:30 PM</option>
                  <option value="06:00 PM">06:00 PM - 07:00 PM</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">
                  Meeting Notes & Specific Inquiries
                </label>
                <textarea
                  rows={3}
                  value={agenda}
                  onChange={(e) => setAgenda(e.target.value)}
                  placeholder="Tell your consultant which profiles you'd like to discuss or specific family expectations..."
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-foreground focus:border-brand-500 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAppointmentOpen(false)}
                  className="rounded-xl border border-border px-4 py-2 font-medium text-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-brand-600 hover:bg-brand-700 px-5 py-2 font-bold text-white shadow-sm"
                >
                  Confirm Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
