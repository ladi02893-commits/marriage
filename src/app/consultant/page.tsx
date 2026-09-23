'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

export default function ConsultantPortalPage() {
  const router = useRouter();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) router.push('/login?redirect=/consultant');
    else if (currentUser.role === 'USER') router.push('/dashboard/consultant');
  }, [currentUser, router]);

  if (!currentUser || currentUser.role === 'USER') return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-16">
        <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
          <ShieldCheck className="mx-auto h-10 w-10 text-gold-500" />
          <h1 className="mt-4 text-2xl font-bold font-serif">Consultant workspace is not active</h1>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            Consultant assignments, private notes, recommendations, and appointment messaging do not yet have persistent backend storage. They are disabled so the interface cannot claim that unsaved work was completed.
          </p>
          <Link href="/admin" className="mt-6 inline-flex rounded-xl bg-brand-600 px-5 py-3 text-xs font-bold text-white hover:bg-brand-700">
            Return to admin dashboard
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
