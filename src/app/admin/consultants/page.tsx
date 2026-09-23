'use client';

import { UserRoundCog } from 'lucide-react';

export default function AdminConsultantsPage() {
  return (
    <div className="mx-auto max-w-3xl py-10">
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-center shadow-xl">
        <UserRoundCog className="mx-auto h-10 w-10 text-amber-500" />
        <h1 className="mt-4 text-2xl font-bold font-serif text-white">Consultant management is not active</h1>
        <p className="mx-auto mt-2 max-w-xl text-sm text-zinc-400">
          Consultant records and assignments do not yet have persistent backend tables. Add, assign, note, and recommendation controls are disabled so administrators cannot be shown false success messages.
        </p>
      </div>
    </div>
  );
}
