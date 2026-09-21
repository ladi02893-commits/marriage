'use client';

import React, { useState } from 'react';
import {
  HelpCircle,
  MessageSquare,
  Plus,
  CheckCircle2,
  Clock,
  Send,
  Link as LinkIcon,
  Paperclip,
  ShieldAlert,
  Crown,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { SupportCategory } from '@/lib/types';
import { toast } from 'sonner';

export default function SupportTicketsPage() {
  const { tickets, currentUser, currentProfile, createSupportTicket, replySupportTicket } = useAuth();
  const [newTicketOpen, setNewTicketOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<SupportCategory>('CONNECTION_ISSUE');
  const [relatedProfileId, setRelatedProfileId] = useState('');
  const [message, setMessage] = useState('');
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});

  const userTickets = tickets.filter(
    (t) => t.userId === currentUser?.id || (currentUser?.email && t.userEmail === currentUser.email)
  );

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error('Please enter a ticket subject and description.');
      return;
    }

    createSupportTicket({
      subject,
      category,
      relatedProfileId: relatedProfileId.trim() || undefined,
      message,
    });

    setSubject('');
    setMessage('');
    setRelatedProfileId('');
    setNewTicketOpen(false);
  };

  const handleSendReply = (ticketId: string) => {
    const text = replyTextMap[ticketId];
    if (!text || !text.trim()) return;

    replySupportTicket(ticketId, text.trim());
    setReplyTextMap((prev) => ({ ...prev, [ticketId]: '' }));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300';
      case 'IN_PROGRESS':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
      case 'WAITING_FOR_USER':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300';
      case 'RESOLVED':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default:
        return 'bg-muted text-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-600 mb-1">
            <HelpCircle className="h-4 w-4" /> VIP Royal Helpdesk & Dispute Resolution
          </div>
          <h1 className="text-2xl font-bold font-serif text-foreground">Support & Helpdesk</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Submit inquiries regarding matrimonial connections, payment approvals, consultant appointments, or profile disputes.
          </p>
        </div>

        <button
          onClick={() => setNewTicketOpen(!newTicketOpen)}
          className="inline-flex items-center gap-1.5 rounded-2xl bg-brand-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-brand-700 transition"
        >
          <Plus className="h-4 w-4" /> Create Support Ticket
        </button>
      </div>

      {/* New Support Ticket Modal/Card (Section 46, 48, 49) */}
      {newTicketOpen && (
        <div className="rounded-3xl border border-gold-500/30 bg-card p-6 shadow-xl space-y-4 animate-in fade-in duration-200">
          <div className="border-b border-border pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-gold-500" />
              <h3 className="text-base font-bold text-foreground font-serif">
                Open Official Concierge Ticket
              </h3>
            </div>
            <span className="text-[11px] text-muted-foreground font-mono">Format: SUP-000123</span>
          </div>

          <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-semibold text-foreground block mb-1">Subject *</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Connection refund request for VRM-000008"
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-foreground focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as SupportCategory)}
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-foreground focus:border-brand-500 focus:outline-none font-medium"
                >
                  <option value="PAYMENT">Payment & Bank Transfer</option>
                  <option value="CONNECTION_ISSUE">Connection Credit & Contact Unlock</option>
                  <option value="CONSULTANT">Senior Family Consultant</option>
                  <option value="PROFILE">Profile Changes & Updates</option>
                  <option value="VERIFICATION">Identity & Document Verification</option>
                  <option value="REPORT_USER">Report Member / Dispute</option>
                  <option value="TECHNICAL">Technical Platform Problem</option>
                  <option value="ACCOUNT">Account Privacy & Security</option>
                  <option value="OTHER">Other Inquiry</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1 flex items-center justify-between">
                  <span>Related Profile ID (Optional)</span>
                  <span className="text-[10px] text-muted-foreground">Section 49</span>
                </label>
                <input
                  type="text"
                  value={relatedProfileId}
                  onChange={(e) => setRelatedProfileId(e.target.value)}
                  placeholder="e.g. VRM-000153"
                  className="w-full rounded-xl border border-border bg-muted/30 p-2.5 text-foreground focus:border-brand-500 focus:outline-none font-mono uppercase"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-foreground block mb-1">Detailed Message *</label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Explain the situation in detail. If this is a connection refund request, please specify the interaction details..."
                className="w-full rounded-xl border border-border bg-muted/30 p-3 text-foreground focus:border-brand-500 focus:outline-none resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setNewTicketOpen(false)}
                className="rounded-xl px-4 py-2 font-medium text-muted-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-brand-600 hover:bg-brand-700 px-6 py-2.5 font-bold text-white shadow-md transition"
              >
                Submit Ticket
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Ticket List */}
      <div className="space-y-4">
        {userTickets.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center">
            <HelpCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-base font-bold text-foreground">No active support tickets</h3>
            <p className="text-xs text-muted-foreground mt-1 mb-4">
              Need assistance with payment verification, connection credits, or consultant appointments? Open a ticket above.
            </p>
          </div>
        ) : (
          userTickets.map((t) => (
            <div key={t.id} className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-brand-700 dark:text-brand-300 bg-brand-100/70 dark:bg-brand-950/60 px-2.5 py-0.5 rounded-lg border border-brand-200 dark:border-brand-900">
                    {t.id}
                  </span>
                  <h4 className="text-sm font-bold text-foreground">{t.subject}</h4>
                </div>

                <div className="flex items-center gap-2">
                  {t.relatedProfileId && (
                    <span className="font-mono text-[10px] font-bold text-gold-700 dark:text-gold-300 bg-gold-50 dark:bg-gold-950/50 border border-gold-300/40 px-2 py-0.5 rounded">
                      Linked: {t.relatedProfileId}
                    </span>
                  )}
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(
                      t.status
                    )}`}
                  >
                    {t.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              {/* Message Thread */}
              <div className="space-y-3 pt-1">
                {t.messages.map((m) => {
                  const isStaff = m.sender === 'AGENT';

                  return (
                    <div
                      key={m.id}
                      className={`p-4 rounded-2xl text-xs leading-relaxed ${
                        isStaff
                          ? 'bg-brand-50/70 border border-brand-200/60 dark:bg-brand-950/30 dark:border-brand-900'
                          : 'bg-muted/40 border border-border'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`font-bold ${isStaff ? 'text-brand-700 dark:text-brand-300' : 'text-foreground'}`}>
                          {m.senderName} {isStaff && '• Senior Support Officer'}
                        </span>
                        <span className="text-[10px] text-muted-foreground">{m.timestamp}</span>
                      </div>
                      <p className="text-foreground/90">{m.text}</p>
                    </div>
                  );
                })}
              </div>

              {/* Reply Input */}
              {t.status !== 'CLOSED' && (
                <div className="pt-2 flex gap-2">
                  <input
                    type="text"
                    value={replyTextMap[t.id] || ''}
                    onChange={(e) =>
                      setReplyTextMap((prev) => ({ ...prev, [t.id]: e.target.value }))
                    }
                    placeholder="Type follow-up response to support officer..."
                    className="flex-1 rounded-xl border border-border bg-muted/30 p-2.5 text-xs text-foreground focus:border-brand-500 focus:outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSendReply(t.id);
                      }
                    }}
                  />
                  <button
                    onClick={() => handleSendReply(t.id)}
                    className="rounded-xl bg-brand-600 hover:bg-brand-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition flex items-center gap-1"
                  >
                    <Send className="h-3.5 w-3.5" /> Reply
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
