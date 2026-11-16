'use client';

import React from 'react';
import Link from 'next/link';
import { Building2, Compass, Mail, MapPin, MessageCircle, Phone, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function UserMarriageBureauPage() {
  const { currentUser, currentProfile, bureaus } = useAuth();

  const resolvedBureauId =
    currentUser?.bureauId ||
    currentProfile?.bureauId ||
    currentUser?.assignedConsultantId ||
    currentProfile?.assignedConsultantId;

  const bureau = bureaus.find((item) => item.id === resolvedBureauId);

  if (!bureau) {
    return (
      <div className="mx-auto max-w-3xl py-12">
        <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-sm space-y-4">
          <Building2 className="mx-auto h-10 w-10 text-gold-500" />
          <h1 className="text-2xl font-bold font-serif text-foreground">No Marriage Bureau Linked</h1>
          <p className="mx-auto max-w-xl text-sm text-muted-foreground">
            Your account is not currently associated with a city Marriage Bureau office. You can browse all approved proposals across the platform.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link href="/search" className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-xs font-bold text-white hover:bg-brand-700">
              <Compass className="h-4 w-4" /> Explore Platform Rishtas
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const phone = bureau.whatsappNumber || bureau.phone;

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-8">
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8 space-y-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                <ShieldCheck className="h-3.5 w-3.5" /> Admin Approved Marriage Bureau
              </span>
              <span className="rounded-full border border-border px-2.5 py-0.5 font-mono text-[10px] font-bold text-gold-700 dark:text-gold-400">
                {bureau.bureauCode}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-foreground">{bureau.name}</h1>
            <p className="text-xs font-semibold text-muted-foreground">
              Managed by <strong className="text-foreground">{bureau.ownerName}</strong>
            </p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 text-brand-600 shrink-0" />
              <span>{bureau.address}, {bureau.city}, {bureau.country}</span>
            </div>
            {bureau.description && <p className="pt-2 text-xs text-muted-foreground leading-relaxed">{bureau.description}</p>}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {phone ? (
            <a
              href={`https://wa.me/${phone.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-bold text-white hover:bg-emerald-700"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp Bureau Office
            </a>
          ) : (
            <div className="rounded-xl border border-border px-4 py-3 text-center text-xs text-muted-foreground">No WhatsApp provided</div>
          )}

          {bureau.phone && (
            <a
              href={`tel:${bureau.phone}`}
              className="flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-xs font-bold text-foreground hover:bg-muted"
            >
              <Phone className="h-4 w-4" /> Call {bureau.phone}
            </a>
          )}

          {bureau.email && (
            <a
              href={`mailto:${bureau.email}`}
              className="flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-xs font-bold text-foreground hover:bg-muted"
            >
              <Mail className="h-4 w-4" /> Email Bureau
            </a>
          )}
        </div>

        <div className="border-t border-border pt-5 flex flex-wrap gap-3">
          <Link
            href="/search?bureauScope=MY_BUREAU"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-brand-700"
          >
            <Building2 className="h-4 w-4" /> Browse Rishtas From My Bureau
          </Link>
          <Link
            href="/search?bureauScope=ALL"
            className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-xs font-semibold text-foreground hover:bg-muted"
          >
            <Compass className="h-4 w-4" /> Browse All Approved Platform Rishtas
          </Link>
        </div>
      </div>
    </div>
  );
}
