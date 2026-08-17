'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Crown,
  Sparkles,
  ShieldCheck,
  Zap,
  Lock,
  X,
  CheckCircle2,
  PhoneCall,
  MessageSquare,
  Heart,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { CheckoutModal } from './checkout-modal';

interface QuotaLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionAttempted?: 'INTEREST' | 'MESSAGE' | 'CONTACT' | 'PROFILE';
}

export function QuotaLimitModal({
  isOpen,
  onClose,
  actionAttempted = 'INTEREST',
}: QuotaLimitModalProps) {
  const { currentUser, connectionQuota } = useAuth();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState<string>('PREMIUM');

  if (!isOpen) return null;

  const actionText = {
    INTEREST: 'Send Connection & Matrimonial Interest',
    MESSAGE: 'Start Direct Chat & Messaging',
    CONTACT: 'Unlock Personal Phone & WhatsApp Details',
    PROFILE: 'Access Full Confidential Candidate Dossier',
  }[actionAttempted];

  const handleUpgradeClick = (planSlug: string) => {
    setSelectedPlanForUpgrade(planSlug);
    setIsCheckoutOpen(true);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
        <div
          className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-amber-500/40 bg-card text-card-foreground shadow-2xl transition-all"
          role="dialog"
          aria-modal="true"
        >
          {/* Top Decorative Gradient Banner */}
          <div className="relative bg-gradient-to-r from-amber-600 via-rose-600 to-amber-700 p-6 text-white text-center overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 rounded-full bg-black/20 p-1.5 text-white/80 hover:text-white hover:bg-black/40 transition"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 shadow-inner mb-3">
              <Crown className="h-7 w-7 text-amber-300 animate-pulse" />
            </div>

            <span className="inline-flex items-center gap-1 rounded-full bg-white/20 backdrop-blur-md px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-amber-100 mb-1 border border-white/20">
              <Sparkles className="h-3 w-3 text-amber-300" /> Account Limit Reached
            </span>

            <h3 className="text-xl font-bold font-serif text-white">
              Connection Quota Exhausted ({connectionQuota.used}/{connectionQuota.total} Used)
            </h3>
            <p className="text-xs text-amber-100/90 mt-1 max-w-sm mx-auto">
              Aapke account ki <strong>{connectionQuota.planName}</strong> limit poori ho chuki hai. Mazeed candidate profiles se rabta karne ke liye plan upgrade karein.
            </p>
          </div>

          {/* Body Content */}
          <div className="p-6 space-y-5">
            {/* Context Badge */}
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3.5 flex items-start gap-3">
              <Lock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-bold text-amber-900 dark:text-amber-300">
                  Action Blocked: {actionText}
                </p>
                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  Free accounts get <strong>2 initial connection interests</strong>. Upgrading unlocks continuous candidate connections, direct WhatsApp numbers, and dedicated matchmaker verification.
                </p>
              </div>
            </div>

            {/* Plan Comparison Cards */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-foreground uppercase tracking-wider">
                Select an Upgrade Tier:
              </p>

              {/* Tier 1: PREMIUM */}
              <div
                onClick={() => handleUpgradeClick('PREMIUM')}
                className="group relative flex items-center justify-between p-4 rounded-2xl border border-rose-500/40 bg-gradient-to-r from-rose-500/5 to-amber-500/5 hover:border-rose-500 hover:shadow-md transition cursor-pointer"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">Elite Executive (PREMIUM)</span>
                    <span className="rounded-full bg-rose-500 text-white text-[10px] font-extrabold px-2 py-0.5">
                      Most Popular
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    ✓ 50 Connection Interests/mo • Direct WhatsApp & Phone • Verified Shield
                  </p>
                </div>
                <div className="text-right shrink-0 pl-3">
                  <div className="text-sm font-black text-brand-600">PKR 15,000</div>
                  <div className="text-[10px] text-muted-foreground font-semibold">/ 30 Days</div>
                </div>
              </div>

              {/* Tier 2: VIP BESPOKE */}
              <div
                onClick={() => handleUpgradeClick('VIP')}
                className="group relative flex items-center justify-between p-4 rounded-2xl border border-amber-500/30 bg-card hover:border-amber-500 hover:shadow-md transition cursor-pointer"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">VIP Bespoke Matchmaking</span>
                    <span className="rounded-full bg-amber-500 text-black text-[10px] font-extrabold px-2 py-0.5">
                      VIP
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    ✓ Unlimited Connections • Dedicated Senior Matchmaker • 100% Guaranteed Privacy
                  </p>
                </div>
                <div className="text-right shrink-0 pl-3">
                  <div className="text-sm font-black text-amber-600">PKR 35,000</div>
                  <div className="text-[10px] text-muted-foreground font-semibold">/ 30 Days</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => handleUpgradeClick('PREMIUM')}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 via-rose-600 to-amber-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brand-600/25 hover:from-brand-700 hover:to-amber-700 transition cursor-pointer"
              >
                <Zap className="h-4 w-4" /> ⚡ Upgrade Now & Connect Immediately
              </button>

              <div className="flex items-center justify-between text-xs pt-1 px-1">
                <Link
                  href="/pricing"
                  onClick={onClose}
                  className="font-semibold text-muted-foreground hover:text-brand-600 transition flex items-center gap-1"
                >
                  View full pricing & features <ArrowRight className="h-3 w-3" />
                </Link>
                <button
                  type="button"
                  onClick={onClose}
                  className="font-semibold text-muted-foreground hover:text-foreground transition"
                >
                  Continue Browsing
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal with Multi-Payment Options */}
      {isCheckoutOpen && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => {
            setIsCheckoutOpen(false);
            onClose();
          }}
          planSlug={selectedPlanForUpgrade}
          planName={selectedPlanForUpgrade === 'VIP' ? 'VIP Bespoke Matchmaking' : 'Elite Executive Plan'}
          pricePKR={selectedPlanForUpgrade === 'VIP' ? 35000 : 15000}
        />
      )}
    </>
  );
}
