'use client';

import React, { useState } from 'react';
import {
  HelpCircle,
  MessageSquare,
  Search,
  CheckCircle2,
  Clock,
  Send,
  Lock,
  UserCheck,
  Filter,
  Eye,
  AlertCircle,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { SupportTicket, SupportTicketStatus } from '@/lib/types';
import { toast } from 'sonner';

export default function AdminSupportManagementPage() {
  const { tickets, replySupportTicket, updateTicketStatus } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [staffReply, setStaffReply] = useState('');

  const filteredTickets = tickets.filter((t) => {
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchSubject = t.subject.toLowerCase().includes(q);
      const matchId = t.id.toLowerCase().includes(q);
      const matchEmail = t.userEmail && t.userEmail.toLowerCase().includes(q);
      const matchProfile = t.relatedProfileId && t.relatedProfileId.toLowerCase().includes(q);
      if (!matchSubject && !matchId && !matchEmail && !matchProfile) return false;
    }
    return true;
  });

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !staffReply.trim()) return;

    replySupportTicket(selectedTicket.id, staffReply.trim(), 'AGENT');
    toast.success(`Staff reply sent to ticket ${selectedTicket.id}`);
    setStaffReply('');

    // update local reference
    const updated = tickets.find((t) => t.id === selectedTicket.id);
    if (updated) setSelectedTicket(updated);
  };

  const handleStatusChange = (ticketId: string, status: SupportTicketStatus) => {
    updateTicketStatus(ticketId, status);
    toast.success(`Ticket ${ticketId} status updated to ${status}`);
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket((p) => (p ? { ...p, status } : null));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-500 mb-1">
            <HelpCircle className="h-4 w-4" /> Admin Helpdesk & Inquiries
          </div>
          <h1 className="text-2xl font-bold font-serif text-white">Support Tickets & Disputes</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Resolve member inquiries, investigate profile disputes, process connection refunds, and reply as senior staff.
          </p>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by ticket ID (SUP-000123), subject, email, or linked profile..."
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 pl-10 pr-4 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-2xl border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-xs text-zinc-300 focus:outline-none"
        >
          <option value="ALL">All Statuses</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="WAITING_FOR_USER">Waiting for User</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>

      {/* Main Grid: Ticket List + Selected Ticket Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Ticket Roster */}
        <div className="lg:col-span-6 space-y-3">
          {filteredTickets.length === 0 ? (
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-center text-xs text-zinc-400">
              No support tickets found matching your query.
            </div>
          ) : (
            filteredTickets.map((t) => (
              <div
                key={t.id}
                onClick={() => setSelectedTicket(t)}
                className={`rounded-2xl border p-4 cursor-pointer transition space-y-2 ${
                  selectedTicket?.id === t.id
                    ? 'border-amber-500 bg-zinc-800/80 shadow-md'
                    : 'border-zinc-800 bg-zinc-900 hover:bg-zinc-800/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                      {t.id}
                    </span>
                    <h4 className="font-bold text-xs text-white truncate max-w-[200px]">{t.subject}</h4>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                      t.status === 'RESOLVED'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : t.status === 'OPEN'
                        ? 'bg-blue-950 text-blue-300 border border-blue-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}
                  >
                    {t.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span>Category: {t.category}</span>
                  {t.relatedProfileId && (
                    <span className="font-mono text-amber-400">Linked: {t.relatedProfileId}</span>
                  )}
                  <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right: Selected Ticket Detail & Reply Thread */}
        <div className="lg:col-span-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl space-y-4 sticky top-24">
          {selectedTicket ? (
            <>
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-400">{selectedTicket.id}</span>
                    <h3 className="font-bold text-sm text-white font-serif">{selectedTicket.subject}</h3>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    From: {selectedTicket.userEmail || 'Member'} • Category: {selectedTicket.category}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => handleStatusChange(selectedTicket.id, e.target.value as SupportTicketStatus)}
                    className="rounded-xl border border-zinc-700 bg-zinc-950 px-2.5 py-1 text-xs text-zinc-200 focus:outline-none"
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="WAITING_FOR_USER">WAITING_FOR_USER</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>
              </div>

              {/* Messages Thread */}
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {selectedTicket.messages.map((m) => {
                  const isStaff = m.sender === 'AGENT';

                  return (
                    <div
                      key={m.id}
                      className={`p-3.5 rounded-2xl text-xs space-y-1 ${
                        isStaff
                          ? 'bg-amber-500/10 border border-amber-500/30 text-amber-200 ml-4'
                          : 'bg-zinc-950/80 border border-zinc-800 text-zinc-200 mr-4'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-zinc-400">
                        <strong className={isStaff ? 'text-amber-400' : 'text-white'}>
                          {m.senderName} {isStaff && '(Senior Staff)'}
                        </strong>
                        <span>{m.timestamp}</span>
                      </div>
                      <p className="leading-relaxed">{m.text}</p>
                    </div>
                  );
                })}
              </div>

              {/* Staff Reply Box */}
              <form onSubmit={handleReply} className="pt-2 border-t border-zinc-800 space-y-2">
                <textarea
                  rows={3}
                  required
                  value={staffReply}
                  onChange={(e) => setStaffReply(e.target.value)}
                  placeholder="Type official admin/concierge response..."
                  className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 p-3 text-xs text-white focus:border-amber-500 focus:outline-none resize-none"
                />
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleStatusChange(selectedTicket.id, 'RESOLVED')}
                    className="rounded-xl border border-emerald-800 bg-emerald-950/50 hover:bg-emerald-950 text-emerald-300 px-3 py-1.5 text-xs font-semibold"
                  >
                    Mark as Resolved
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold px-5 py-2 text-xs shadow-md flex items-center gap-1.5"
                  >
                    <Send className="h-3.5 w-3.5" /> Dispatch Reply
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="py-16 text-center text-xs text-zinc-500 space-y-2">
              <MessageSquare className="h-8 w-8 text-zinc-600 mx-auto" />
              <p>Select any support ticket from the list to view dialogue thread and send staff replies.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
