'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Building2, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

export default function ConsultantPortalPage() {
  const router = useRouter();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) router.push('/login?redirect=/bureau');
    else if (currentUser.role === 'USER') router.push('/dashboard/consultant');
    else if (['BUREAU', 'CONSULTANT'].includes(currentUser.role)) router.push('/bureau');
  }, [currentUser, router]);

  if (!currentUser || ['USER', 'BUREAU', 'CONSULTANT'].includes(currentUser.role)) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 mx-auto max-w-3xl px-4 py-16 w-full">
        <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-sm space-y-4">
          <Building2 className="mx-auto h-10 w-10 text-gold-500" />
          <h1 className="text-2xl font-bold font-serif">Marriage Bureau Administration</h1>
          <p className="mx-auto max-w-xl text-sm text-muted-foreground">
            Manage registered Marriage Bureaus (Daftars), review pending bureau applications, and inspect bureau client directories from the Admin Control Room.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link href="/admin/consultants" className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-xs font-bold text-white hover:bg-brand-700">
              <ShieldCheck className="h-4 w-4" /> Open Admin Marriage Bureaus
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
