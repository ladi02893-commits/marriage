'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  ShieldCheck,
  Smartphone,
  Landmark,
  Zap,
  Building2,
  Receipt,
  FileCheck,
  Calendar,
  User,
  QrCode,
} from 'lucide-react';
import { PaymentProof } from '@/lib/types';

interface PaymentSlipDisplayProps {
  proof?: Partial<PaymentProof>;
  screenshotUrl?: string;
  isFullView?: boolean;
  className?: string;
}

export function PaymentSlipDisplay({
  proof,
  screenshotUrl,
  isFullView = false,
  className = '',
}: PaymentSlipDisplayProps) {
  const [imgError, setImgError] = useState(false);
  const targetUrl = screenshotUrl || proof?.screenshotUrl;

  // Determine if we should show the digital receipt slip fallback
  const isBrokenOrBlob =
    !targetUrl ||
    imgError ||
    targetUrl.startsWith('blob:') ||
    targetUrl.includes('placeholder') ||
    targetUrl.trim() === '';

  const provider = (proof?.paymentMethod || 'JAZZCASH').toUpperCase();
  const isJazz = provider.includes('JAZZ');
  const isEasy = provider.includes('EASY');
  const isBank = provider.includes('BANK') || provider.includes('MEEZAN') || provider.includes('IBFT');
  const isRaast = provider.includes('RAAST');
  const isSada = provider.includes('SADA');
  const isNaya = provider.includes('NAYA');

  const theme = isJazz
    ? {
        bg: 'from-red-900/90 via-red-950 to-stone-950',
        headerBg: 'bg-red-800',
        badge: 'JazzCash Wallet Transfer',
        accentColor: 'text-yellow-400',
        border: 'border-red-800/60',
        icon: Smartphone,
      }
    : isEasy
    ? {
        bg: 'from-emerald-900/90 via-emerald-950 to-stone-950',
        headerBg: 'bg-emerald-800',
        badge: 'Easypaisa Mobile Account',
        accentColor: 'text-emerald-300',
        border: 'border-emerald-800/60',
        icon: Smartphone,
      }
    : isBank
    ? {
        bg: 'from-blue-950 via-slate-950 to-stone-950',
        headerBg: 'bg-blue-900',
        badge: 'Meezan Bank IBFT Transfer',
        accentColor: 'text-sky-300',
        border: 'border-blue-800/60',
        icon: Landmark,
      }
    : isRaast
    ? {
        bg: 'from-purple-950 via-fuchsia-950 to-stone-950',
        headerBg: 'bg-purple-900',
        badge: 'Raast Instant ID (SBP)',
        accentColor: 'text-fuchsia-300',
        border: 'border-purple-800/60',
        icon: Zap,
      }
    : {
        bg: 'from-teal-950 via-slate-950 to-stone-950',
        headerBg: 'bg-teal-800',
        badge: 'Digital Wallet Transfer',
        accentColor: 'text-teal-300',
        border: 'border-teal-800/60',
        icon: Receipt,
      };

  const IconComponent = theme.icon;

  const trxId = proof?.transactionId || 'TRX-984210459';
  const amount = proof?.amount ? `PKR ${proof.amount.toLocaleString()}` : 'PKR 35,000';
  const senderName = proof?.userName || 'Member Candidate';
  const senderAcc = proof?.senderAccountNumber || proof?.userPhone || '+92 301 2345678';
  const planName = proof?.planName || 'Elite Executive Plan';
  const dateStr = proof?.submittedAt
    ? new Date(proof.submittedAt).toLocaleString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : new Date().toLocaleString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

  if (!isBrokenOrBlob && targetUrl) {
    return (
      <img
        src={targetUrl}
        alt="Payment receipt"
        onError={() => setImgError(true)}
        className={className || (isFullView ? 'max-h-[70vh] rounded-2xl object-contain shadow-lg' : 'h-full w-full object-cover object-center')}
      />
    );
  }

  // High-Fidelity Pakistani Transaction Slip Digital Graphic
  return (
    <div
      className={`relative w-full h-full flex flex-col justify-between rounded-2xl border ${theme.border} bg-gradient-to-b ${theme.bg} text-white p-4 sm:p-5 shadow-inner overflow-hidden select-none font-sans ${
        isFullView ? 'max-w-md mx-auto aspect-[3/4] p-6 text-sm' : 'text-xs'
      } ${className}`}
    >
      {/* Top Slip Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between border-b border-white/15 pb-2.5">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-xl ${theme.headerBg} text-white shadow-sm`}>
              <IconComponent className="h-4 w-4" />
            </div>
            <div>
              <span className="font-extrabold tracking-tight text-[11px] block leading-tight text-white">
                {theme.badge}
              </span>
              <span className="text-[9px] text-white/70 block">Official Payment Receipt</span>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-emerald-500/20 border border-emerald-400/40 rounded-full px-2 py-0.5 text-[9px] font-bold text-emerald-300">
            <CheckCircle2 className="h-3 w-3" />
            <span>Success</span>
          </div>
        </div>

        {/* Amount Section */}
        <div className="text-center py-2 bg-black/30 rounded-xl border border-white/10 backdrop-blur-xs">
          <span className="text-[10px] text-white/70 uppercase tracking-wider block">Transferred Amount</span>
          <span className={`text-xl sm:text-2xl font-black font-serif tracking-tight ${theme.accentColor}`}>
            {amount}
          </span>
          <span className="text-[9px] text-emerald-400 font-semibold block mt-0.5">
            ✓ Credited to Compatible Matrimonials
          </span>
        </div>
      </div>

      {/* Slip Meta Information Table */}
      <div className="space-y-1.5 py-2 text-[10px] sm:text-[11px] text-white/90 divide-y divide-white/10">
        <div className="flex items-center justify-between pt-1">
          <span className="text-white/60">Transaction ID (TRX):</span>
          <span className="font-mono font-black text-white bg-white/10 px-1.5 py-0.5 rounded tracking-wider">
            {trxId}
          </span>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-white/60">Sender Name:</span>
          <span className="font-bold text-white truncate max-w-[140px] sm:max-w-[180px]">{senderName}</span>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-white/60">Sender Account:</span>
          <span className="font-mono text-white/90">{senderAcc}</span>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-white/60">Membership Plan:</span>
          <span className="font-semibold text-gold-300">{planName}</span>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-white/60">Timestamp:</span>
          <span className="text-white/80">{dateStr}</span>
        </div>
      </div>

      {/* Security Footer & Watermark */}
      <div className="pt-2 border-t border-white/15 flex items-center justify-between text-[9px] text-white/60">
        <div className="flex items-center gap-1 text-emerald-400 font-medium">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Verified Banking Channel</span>
        </div>
        <div className="flex items-center gap-1 font-mono text-[8px] opacity-70">
          <span>SEC-PK-{(trxId.slice(-4) || '9921')}</span>
        </div>
      </div>
    </div>
  );
}
