'use client';

import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Mail,
  Phone,
  Crown,
  Trash2,
  Send,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

export default function FamilyAccessPage() {
  const { currentUser, familyInvitations, inviteFamilyMember } = useAuth();

  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    familyMemberName: '',
    relationship: 'FATHER',
    email: '',
    phone: '',
    canViewMatches: true,
    canViewConnections: true,
    canFavoriteProfiles: true,
    canChatConsultant: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.familyMemberName || !formData.email) {
      toast.error('Family member name and email are required.');
      return;
    }

    const accessCode = `VIP-FAM-${Math.floor(100000 + Math.random() * 900000)}`;

    inviteFamilyMember({
      familyMemberName: formData.familyMemberName.trim(),
      relationship: formData.relationship,
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      accessCode,
      permissions: {
        canViewMatches: formData.canViewMatches,
        canViewConnections: formData.canViewConnections,
        canFavoriteProfiles: formData.canFavoriteProfiles,
        canChatConsultant: formData.canChatConsultant,
      },
    });

    setFormData({
      familyMemberName: '',
      relationship: 'FATHER',
      email: '',
      phone: '',
      canViewMatches: true,
      canViewConnections: true,
      canFavoriteProfiles: true,
      canChatConsultant: true,
    });
    setFormOpen(false);
    toast.success(`Access code ${accessCode} generated and dispatched!`);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-gold-500/40 bg-gold-500/10 px-3 py-0.5 text-xs font-bold text-gold-700 dark:text-gold-300 mb-1">
            <Crown className="h-3.5 w-3.5 text-gold-500" /> Section 28: Family Collaboration
          </div>
          <h1 className="text-2xl font-bold font-serif text-foreground">
            Family Member Access & Permissions
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Invite parents, guardians, or elder siblings to collaboratively review verified matrimonial matches with controlled permissions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setFormOpen(!formOpen)}
          className="inline-flex items-center gap-2 rounded-2xl bg-brand-900 text-gold-300 px-5 py-2.5 text-xs font-bold shadow-md hover:bg-brand-800 transition cursor-pointer"
        >
          <UserPlus className="h-4 w-4" /> Invite Family Member
        </button>
      </div>

      {/* Invite Modal / Expandable Card */}
      {formOpen && (
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-gold-500/40 bg-card p-6 sm:p-8 shadow-xl space-y-6 animate-in fade-in-50 duration-200"
        >
          <div className="border-b border-border pb-3">
            <h3 className="text-base font-bold font-serif text-foreground">
              Grant Delegated Access to a Family Member
            </h3>
            <p className="text-xs text-muted-foreground">
              A private access invite with restricted credentials will be provisioned.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-foreground block mb-1">Family Member Full Name *</label>
              <input
                type="text"
                required
                value={formData.familyMemberName}
                onChange={(e) => setFormData({ ...formData, familyMemberName: e.target.value })}
                placeholder="e.g. Tariq Khan (Father)"
                className="w-full rounded-xl border border-border bg-background p-2.5 text-foreground placeholder:text-muted-foreground focus:border-brand-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-foreground block mb-1">Relationship *</label>
              <select
                value={formData.relationship}
                onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                className="w-full rounded-xl border border-border bg-background p-2.5 text-foreground focus:border-brand-600 focus:outline-none"
              >
                <option value="FATHER">Father (Walid)</option>
                <option value="MOTHER">Mother (Walida)</option>
                <option value="GUARDIAN">Guardian / Elder</option>
                <option value="SIBLING">Brother / Sister</option>
                <option value="OTHER">Other Family Member</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-foreground block mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="walid.sahab@example.com"
                className="w-full rounded-xl border border-border bg-background p-2.5 text-foreground placeholder:text-muted-foreground focus:border-brand-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-foreground block mb-1">WhatsApp / Mobile Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+92 300 1234567"
                className="w-full rounded-xl border border-border bg-background p-2.5 text-foreground placeholder:text-muted-foreground focus:border-brand-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Granular Permissions */}
          <div className="space-y-3 pt-2 border-t border-border">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
              Permitted Privileges
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label className="flex items-center gap-2 p-3 rounded-2xl bg-muted/40 border border-border cursor-pointer hover:bg-muted/60 transition">
                <input
                  type="checkbox"
                  checked={formData.canViewMatches}
                  onChange={(e) => setFormData({ ...formData, canViewMatches: e.target.checked })}
                  className="rounded text-brand-600 focus:ring-brand-500 h-4 w-4"
                />
                <div>
                  <div className="font-bold text-foreground">View Match Directory</div>
                  <div className="text-[11px] text-muted-foreground">Can browse verified candidate profiles</div>
                </div>
              </label>

              <label className="flex items-center gap-2 p-3 rounded-2xl bg-muted/40 border border-border cursor-pointer hover:bg-muted/60 transition">
                <input
                  type="checkbox"
                  checked={formData.canFavoriteProfiles}
                  onChange={(e) => setFormData({ ...formData, canFavoriteProfiles: e.target.checked })}
                  className="rounded text-brand-600 focus:ring-brand-500 h-4 w-4"
                />
                <div>
                  <div className="font-bold text-foreground">Favorite Connections</div>
                  <div className="text-[11px] text-muted-foreground">Can mark favorite candidate connections</div>
                </div>
              </label>

              <label className="flex items-center gap-2 p-3 rounded-2xl bg-muted/40 border border-border cursor-pointer hover:bg-muted/60 transition">
                <input
                  type="checkbox"
                  checked={formData.canViewConnections}
                  onChange={(e) => setFormData({ ...formData, canViewConnections: e.target.checked })}
                  className="rounded text-brand-600 focus:ring-brand-500 h-4 w-4"
                />
                <div>
                  <div className="font-bold text-foreground">View Connection Hub</div>
                  <div className="text-[11px] text-muted-foreground">Can inspect inbound and outbound connections</div>
                </div>
              </label>

              <label className="flex items-center gap-2 p-3 rounded-2xl bg-muted/40 border border-border cursor-pointer hover:bg-muted/60 transition">
                <input
                  type="checkbox"
                  checked={formData.canChatConsultant}
                  onChange={(e) => setFormData({ ...formData, canChatConsultant: e.target.checked })}
                  className="rounded text-brand-600 focus:ring-brand-500 h-4 w-4"
                />
                <div>
                  <div className="font-bold text-foreground">Consultant Dialogue</div>
                  <div className="text-[11px] text-muted-foreground">Can message assigned Senior Family Consultant</div>
                </div>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-gold-500 hover:bg-gold-400 text-stone-950 px-5 py-2 text-xs font-bold shadow-md transition"
            >
              Send Family Invitation
            </button>
          </div>
        </form>
      )}

      {/* Invitations Roster */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="text-base font-bold font-serif text-foreground">
          Active Family Delegates ({familyInvitations.length})
        </h3>

        {familyInvitations.length === 0 ? (
          <div className="rounded-2xl bg-muted/30 border border-border p-8 text-center text-xs text-muted-foreground space-y-2">
            <Users className="h-8 w-8 text-muted-foreground mx-auto" />
            <div>No family members invited yet.</div>
            <p className="text-[11px]">
              Inviting parents ensures traditional family oversight with modern privacy safeguards.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {familyInvitations.map((inv) => (
              <div
                key={inv.id}
                className="rounded-2xl border border-border bg-background p-5 space-y-3 shadow-xs"
              >
                <div className="flex items-center justify-between border-b border-border pb-2.5">
                  <div>
                    <h4 className="font-bold text-sm text-foreground">{inv.familyMemberName}</h4>
                    <span className="text-[10px] font-bold text-brand-700 dark:text-brand-300 uppercase tracking-wider">
                      {inv.relationship}
                    </span>
                  </div>
                  <span className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 text-[10px] font-bold">
                    {inv.status}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{inv.email}</span>
                  </div>
                  {inv.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{inv.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 pt-1">
                    <Lock className="h-3.5 w-3.5 text-gold-500" />
                    <span>
                      Access Passcode: <strong className="font-mono text-foreground">{inv.accessCode}</strong>
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border flex flex-wrap gap-1.5 text-[10px]">
                  {inv.permissions.canViewMatches && (
                    <span className="bg-muted px-2 py-0.5 rounded text-foreground font-medium">
                      ✓ Matches
                    </span>
                  )}
                  {inv.permissions.canFavoriteProfiles && (
                    <span className="bg-muted px-2 py-0.5 rounded text-foreground font-medium">
                      ✓ Favorites
                    </span>
                  )}
                  {inv.permissions.canViewConnections && (
                    <span className="bg-muted px-2 py-0.5 rounded text-foreground font-medium">
                      ✓ Connections
                    </span>
                  )}
                  {inv.permissions.canChatConsultant && (
                    <span className="bg-muted px-2 py-0.5 rounded text-foreground font-medium">
                      ✓ Consultant Chat
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
