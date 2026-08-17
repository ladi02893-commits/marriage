'use client';

import React, { useState } from 'react';
import { Heart, Send, Sparkles, X, MessageSquare, ShieldCheck } from 'lucide-react';
import { MatrimonialProfile } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

interface SendInterestModalProps {
  profile: MatrimonialProfile;
  isOpen: boolean;
  onClose: () => void;
}

const TEMPLATE_MESSAGES = [
  'Salam! Your profile and shared educational values resonated deeply. Would be honored to connect and introduce our families.',
  'Hello! I was very impressed by your career accomplishments and lifestyle outlook. I look forward to knowing you better.',
  'Greetings! I found our partner preferences and family background strongly aligned. Let us connect!',
];

export function SendInterestModal({ profile, isOpen, onClose }: SendInterestModalProps) {
  const { sendInterest, connectionQuota } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState<string>(TEMPLATE_MESSAGES[0]);
  const [customMessage, setCustomMessage] = useState<string>(TEMPLATE_MESSAGES[0]);
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  const handleSend = () => {
    if (connectionQuota.isReached) {
      toast.error(`Connection limit reached (${connectionQuota.used}/${connectionQuota.total}). Please upgrade your plan.`);
      window.location.href = '/pricing';
      return;
    }

    setIsSending(true);
    setTimeout(() => {
      const res = sendInterest(profile.id, customMessage);
      setIsSending(false);
      if (res.success) {
        toast.success(res.message);
        onClose();
      } else {
        toast.error(res.message);
        if (res.message.includes('limit')) {
          setTimeout(() => {
            window.location.href = '/pricing';
          }, 1000);
        }
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-brand-100 bg-white p-6 shadow-2xl dark:border-brand-950 dark:bg-card">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Header with Profile preview */}
        <div className="flex items-center gap-4 border-b border-border pb-5 mb-5">
          <img
            src={
              profile.photos?.[0]?.url ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
            }
            alt={profile.fullName}
            className="h-16 w-16 rounded-2xl object-cover ring-2 ring-brand-500/20"
          />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-foreground font-serif">Express Interest to {profile.displayName}</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              {profile.age} yrs • {profile.city}, {profile.country} • {profile.educationCareer?.profession}
            </p>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium">
              <ShieldCheck className="h-3.5 w-3.5" /> ID Verified Match
            </div>
          </div>
        </div>

        {/* Templates */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-2">
              Choose an Introduction Note:
            </label>
            <div className="space-y-2">
              {TEMPLATE_MESSAGES.map((msg, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedTemplate(msg);
                    setCustomMessage(msg);
                  }}
                  className={`w-full rounded-xl border p-3 text-left text-xs leading-relaxed transition ${
                    selectedTemplate === msg
                      ? 'border-brand-500 bg-brand-50/70 text-brand-900 font-medium dark:bg-brand-950/40 dark:text-brand-200'
                      : 'border-border bg-card text-muted-foreground hover:bg-muted'
                  }`}
                >
                  "{msg}"
                </button>
              ))}
            </div>
          </div>

          {/* Custom Message Field */}
          <div>
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider block mb-1.5">
              Or Customize Your Message:
            </label>
            <textarea
              rows={3}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full rounded-xl border border-border bg-muted/40 p-3 text-xs text-foreground focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              placeholder="Write a respectful, personalized message..."
            />
          </div>

          {/* Privacy & Quota Note */}
          {connectionQuota.isReached ? (
            <div className="rounded-2xl border border-rose-500/40 bg-rose-50/80 p-4 text-xs text-rose-900 dark:bg-rose-950/40 dark:text-rose-200 space-y-2">
              <div className="font-bold flex items-center gap-1.5">
                🔒 Connection Limit Reached ({connectionQuota.used}/{connectionQuota.total} Used)
              </div>
              <p className="text-[11px] leading-relaxed">
                You have reached your <strong>{connectionQuota.planName}</strong> limit of {connectionQuota.total} connection requests. Please upgrade your membership to unlock more candidates.
              </p>
            </div>
          ) : (
            <div className="rounded-xl bg-amber-50/70 p-3 text-[11px] text-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
              🔒 <strong>Matrimonial Etiquette:</strong> Your contact details and phone number will remain private until both parties accept the connection interest.
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-xs font-semibold text-muted-foreground hover:bg-muted"
          >
            Cancel
          </button>
          {connectionQuota.isReached ? (
            <a
              href="/pricing"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 px-6 py-2.5 text-xs font-semibold text-white shadow-md hover:from-amber-700 hover:to-rose-700"
            >
              ⚡ Upgrade Plan to Unlock
            </a>
          ) : (
            <button
              type="button"
              disabled={isSending}
              onClick={handleSend}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-rose-600 px-6 py-2.5 text-xs font-semibold text-white shadow-md shadow-brand-600/20 transition hover:from-brand-700 hover:to-rose-700 disabled:opacity-50"
            >
              {isSending ? (
                'Sending...'
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" /> Send Connection Interest
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
