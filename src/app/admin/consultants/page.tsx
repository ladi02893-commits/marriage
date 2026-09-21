'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Crown,
  Users,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Phone,
  Mail,
  Search,
  UserCheck,
  Building,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Consultant } from '@/lib/types';
import { toast } from 'sonner';

export default function AdminConsultantsPage() {
  const { consultants, users, assignConsultant, addConsultant, deleteConsultant } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');

  // Add/Edit Consultant Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [consultantForm, setConsultantForm] = useState({
    name: '',
    title: 'Senior Family Matchmaking Consultant',
    phone: '+92 300 1234567',
    whatsappNumber: '+92 300 1234567',
    email: 'consultant@viproyalmatch.pk',
    experienceYears: 15,
    specialization: 'Prominent & Noble Families',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600',
    bio: 'Dedicated royal matchmaking consultant helping noble families connect with dignity and compatibility.',
  });

  const handleOpenAssign = (consultant: Consultant) => {
    setSelectedConsultant(consultant);
    setSelectedUserId('');
    setIsAssignModalOpen(true);
  };

  const handleAssignClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConsultant || !selectedUserId) {
      toast.error('Please select a member to assign.');
      return;
    }

    assignConsultant(selectedUserId, selectedConsultant.id);
    const assignedUser = users.find((u) => u.id === selectedUserId);
    toast.success(`Assigned ${assignedUser?.name || 'Member'} to ${selectedConsultant.name}.`);
    setIsAssignModalOpen(false);
  };

  const handleAddConsultant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consultantForm.name.trim()) {
      toast.error('Please enter consultant name.');
      return;
    }

    const newConsultant: Consultant = {
      id: `consultant-${Date.now()}`,
      name: consultantForm.name.trim(),
      title: consultantForm.title.trim() || 'Senior Family Matchmaking Consultant',
      phone: consultantForm.phone.trim() || '+92 300 1234567',
      whatsappNumber: consultantForm.whatsappNumber?.trim() || consultantForm.phone.trim() || '+92 300 1234567',
      email: consultantForm.email.trim() || `${consultantForm.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@viproyalmatch.pk`,
      experienceYears: Number(consultantForm.experienceYears) || 10,
      specialization: consultantForm.specialization.trim() || 'Prominent & Noble Families',
      avatarUrl: consultantForm.photoUrl,
      photoUrl: consultantForm.photoUrl,
      bio: consultantForm.bio || 'Dedicated royal matchmaking consultant helping noble families connect with dignity and compatibility.',
      assignedClientIds: [],
      isActive: true,
      rating: 5.0,
      consultationsCompleted: 0,
      availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      workingHours: '10:00 AM - 07:00 PM',
    };

    addConsultant(newConsultant);
    setIsAddModalOpen(false);
    setConsultantForm({
      name: '',
      title: 'Senior Family Matchmaking Consultant',
      phone: '+92 300 1234567',
      whatsappNumber: '+92 300 1234567',
      email: 'consultant@viproyalmatch.pk',
      experienceYears: 15,
      specialization: 'Prominent & Noble Families',
      photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600',
      bio: 'Dedicated royal matchmaking consultant helping noble families connect with dignity and compatibility.',
    });
  };

  // VIP members available for assignment
  const vipUsers = users.filter((u) => u.subscriptionTier === 'VIP' || u.subscriptionTier === 'PREMIUM_PLUS' || u.subscriptionTier === 'PREMIUM');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-500 mb-1">
            <Crown className="h-4 w-4" /> Senior Family Concierge Team
          </div>
          <h1 className="text-2xl font-bold font-serif text-white">Senior Family Consultants</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Add consultants, manage matrimonial assignments, assign high-net-worth VIP clients, and track concierge performance.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-2xl bg-amber-500 hover:bg-amber-400 px-4 py-2.5 text-xs font-bold text-black shadow-md transition"
        >
          <Plus className="h-4 w-4" /> Add Senior Consultant
        </button>
      </div>

      {/* Consultants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {consultants.map((c) => {
          const assignedCount = users.filter((u) => u.assignedConsultantId === c.id).length;

          return (
            <div
              key={c.id}
              className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl space-y-4 relative"
            >
              <div className="flex items-start gap-4">
                <img
                  src={c.photoUrl || c.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'}
                  alt={c.name}
                  className="h-16 w-16 rounded-2xl object-cover border border-amber-500/40 shrink-0"
                />
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold font-serif text-base text-white truncate">{c.name}</h3>
                    <span className="rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 text-[10px] font-bold">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-amber-400 font-medium truncate">{c.title}</p>
                  <p className="text-[11px] text-zinc-400 truncate">{c.specialization}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-zinc-800">
                <div className="p-2 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
                  <span className="text-[10px] text-zinc-500 block">Experience</span>
                  <strong className="text-zinc-200">{c.experienceYears || 15}+ Years</strong>
                </div>
                <div className="p-2 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
                  <span className="text-[10px] text-zinc-500 block">Assigned Clients</span>
                  <strong className="text-amber-400">{assignedCount} VIP Clients</strong>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleOpenAssign(c)}
                  className="flex-1 rounded-xl bg-amber-500/20 border border-amber-500/40 hover:bg-amber-500/30 text-amber-300 font-bold py-2 text-xs transition flex items-center justify-center gap-1"
                >
                  <UserCheck className="h-3.5 w-3.5" /> Assign Client
                </button>

                <Link
                  href="/consultant"
                  className="rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-2 text-xs font-semibold transition"
                >
                  Open Portal
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Are you sure you want to remove ${c.name} from the active consultant registry?`)) {
                      deleteConsultant(c.id);
                    }
                  }}
                  className="rounded-xl border border-rose-800/60 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 p-2 text-xs transition"
                  title="Remove Consultant"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Assign Client to Consultant */}
      {isAssignModalOpen && selectedConsultant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-white text-xs">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-amber-500" />
                <h4 className="font-bold text-sm">
                  Assign Client to {selectedConsultant.name}
                </h4>
              </div>
              <button onClick={() => setIsAssignModalOpen(false)} className="text-zinc-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleAssignClient} className="space-y-4">
              <div>
                <label className="font-semibold block mb-1">Select VIP Member</label>
                <select
                  required
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-zinc-200 focus:outline-none"
                >
                  <option value="">-- Choose Member --</option>
                  {vipUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.profileIdCode || 'VRM-000001'}) • {u.subscriptionTier}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="rounded-xl border border-zinc-700 px-4 py-2 text-zinc-400 hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold px-5 py-2 shadow-md"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Senior Consultant */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 text-white text-xs">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-amber-500" />
                <h4 className="font-bold text-sm">Register Senior Family Consultant</h4>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-zinc-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddConsultant} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={consultantForm.name}
                    onChange={(e) => setConsultantForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Dr. Tariq Mansoor"
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-zinc-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Title / Designation</label>
                  <input
                    type="text"
                    value={consultantForm.title}
                    onChange={(e) => setConsultantForm((p) => ({ ...p, title: e.target.value }))}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-zinc-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Direct Phone</label>
                  <input
                    type="text"
                    value={consultantForm.phone}
                    onChange={(e) => setConsultantForm((p) => ({ ...p, phone: e.target.value }))}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-zinc-200 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">WhatsApp Direct Number</label>
                  <input
                    type="text"
                    value={consultantForm.whatsappNumber}
                    onChange={(e) => setConsultantForm((p) => ({ ...p, whatsappNumber: e.target.value }))}
                    placeholder="+92 300 1234567"
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-zinc-200 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={consultantForm.experienceYears}
                    onChange={(e) => setConsultantForm((p) => ({ ...p, experienceYears: Number(e.target.value) }))}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-zinc-200 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Specialization</label>
                  <input
                    type="text"
                    value={consultantForm.specialization}
                    onChange={(e) => setConsultantForm((p) => ({ ...p, specialization: e.target.value }))}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 text-zinc-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl border border-zinc-700 px-4 py-2 text-zinc-400 hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold px-5 py-2 shadow-md"
                >
                  Save Consultant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
