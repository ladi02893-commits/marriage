'use client';

import Link from 'next/link';
import { Crown, Mail, MessageCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function UserConsultantPage() {
  const { currentUser, consultants } = useAuth();
  const consultant = consultants.find((item) => item.id === currentUser?.assignedConsultantId);

  if (!consultant) {
    return (
      <div className="mx-auto max-w-3xl py-12">
        <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
          <Crown className="mx-auto h-10 w-10 text-gold-500" />
          <h1 className="mt-4 text-2xl font-bold font-serif text-foreground">No consultant assigned</h1>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            A consultant has not been assigned to your account. The app will show consultant details here only after an administrator makes a real assignment.
          </p>
          <Link href="/dashboard/support" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-xs font-bold text-white hover:bg-brand-700">
            <MessageCircle className="h-4 w-4" /> Contact support
          </Link>
        </div>
      </div>
    );
  }

  const phone = consultant.whatsappNumber || consultant.phone;
  return (
    <div className="mx-auto max-w-4xl space-y-6 py-8">
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <img src={consultant.photoUrl || consultant.avatarUrl || '/avatar-placeholder.svg'} alt={consultant.name} className="h-24 w-24 rounded-3xl border border-gold-500/40 object-cover" />
          <div className="flex-1">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <ShieldCheck className="h-3 w-3" /> Assigned consultant
            </span>
            <h1 className="mt-2 text-2xl font-bold font-serif text-foreground">{consultant.name}</h1>
            <p className="text-sm font-semibold text-gold-600">{consultant.title}</p>
            {consultant.bio && <p className="mt-3 text-sm text-muted-foreground">{consultant.bio}</p>}
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {phone ? (
            <a href={`https://wa.me/${phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-bold text-white hover:bg-emerald-700">
              <MessageCircle className="h-4 w-4" /> WhatsApp consultant
            </a>
          ) : <div className="rounded-xl border border-border px-4 py-3 text-center text-xs text-muted-foreground">No phone provided</div>}
          {consultant.email ? (
            <a href={`mailto:${consultant.email}`} className="flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-xs font-bold text-foreground hover:bg-muted">
              <Mail className="h-4 w-4" /> Email consultant
            </a>
          ) : <div className="rounded-xl border border-border px-4 py-3 text-center text-xs text-muted-foreground">No email provided</div>}
        </div>
      </div>
    </div>
  );
}
