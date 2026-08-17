'use client';

import React, { useState } from 'react';
import { HelpCircle, MessageSquare, Plus, CheckCircle2, Clock, Send } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

export default function SupportTicketsPage() {
  const { tickets, currentUser } = useAuth();
  const [newTicketOpen, setNewTicketOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('PROFILE');
  const [message, setMessage] = useState('');

  const userTickets = tickets.filter((t) => t.userId === currentUser?.id);

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error('Please enter a subject and detailed description.');
      return;
    }

    toast.success('Support ticket created. An advisor will respond within 4 business hours.');
    setSubject('');
    setMessage('');
    setNewTicketOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-foreground">Support & Concierge Desk</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Submit inquiries regarding matrimonial matchmaking, verification documents, or technical assistance.
          </p>
        </div>

        <button
          onClick={() => setNewTicketOpen(!newTicketOpen)}
          className="inline-flex items-center gap-1.5 rounded-2xl bg-brand-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" /> Open New Ticket
        </button>
      </div>

      {/* New Ticket Form Modal/Box */}
      {newTicketOpen && (
        <div className="rounded-3xl border border-brand-200 bg-brand-50/40 p-6 shadow-md dark:border-brand-900 dark:bg-brand-950/20 animate-in fade-in duration-200">
          <h3 className="text-base font-bold text-foreground font-serif mb-4">Create New Support Inquiry</h3>
          <form onSubmit={handleCreateTicket} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Schedule VIP matchmaking consultation"
                  className="w-full rounded-xl border border-border bg-card p-2.5 text-xs text-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card p-2.5 text-xs text-foreground focus:outline-none"
                >
                  <option value="PROFILE">Profile & Matchmaking Consultation</option>
                  <option value="VERIFICATION">Identity Verification</option>
                  <option value="BILLING">Billing & Subscription</option>
                  <option value="TECHNICAL">Technical Issue</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Message Description</label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your inquiry in detail..."
                className="w-full rounded-xl border border-border bg-card p-3 text-xs text-foreground focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setNewTicketOpen(false)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-brand-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-brand-700"
              >
                Submit Ticket
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Ticket List */}
      <div className="space-y-4">
        {userTickets.map((t) => (
          <div key={t.id} className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-bold text-brand-600">#{t.id}</span>
                <h4 className="text-sm font-bold text-foreground">{t.subject}</h4>
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  t.status === 'RESOLVED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {t.status}
              </span>
            </div>

            {/* Messages in ticket */}
            <div className="space-y-3 pt-2">
              {t.messages.map((m) => (
                <div
                  key={m.id}
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                    m.sender === 'AGENT'
                      ? 'bg-brand-50/70 border border-brand-100 dark:bg-brand-950/30 dark:border-brand-900'
                      : 'bg-muted/40 border border-border'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-foreground">{m.senderName}</span>
                    <span className="text-[10px] text-muted-foreground">{m.timestamp}</span>
                  </div>
                  <p className="text-muted-foreground">{m.text}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
