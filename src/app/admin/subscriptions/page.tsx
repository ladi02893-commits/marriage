'use client';

import { useAuth } from '@/lib/auth-context';

export default function AdminSubscriptionsPage() {
  const { plans } = useAuth();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Subscription plans</h1>
        <p className="mt-2 text-sm text-zinc-400">Current plan catalogue is shown below. Editing prices and benefits is disabled until a persistent plan-management workflow is connected.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <div key={plan.slug} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <h2 className="font-bold text-white">{plan.name}</h2>
            <p className="mt-2 text-xl font-bold text-amber-400">PKR {plan.monthlyPrice.toLocaleString()}</p>
            <p className="mt-2 text-xs text-zinc-400">{plan.connectionsLimit ?? plan.connectionLimit ?? 'Not specified'} connection credits</p>
            <ul className="mt-3 list-inside list-disc space-y-1 text-xs text-zinc-300">{plan.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
          </div>
        ))}
      </div>
    </div>
  );
}
