'use client';

import React, { useState } from 'react';
import { MessageCircle, X, Sparkles, Send, ShieldCheck } from 'lucide-react';

interface WhatsAppFloatingWidgetProps {
  phoneNumber?: string;
  defaultMessage?: string;
}

export function WhatsAppFloatingWidget({
  phoneNumber = '923001234567',
  defaultMessage = 'Assalam-o-Alaikum! I am interested in Compatible Matrimonials membership packages, registration, and rishta matchmaking services.',
}: WhatsAppFloatingWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customMsg, setCustomMsg] = useState(defaultMessage);

  const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
  const encodedText = encodeURIComponent(customMsg);
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedText}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end print:hidden">
      {/* Expanded Interactive Chat Preview Card */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 rounded-3xl border border-emerald-500/20 bg-card p-5 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/30">
                  <MessageCircle className="h-5 w-5 fill-white" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-emerald-500" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1">
                  Matrimonial Concierge <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                </h4>
                <p className="text-[10px] text-emerald-600 font-medium">Online • Typically replies instantly</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 text-muted-foreground hover:bg-muted transition"
              aria-label="Close WhatsApp chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="my-3 space-y-2 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 p-3 text-xs text-foreground">
            <div className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
              <Sparkles className="h-3 w-3" /> Automated Matchmaking Bot
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Welcome to <strong>Compatible Matrimonials</strong> ❤️. Need assistance with registration, package pricing, or manual payment verification (Easypaisa / JazzCash / Bank)?
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-muted-foreground block">
              Your Message to Concierge:
            </label>
            <textarea
              rows={2}
              value={customMsg}
              onChange={(e) => setCustomMsg(e.target.value)}
              className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-emerald-500 focus:outline-none resize-none"
            />

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/25 transition hover:from-emerald-700 hover:to-teal-700 active:scale-[0.99]"
            >
              <Send className="h-3.5 w-3.5" /> Start WhatsApp Chat
            </a>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-xl shadow-emerald-600/30 transition-all duration-300 hover:scale-105 active:scale-95"
        aria-label="Open WhatsApp Matchmaking Concierge"
      >
        {/* Pulse animation ring */}
        <span className="absolute -inset-1 rounded-full bg-emerald-500 opacity-30 blur-sm animate-ping group-hover:opacity-50" />

        {isOpen ? (
          <X className="h-6 w-6 transition" />
        ) : (
          <MessageCircle className="h-7 w-7 fill-white transition" />
        )}

        {/* Unread notification pill */}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-[10px] font-black text-white shadow">
            1
          </span>
        )}
      </button>
    </div>
  );
}
