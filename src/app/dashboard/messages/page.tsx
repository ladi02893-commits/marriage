'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, PhoneCall, Users, ArrowRight } from 'lucide-react';

export default function MessagesRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/dashboard/connections');
    }, 1500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="max-w-md w-full rounded-3xl border border-border bg-card p-8 text-center shadow-lg space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
          <PhoneCall className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-bold font-serif text-foreground">
          Direct Family Contacts
        </h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Direct in-app messaging has been updated. Once mutual connections are accepted, verified family phone numbers and WhatsApp links are unlocked directly inside your Connections dossier.
        </p>
        <div className="pt-2">
          <Link
            href="/dashboard/connections"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-900 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-brand-950 transition"
          >
            <Users className="h-4 w-4" /> Go to Connections <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
